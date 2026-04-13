from __future__ import annotations

"""
core.rules_engine -- Central deterministic rules engine for Managed Agents OS.

Reads new events since the last checkpoint from state/events.jsonl,
dispatches each to a handler by event_type, and updates system state.
All actions are logged, risky items routed to the review queue, and
entities deduplicated through the registry.
"""

from datetime import datetime, timezone
from typing import Any, Callable, Optional

from core import event_schema
from core import dedupe
from core import review_queue
from core import action_logger
from core import state_manager
from core.file_utils import safe_read_json, atomic_write

CHECKPOINT_PATH = "/Users/michellehumes/Managed Agents/state/processing_checkpoint.json"

_DEFAULT_CHECKPOINT = {
    "last_processed_line": 0,
    "last_processed_at": "",
    "last_health_rebuild": "",
}

# ---------------------------------------------------------------------------
# Life Ops event restriction
# ---------------------------------------------------------------------------
# Life Ops may only emit meta/system events, not domain events belonging to
# other agents. Domain events from life-ops are downgraded to info unless
# explicitly tagged as synthesized meta-events via data.is_meta=true.

LIFE_OPS_ALLOWED_EVENT_TYPES = frozenset([
    "agent_run_started",
    "agent_run_completed",
    "agent_run_failed",
    "life_ops_briefing_created",
    "dashboard_refresh_requested",
    "system_alert_created",
    "decision_needed_created",
    "stale_agent_detected",
    "pipeline_health_computed",
])

def _is_life_ops_domain_violation(event: dict) -> bool:
    """Return True if life-ops emitted a domain event it shouldn't own."""
    if event.get("agent") != "life-ops":
        return False
    if event.get("event_type") in LIFE_OPS_ALLOWED_EVENT_TYPES:
        return False
    if event.get("data", {}).get("is_meta", False):
        return False
    return True


# ---------------------------------------------------------------------------
# Checkpoint management
# ---------------------------------------------------------------------------

def _load_checkpoint(path: Optional[str] = None) -> dict[str, Any]:
    path = path or CHECKPOINT_PATH
    data = safe_read_json(path)
    if not data or "last_processed_line" not in data:
        return dict(_DEFAULT_CHECKPOINT)
    return data


def _save_checkpoint(checkpoint: dict[str, Any], path: Optional[str] = None) -> None:
    path = path or CHECKPOINT_PATH
    checkpoint["last_processed_at"] = datetime.now(timezone.utc).isoformat()
    atomic_write(path, checkpoint)


# ---------------------------------------------------------------------------
# Handler helpers
# ---------------------------------------------------------------------------

def _add_to_review(event: dict, reason: str) -> None:
    """Route an event to the review queue."""
    review_queue.add_review_item(
        source_event_id=event.get("event_id", ""),
        agent=event.get("agent", "system"),
        entity_type=event.get("entity_type", "other"),
        entity_id=event.get("entity_id", ""),
        reason=reason,
        priority=event.get("priority", "medium"),
        proposed_action=event.get("proposed_action", ""),
        data=event.get("data", {}),
    )


def _log(event: dict, action_type: str, result: str, reason: str = "") -> None:
    """Write an entry to the action log."""
    action_logger.log_action(
        source_event_id=event.get("event_id", ""),
        action_type=action_type,
        target_file=event.get("source_file", ""),
        result=result,
        reason=reason or event.get("summary", ""),
    )


def _register(event: dict, entity_type_key: str) -> None:
    """Register an entity in the dedupe registry."""
    dedupe.register_entity(
        entity_hash=event.get("hash", ""),
        entity_type=entity_type_key,
        entity_id=event.get("entity_id", ""),
        title=event.get("title", ""),
    )


def _is_dupe(event: dict) -> bool:
    """Check whether this event's hash is already registered."""
    return dedupe.is_duplicate(event.get("hash", ""))


# ---------------------------------------------------------------------------
# CAREER handlers
# ---------------------------------------------------------------------------

def _handle_new_job_found(event: dict, state: dict) -> None:
    if _is_dupe(event):
        _log(event, "new_job_found", "skipped", "duplicate entity")
        return
    _register(event, "career_job")
    _log(event, "new_job_found", "applied")
    state_manager.increment_agent_events("career")
    if event.get("review_required", False):
        _add_to_review(event, "New job match requires review before applying")


def _handle_job_status_changed(event: dict, state: dict) -> None:
    _log(event, "job_status_changed", "applied",
         f"Status changed: {event.get('summary', '')}")
    state_manager.increment_agent_events("career")


