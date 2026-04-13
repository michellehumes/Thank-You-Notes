#!/usr/bin/env python3
"""
run_rules_engine.py -- Main entry point for the Operations OS rules engine.

Processes new events, runs health checks, and rebuilds dashboard state.
Designed to be called by cron or manually.
"""

import json
import sys
from datetime import datetime, timezone, date
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path("/Users/michellehumes/Managed Agents")
sys.path.insert(0, str(PROJECT_ROOT))

from core.config_loader import load_system_config, load_rules_config, load_health_config
from core.event_schema import read_events_since, read_all_events, EVENTS_FILE
from core.file_utils import safe_read_json, atomic_write, safe_read_jsonl, ensure_dir
from core.review_queue import add_review_item, count_pending
from core.action_logger import log_action
from core.state_schema import create_default_system_state, create_default_dashboard_state, AGENT_NAMES

STATE_PATH = PROJECT_ROOT / "state"
CHECKPOINT_PATH = STATE_PATH / "processing_checkpoint.json"
SYSTEM_STATE_PATH = STATE_PATH / "system_state.json"
DASHBOARD_STATE_PATH = STATE_PATH / "dashboard_state.json"
HEALTH_LOG_PATH = STATE_PATH / "health_log.jsonl"


# ─── Checkpoint management ───────────────────────────────────────────────────

def load_checkpoint() -> int:
    """Load the last processed event offset."""
    data = safe_read_json(str(CHECKPOINT_PATH), {"last_offset": 0})
    return data.get("last_offset", 0)


def save_checkpoint(offset: int) -> None:
    """Save the processing checkpoint."""
    atomic_write(str(CHECKPOINT_PATH), {
        "last_offset": offset,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })


# ─── Rules engine: process new events ────────────────────────────────────────

def process_new_events() -> dict:
    """Process all events since the last checkpoint.

    Applies rules from rules.yaml:
    - auto_safe events are logged and counted
    - review_required events are added to the review queue
    - System state is updated with agent run info

    Returns a summary dict.
    """
    config = load_system_config()
    rules = load_rules_config()
    rules_event_types = {}

    # Load rules.yaml event_type definitions if available
    if "event_types" in rules:
        rules_event_types = rules["event_types"]

    offset = load_checkpoint()
    new_events = read_events_since(offset)

    if not new_events:
        return {"processed": 0, "review_queued": 0, "actions_logged": 0}

    # Load current system state
    sys_state = safe_read_json(str(SYSTEM_STATE_PATH))
    if not sys_state or "agents" not in sys_state:
        sys_state = create_default_system_state()

    processed = 0
    review_queued = 0
    actions_logged = 0
    today_str = date.today().isoformat()

    for event in new_events:
        event_type = event.get("event_type", "")
        agent = event.get("agent", "")
        rule = rules_event_types.get(event_type, {})

        # Determine auto_safe and review_required from rules, falling back to event flags
        is_auto_safe = rule.get("auto_safe", event.get("auto_safe", True))
        needs_review = rule.get("review_required", event.get("review_required", False))

        # Update agent state on run events
        if event_type == "agent_run_started" and agent in sys_state.get("agents", {}):
            sys_state["agents"][agent]["status"] = "running"
            sys_state["agents"][agent]["last_run"] = event.get("timestamp")

        elif event_type == "agent_run_completed" and agent in sys_state.get("agents", {}):
            sys_state["agents"][agent]["status"] = "idle"
            sys_state["agents"][agent]["last_run"] = event.get("timestamp")
            sys_state["agents"][agent]["failures"] = 0
            sys_state["agents"][agent]["events_today"] = (
                sys_state["agents"][agent].get("events_today", 0) + 1
            )

        elif event_type == "agent_run_failed" and agent in sys_state.get("agents", {}):
            sys_state["agents"][agent]["status"] = "failed"
            sys_state["agents"][agent]["failures"] = (
                sys_state["agents"][agent].get("failures", 0) + 1
            )

        # Queue review items for non-auto-safe events
        if needs_review:
            try:
                add_review_item(
                    source_event_id=event.get("event_id", ""),
                    agent=agent,
                    entity_type=event.get("entity_type", "other"),
                    entity_id=event.get("entity_id", ""),
                    reason=rule.get("description", event.get("summary", "Review required")),
                    priority=event.get("priority", "medium"),
                    proposed_action=event.get("proposed_action", ""),
                    data=event.get("data", {}),
                )
                review_queued += 1
            except Exception as e:
                print(f"  [WARN] Failed to queue review for {event_type}: {e}")

        # Log action for auto-safe events
        if is_auto_safe:
            try:
                log_action(
                    source_event_id=event.get("event_id", ""),
                    action_type=event_type,
                    target_file=event.get("source_file", ""),
                    result="applied",
                    reason=rule.get("description", event.get("summary", "")),
                )
                actions_logged += 1
            except Exception as e:
                print(f"  [WARN] Failed to log action for {event_type}: {e}")

        processed += 1

    # Update aggregate counts
    total_events_all = len(read_all_events())
    today_events = sum(
        1 for e in read_all_events()
        if e.get("timestamp", "").startswith(today_str)
    )
    sys_state["counts"] = {
        "total_events": total_events_all,
        "events_today": today_events,
        "review_queue_size": count_pending(),
        "blocked_items": sum(
            1 for a in sys_state.get("agents", {}).values()
            if a.get("status") == "failed"
        ),
        "failed_runs_today": sum(
            1 for a in sys_state.get("agents", {}).values()
            if a.get("failures", 0) > 0
        ),
    }
    sys_state["last_updated"] = datetime.now(timezone.utc).isoformat()

    # Save state and checkpoint
    atomic_write(str(SYSTEM_STATE_PATH), sys_state)
    save_checkpoint(offset + processed)

    return {"processed": processed, "review_queued": review_queued, "actions_logged": actions_logged}


# ─── Health engine ───────────────────────────────────────────────────────────

def run_health_check() -> dict:
    """Run health checks on all agents.

    Computes freshness scores and detects stale/failed agents.
    Returns a health summary dict.
    """
    config = load_system_config()
    health_config = load_health_config()
    sys_state = safe_read_json(str(SYSTEM_STATE_PATH))
    if not sys_state or "agents" not in sys_state:
        sys_state = create_default_system_state()

    now = datetime.now(timezone.utc)
    agent_configs = config.get("agents", {})

    # Load health_rules.yaml thresholds
    try:
        import yaml
        with open(PROJECT_ROOT / "config" / "health_rules.yaml", "r") as f:
            hr = yaml.safe_load(f) or {}
    except Exception:
        hr = {}

    global_hr = hr.get("global", {})
    stale_multiplier = global_hr.get("stale_threshold_multiplier", 1.5)
    warn_failures = global_hr.get("warning_failure_threshold", 2)
    decay_per_hour = global_hr.get("freshness_decay_per_hour", 10)
    freshness_floor = global_hr.get("freshness_floor", 0)
    degraded_thresh = global_hr.get("system_degraded_threshold", 2)
    failed_thresh = global_hr.get("system_failed_threshold", 4)
    agent_overrides = hr.get("agent_overrides", {})

    agent_health = {}
    stale_or_failed_count = 0

    for agent_name in AGENT_NAMES:
        agent_state = sys_state.get("agents", {}).get(agent_name, {})
        agent_cfg = agent_configs.get(agent_name, {})
        overrides = agent_overrides.get(agent_name, {}) or {}

        interval_hours = agent_cfg.get("schedule_interval_hours", 24)
        effective_multiplier = overrides.get("stale_threshold_multiplier", stale_multiplier)
        effective_decay = overrides.get("freshness_decay_per_hour", decay_per_hour)
        effective_warn = overrides.get("warning_failure_threshold", warn_failures)
        stale_hours = interval_hours * effective_multiplier

        last_run_str = agent_state.get("last_run")
        failures = agent_state.get("failures", 0)

        if not last_run_str:
            health_status = "unknown"
            freshness_score = 0
            hours_since = None
        else:
            try:
                last_run_dt = datetime.fromisoformat(last_run_str.replace("Z", "+00:00"))
                if last_run_dt.tzinfo is None:
                    last_run_dt = last_run_dt.replace(tzinfo=timezone.utc)
                hours_since = (now - last_run_dt).total_seconds() / 3600
            except (ValueError, TypeError):
                hours_since = 999
                last_run_dt = None

            freshness_score = max(freshness_floor, 100 - (hours_since * effective_decay))

            if failures >= effective_warn:
                health_status = "failed"
            elif hours_since > stale_hours:
                health_status = "stale"
            elif hours_since > (stale_hours * 0.75):
                health_status = "warning"
            else:
                health_status = "healthy"

        if health_status in ("stale", "failed"):
            stale_or_failed_count += 1

        agent_health[agent_name] = {
            "status": health_status,
            "freshness_score": round(freshness_score, 1) if freshness_score else 0,
            "hours_since_last_run": round(hours_since, 1) if hours_since is not None else None,
            "failures": failures,
            "stale_threshold_hours": round(stale_hours, 1),
        }

        # Update freshness in system state
        if agent_name in sys_state.get("agents", {}):
            sys_state["agents"][agent_name]["freshness"] = health_status
            sys_state["agents"][agent_name]["health"] = health_status

    # Compute system-level status
    if stale_or_failed_count >= failed_thresh:
        system_status = "failed"
    elif stale_or_failed_count >= degraded_thresh:
        system_status = "degraded"
    else:
        system_status = "ok"

    # Update counts to canonical schema
    from core.review_queue import count_pending
    sys_state["counts"] = {
        "pending_reviews": count_pending(),
        "pending_actions": sum(a.get("events_today", 0) for a in sys_state.get("agents", {}).values()),
        "failed_actions": sum(a.get("failures_today", 0) for a in sys_state.get("agents", {}).values()),
        "stale_agents": stale_or_failed_count,
        "alerts": stale_or_failed_count,
    }

    # Save updated system state
    sys_state["last_updated"] = datetime.now(timezone.utc).isoformat()
    atomic_write(str(SYSTEM_STATE_PATH), sys_state)

    # Append health log entry
    health_entry = {
        "timestamp": now.isoformat(),
        "system_status": system_status,
        "stale_or_failed_count": stale_or_failed_count,
        "agents": agent_health,
    }
    ensure_dir(STATE_PATH)
    with open(HEALTH_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(health_entry, default=str) + "\n")

    return {
        "system_status": system_status,
        "stale_or_failed": stale_or_failed_count,
        "agents": agent_health,
    }