def _handle_outreach_draft_created(event: dict, state: dict) -> None:
    _add_to_review(event, "Outreach draft requires approval before sending")
    _log(event, "outreach_draft_created", "queued", "Sent to review queue")
    state_manager.increment_agent_events("career")


def _handle_recruiter_email_detected(event: dict, state: dict) -> None:
    if not _is_dupe(event):
        _register(event, "email")
    _log(event, "recruiter_email_detected", "applied")
    state_manager.increment_agent_events("career")


# ---------------------------------------------------------------------------
# ETSY handlers
# ---------------------------------------------------------------------------

def _handle_etsy_product_idea_created(event: dict, state: dict) -> None:
    _register(event, "etsy_product")
    _log(event, "etsy_product_idea_created", "applied")
    state_manager.increment_agent_events("etsy")


def _handle_etsy_listing_ready(event: dict, state: dict) -> None:
    _add_to_review(event, "Listing publish requires approval")
    _log(event, "etsy_listing_ready", "queued", "Sent to review queue")
    state_manager.increment_agent_events("etsy")


def _handle_etsy_customer_message_detected(event: dict, state: dict) -> None:
    _log(event, "etsy_customer_message_detected", "applied", "Auto-safe: logged")
    state_manager.increment_agent_events("etsy")


# ---------------------------------------------------------------------------
# GMAIL handlers
# ---------------------------------------------------------------------------

def _handle_important_email_detected(event: dict, state: dict) -> None:
    if not _is_dupe(event):
        _register(event, "email")
    _log(event, "important_email_detected", "applied")
    state_manager.increment_agent_events("gmail")


def _handle_gmail_draft_created(event: dict, state: dict) -> None:
    _log(event, "gmail_draft_created", "applied")
    state_manager.increment_agent_events("gmail")


# ---------------------------------------------------------------------------
# FERTILITY handlers
# ---------------------------------------------------------------------------

def _handle_fertility_cycle_updated(event: dict, state: dict) -> None:
    _log(event, "fertility_cycle_updated", "applied", "Auto-safe: cycle data updated")
    state_manager.increment_agent_events("fertility")


def _handle_ovulation_window_updated(event: dict, state: dict) -> None:
    _log(event, "ovulation_window_updated", "applied", "Auto-safe: window updated")
    state_manager.increment_agent_events("fertility")


# ---------------------------------------------------------------------------
# AFFILIATE handlers
# ---------------------------------------------------------------------------

def _handle_affiliate_article_created(event: dict, state: dict) -> None:
    if _is_dupe(event):
        _log(event, "affiliate_article_created", "skipped", "duplicate entity")
        return
    _register(event, "affiliate_article")
    _log(event, "affiliate_article_created", "applied")
    state_manager.increment_agent_events("affiliate")


def _handle_affiliate_article_published(event: dict, state: dict) -> None:
    # Update last_seen on the existing registry entry via is_duplicate side effect
    _is_dupe(event)
    _log(event, "affiliate_article_published", "applied")
    state_manager.increment_agent_events("affiliate")


# ---------------------------------------------------------------------------
# SYSTEM handlers
# ---------------------------------------------------------------------------

def _handle_agent_run_started(event: dict, state: dict) -> None:
    agent_name = event.get("data", {}).get("agent_name") or event.get("agent", "system")
    state_manager.mark_agent_running(agent_name)
    _log(event, "agent_run_started", "applied", f"{agent_name} started")


def _handle_agent_run_completed(event: dict, state: dict) -> None:
    agent_name = event.get("data", {}).get("agent_name") or event.get("agent", "system")
    output_path = event.get("data", {}).get("output_path", "")
    state_manager.mark_agent_completed(agent_name, output_path)
    _log(event, "agent_run_completed", "applied", f"{agent_name} completed")


def _handle_agent_run_failed(event: dict, state: dict) -> None:
    agent_name = event.get("data", {}).get("agent_name") or event.get("agent", "system")
    state_manager.increment_agent_failures(agent_name)
    _log(event, "agent_run_failed", "failed", f"{agent_name} failed: {event.get('summary', '')}")


def _handle_stale_agent_detected(event: dict, state: dict) -> None:
    agent_name = event.get("data", {}).get("agent_name") or event.get("entity_id", "")
    _log(event, "stale_agent_detected", "applied", f"Alert: {agent_name} is stale")
    # Update the agent status to stale if we know which agent
    if agent_name and agent_name in state.get("agents", {}):
        state["agents"][agent_name]["status"] = "stale"


def _handle_dashboard_refresh_requested(event: dict, state: dict) -> None:
    _log(event, "dashboard_refresh_requested", "applied")