# ─── Dashboard state builder ────────────────────────────────────────────────

def build_dashboard_state() -> dict:
    """Rebuild dashboard_state.json from current system state.

    Combines system state, recent events, review queue, and health
    into a single JSON snapshot for the life-tracker dashboard.
    """
    sys_state = safe_read_json(str(SYSTEM_STATE_PATH))
    if not sys_state or "agents" not in sys_state:
        sys_state = create_default_system_state()

    now = datetime.now(timezone.utc).isoformat()

    # Build agent grid
    agent_grid = {}
    for name in AGENT_NAMES:
        agent = sys_state.get("agents", {}).get(name, {})
        agent_grid[name] = {
            "status": agent.get("status", "idle"),
            "last_run": agent.get("last_run"),
            "events_today": agent.get("events_today", 0),
            "freshness": agent.get("freshness", "unknown"),
            "health": agent.get("health", agent.get("freshness", "unknown")),
        }

    # Recent events (last 50)
    all_events = read_all_events()
    recent = all_events[-50:] if all_events else []
    recent_events = [
        {
            "event_id": e.get("event_id"),
            "timestamp": e.get("timestamp"),
            "agent": e.get("agent"),
            "event_type": e.get("event_type"),
            "title": e.get("title"),
            "priority": e.get("priority"),
            "status": e.get("status"),
        }
        for e in reversed(recent)
    ]

    # Review queue preview (top 10 pending)
    from core.review_queue import list_pending_reviews
    pending = list_pending_reviews()
    review_preview = [
        {
            "review_id": r.get("review_id"),
            "agent": r.get("agent"),
            "reason": r.get("reason"),
            "priority": r.get("priority"),
            "created_at": r.get("created_at"),
        }
        for r in pending[:10]
    ]

    # Read health log for alerts
    health_entries = safe_read_jsonl(str(HEALTH_LOG_PATH))
    latest_health = health_entries[-1] if health_entries else {}
    system_status = latest_health.get("system_status", "ok")

    alerts = []
    if system_status == "degraded":
        alerts.append({
            "level": "warning",
            "message": "System degraded -- multiple agents stale or failed",
            "timestamp": now,
        })
    elif system_status == "failed":
        alerts.append({
            "level": "critical",
            "message": "System failed -- 4+ agents stale or failed",
            "timestamp": now,
        })

    # Check for stale agents in latest health
    for agent_name, agent_health in latest_health.get("agents", {}).items():
        if agent_health.get("status") in ("stale", "failed"):
            alerts.append({
                "level": "warning" if agent_health["status"] == "stale" else "critical",
                "message": f"{agent_name} agent is {agent_health['status']}",
                "timestamp": now,
            })

    # Build domain summaries from data files
    data_path = PROJECT_ROOT / "data"

    # Career summary
    career_summary = {"active_applications": 0, "new_matches": 0, "interviews_scheduled": 0,
                      "top_lead": None, "pipeline_health": "empty"}
    jobs_csv = data_path / "job-tracker" / "jobs.csv"
    if jobs_csv.exists():
        import csv
        with open(jobs_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        active = [r for r in rows if r.get("status") not in (
            "rejected_location", "rejected_location_and_fit", "rejected_location_and_comp",
            "killed_comp", "recommended_skip", "likely_expired_missed"
        )]
        career_summary["active_applications"] = len(active)
        interviews = [r for r in rows if "interview" in r.get("status", "").lower()]
        career_summary["interviews_scheduled"] = len(interviews)
        if active:
            tier1 = [r for r in active if r.get("priority_tier", "").startswith("1")]
            career_summary["top_lead"] = tier1[0].get("company") if tier1 else active[0].get("company")
            career_summary["pipeline_health"] = "active" if len(active) >= 3 else "thin"

    # Affiliate summary
    affiliate_summary = {"articles_live": 0, "articles_queued": 0, "clicks_today": 0,
                         "revenue_mtd": 0.0, "top_article": None}
    aff_state = safe_read_json(str(data_path / "affiliate" / "state.json"))
    if aff_state:
        articles = aff_state.get("articles_produced", [])
        deployed = [a for a in articles if a.get("deployed") or a.get("status") == "deployed"]
        affiliate_summary["articles_live"] = len(deployed)
        affiliate_summary["articles_queued"] = len(articles) - len(deployed)
        if deployed:
            affiliate_summary["top_article"] = deployed[-1].get("title")

    # Fertility summary
    fertility_summary = {"cycle_day": None, "phase": None, "next_appointment": None, "notes": ""}
    fert_state = safe_read_json(str(data_path / "fertility" / "state.json"))
    if fert_state:
        today_data = fert_state.get("today", {})
        fertility_summary["cycle_day"] = today_data.get("cycle_day")
        fertility_summary["phase"] = today_data.get("phase")
        preds = fert_state.get("predictions", {})
        if preds.get("fertile_window_start"):
            fertility_summary["notes"] = f"Fertile window: {preds['fertile_window_start']} to {preds.get('fertile_window_end', '?')}"

    # Etsy summary (placeholder -- needs live data from Claude in Chrome)
    etsy_summary = {"revenue_today": 0.0, "revenue_mtd": 0.0, "orders_today": 0,
                    "active_listings": 0, "top_product": None, "shop_health": "unknown"}

    dashboard = {
        "generated_at": now,
        "global_status": system_status,
        "agent_grid": agent_grid,
        "recent_events": recent_events,
        "review_queue_preview": review_preview,
        "alerts": alerts,
        "career_summary": career_summary,
        "etsy_summary": etsy_summary,
        "fertility_summary": fertility_summary,
        "affiliate_summary": affiliate_summary,
        "tomorrow_priorities": [],
        "decisions_needed": [
            {
                "review_id": r.get("review_id"),
                "reason": r.get("reason"),
                "priority": r.get("priority"),
            }
            for r in pending[:5]
        ],
    }

    atomic_write(str(DASHBOARD_STATE_PATH), dashboard)
    return dashboard


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print(f"Operations OS Rules Engine -- {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    # 1. Process new events
    print("\n[1/3] Processing new events...")
    result = process_new_events()
    print(f"  Processed: {result['processed']}")
    print(f"  Review queued: {result['review_queued']}")
    print(f"  Actions logged: {result['actions_logged']}")

    # 2. Run health check
    print("\n[2/3] Running health check...")
    health = run_health_check()
    print(f"  System status: {health['system_status']}")
    print(f"  Stale/failed agents: {health['stale_or_failed']}")
    for agent, info in health["agents"].items():
        score = info.get("freshness_score", 0)
        status = info.get("status", "unknown")
        print(f"    {agent}: {status} (freshness: {score})")

    # 3. Rebuild dashboard state
    print("\n[3/3] Rebuilding dashboard state...")
    dashboard = build_dashboard_state()
    print(f"  Global status: {dashboard['global_status']}")
    print(f"  Recent events: {len(dashboard['recent_events'])}")
    print(f"  Review queue: {len(dashboard['review_queue_preview'])}")
    print(f"  Alerts: {len(dashboard['alerts'])}")

    print("\n" + "=" * 60)
    print("Done.")
    print("=" * 60)


if __name__ == "__main__":
    main()