def _handle_decision_needed_created(event: dict, state: dict) -> None:
    _add_to_review(event, event.get("summary", "Decision needed"))
    _log(event, "decision_needed_created", "queued", "Routed to review queue")


def _handle_system_alert_created(event: dict, state: dict) -> None:
    _log(event, "system_alert_created", "applied", event.get("summary", ""))


# ---------------------------------------------------------------------------
# Default handler for unrecognized event types
# ---------------------------------------------------------------------------

def _handle_unknown(event: dict, state: dict) -> None:
    _log(event, event.get("event_type", "unknown"), "applied",
         f"Info: unrecognized event type '{event.get('event_type', '')}'")


# ---------------------------------------------------------------------------
# Handler registry
# ---------------------------------------------------------------------------

HANDLER_REGISTRY: dict[str, Callable[[dict, dict], None]] = {
    # Career
    "new_job_found": _handle_new_job_found,
    "job_status_changed": _handle_job_status_changed,
    "outreach_draft_created": _handle_outreach_draft_created,
    "recruiter_email_detected": _handle_recruiter_email_detected,
    # Etsy
    "etsy_product_idea_created": _handle_etsy_product_idea_created,
    "etsy_listing_ready": _handle_etsy_listing_ready,
    "etsy_customer_message_detected": _handle_etsy_customer_message_detected,
    # Gmail
    "important_email_detected": _handle_important_email_detected,
    "gmail_draft_created": _handle_gmail_draft_created,
    # Fertility
    "fertility_cycle_updated": _handle_fertility_cycle_updated,
    "ovulation_window_updated": _handle_ovulation_window_updated,
    # Affiliate
    "affiliate_article_created": _handle_affiliate_article_created,
    "affiliate_article_published": _handle_affiliate_article_published,
    # System
    "agent_run_started": _handle_agent_run_started,
    "agent_run_completed": _handle_agent_run_completed,
    "agent_run_failed": _handle_agent_run_failed,
    "stale_agent_detected": _handle_stale_agent_detected,
    "dashboard_refresh_requested": _handle_dashboard_refresh_requested,
    "decision_needed_created": _handle_decision_needed_created,
    "system_alert_created": _handle_system_alert_created,
}


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def process_new_events(
    checkpoint_path: Optional[str] = None,
    events_file: Optional[str] = None,
) -> int:
    """Read events since the last checkpoint, process each, update checkpoint.

    Args:
        checkpoint_path: Override for the checkpoint file location.
        events_file: Override for the events JSONL file location.

    Returns:
        Number of events processed in this run.
    """
    checkpoint_path = checkpoint_path or CHECKPOINT_PATH
    checkpoint = _load_checkpoint(checkpoint_path)
    offset = checkpoint.get("last_processed_line", 0)

    # Daily counter reset: if last checkpoint was from a different day, reset
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_date = checkpoint.get("last_processed_at", "")[:10]
    if last_date and last_date != today:
        state_manager.reset_daily_counters()

    # Read new events since the last checkpoint line
    new_events = event_schema.read_events_since(offset=offset, events_file=events_file)

    if not new_events:
        _save_checkpoint(checkpoint, checkpoint_path)
        return 0

    # Load state once for the batch
    state = state_manager.load_state()

    processed = 0
    for event in new_events:
        # Validate the event structure
        is_valid, errors = event_schema.validate_event(event)
        if not is_valid:
            _log(event, "validation_error", "failed",
                 f"Invalid event skipped: {'; '.join(errors)}")
            processed += 1
            continue

        # Skip seed events from production processing
        if event.get("is_seed", False):
            _log(event, event.get("event_type", "seed"), "skipped",
                 "Seed event excluded from production processing")
            processed += 1
            continue

        # Enforce Life Ops event restriction
        if _is_life_ops_domain_violation(event):
            _log(event, event.get("event_type", ""), "skipped",
                 f"Life Ops may not emit domain event '{event.get('event_type')}' "
                 f"without data.is_meta=true")
            processed += 1
            continue

        # Dispatch to the appropriate handler
        event_type = event.get("event_type", "")
        handler = HANDLER_REGISTRY.get(event_type, _handle_unknown)
        try:
            handler(event, state)
        except Exception as exc:
            _log(event, event_type, "failed", f"Handler error: {exc}")

        processed += 1

    # Update checkpoint
    checkpoint["last_processed_line"] = offset + processed
    _save_checkpoint(checkpoint, checkpoint_path)

    # Final state save with recomputed counts
    state_manager.update_counts(state)
    state_manager.save_state(state)

    return processed
