from __future__ import annotations

"""
core.executor -- Execution dispatcher for approved review queue items.

When Michelle approves a review item, this module writes a targeted
instruction file to data/instructions/{agent}/ and then launches the
agent. The agent picks up the instruction on startup and executes
the specific action instead of running a generic scan.

Operating as COO with full autonomy:
  - Career: apply, outreach prep, pipeline triage -- all autonomous
  - Etsy: listings, order fulfillment, customer responses -- all autonomous
  - Affiliate: publish articles, SEO work -- all autonomous
  - Email: acknowledge and log (actual sends still gated per Michelle's rules)

Only gated actions:
  - Sending emails/messages externally
  - Posting on social media
  - Financial transactions
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from core import action_logger

BASE = Path("/Users/michellehumes/Managed Agents")
CRON_RUNNER = BASE / "cron-runner" / "run-agent.sh"
INSTRUCTIONS_DIR = BASE / "data" / "instructions"

# ---------------------------------------------------------------------------
# Result type
# ---------------------------------------------------------------------------

class ExecutionResult:
    """Outcome of executing an approved review item."""
    def __init__(self, success: bool, action_taken: str, detail: str = ""):
        self.success = success
        self.action_taken = action_taken
        self.detail = detail

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "action_taken": self.action_taken,
            "detail": self.detail,
            "executed_at": datetime.now(timezone.utc).isoformat(),
        }


# ---------------------------------------------------------------------------
# Instruction file writer
# ---------------------------------------------------------------------------

def _write_instruction(agent_name: str, instruction: dict) -> Path:
    """Write a targeted instruction JSON file for an agent to pick up.

    Returns the path to the created file.
    """
    agent_dir = INSTRUCTIONS_DIR / agent_name
    agent_dir.mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc)
    filename = f"{now.strftime('%Y%m%d-%H%M%S')}-{instruction.get('action', 'task')}.json"
    filepath = agent_dir / filename

    instruction["created_at"] = now.isoformat()
    instruction["status"] = "pending"

    filepath.write_text(json.dumps(instruction, indent=2, default=str), encoding="utf-8")
    return filepath


def _get_pending_instructions(agent_name: str) -> list[dict]:
    """Read all pending instruction files for an agent."""
    agent_dir = INSTRUCTIONS_DIR / agent_name
    if not agent_dir.is_dir():
        return []
    instructions = []
    for f in sorted(agent_dir.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            if data.get("status") == "pending":
                data["_filepath"] = str(f)
                instructions.append(data)
        except (json.JSONDecodeError, OSError):
            continue
    return instructions


def mark_instruction_done(filepath: str, result: str = "completed") -> None:
    """Mark an instruction file as completed (called by agents after execution)."""
    path = Path(filepath)
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        data["status"] = result
        data["completed_at"] = datetime.now(timezone.utc).isoformat()
        path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
    except (json.JSONDecodeError, OSError):
        pass


# ---------------------------------------------------------------------------
# Entity-specific executors
# ---------------------------------------------------------------------------

def _execute_job(item: dict) -> ExecutionResult:
    """Execute a career/job action with targeted instructions."""
    data = item.get("data", {})
    reason = item.get("reason", "")
    entity_id = item.get("entity_id", "")

    if data.get("ready_to_apply") or "ready" in reason.lower() or "apply" in reason.lower():
        instruction = {
            "action": "apply",
            "entity_id": entity_id,
            "company": data.get("company", ""),
            "role": data.get("role", data.get("title", "")),
            "url": data.get("url", data.get("link", "")),
            "detail": reason[:200],
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("career", instruction)
        return _launch_agent_with_instruction("career", "morning",
            f"Apply to {data.get('company', 'role')} -- {data.get('role', '')}",
            str(path))

    if "outreach" in reason.lower() or "follow-up" in reason.lower():
        instruction = {
            "action": "outreach",
            "entity_id": entity_id,
            "company": data.get("company", ""),
            "contact": data.get("contact", data.get("recruiter", "")),
            "detail": reason[:200],
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("career", instruction)
        return _launch_agent_with_instruction("career", "morning",
            f"Outreach/follow-up -- {data.get('company', reason[:60])}",
            str(path))

    if data.get("health_color") or "pipeline" in reason.lower():
        instruction = {
            "action": "pipeline_triage",
            "entity_id": entity_id,
            "detail": reason[:200],
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("career", instruction)
        return _launch_agent_with_instruction("career", "morning",
            f"Pipeline triage -- {reason[:80]}", str(path))

    # Generic career action
    instruction = {
        "action": "career_task",
        "entity_id": entity_id,
        "detail": reason[:200],
        "data": data,
        "source_review_id": item.get("review_id", ""),
    }
    path = _write_instruction("career", instruction)
    return _launch_agent_with_instruction("career", "morning",
        f"Career action -- {reason[:80]}", str(path))


def _execute_etsy(item: dict) -> ExecutionResult:
    """Execute an Etsy action with targeted instructions."""
    data = item.get("data", {})
    reason = item.get("reason", "")
    entity_id = item.get("entity_id", "")

    # Order fulfillment
    if data.get("ship_by") or data.get("order_id"):
        order_id = data.get("order_id", "unknown")
        customer = data.get("customer", "unknown")
        product = data.get("product", "")
        instruction = {
            "action": "fulfill_order",
            "entity_id": entity_id,
            "order_id": order_id,
            "customer": customer,
            "product": product,
            "ship_by": data.get("ship_by", "ASAP"),
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("etsy", instruction)
        return _launch_agent_with_instruction("etsy", "daily",
            f"Fulfill order #{order_id} for {customer}", str(path))

    # New listing / product launch
    if "listing" in reason.lower() or "product" in reason.lower() or data.get("total_packaged"):
        instruction = {
            "action": "create_listing",
            "entity_id": entity_id,
            "product_name": data.get("product_name", data.get("title", "")),
            "product_folder": data.get("folder", ""),
            "detail": reason[:200],
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("etsy", instruction)
        return _launch_agent_with_instruction("etsy", "daily",
            f"Create listing -- {data.get('product_name', reason[:60])}", str(path))

    # Customer messages
    if "message" in reason.lower() or "customer" in reason.lower():
        instruction = {
            "action": "respond_customer",
            "entity_id": entity_id,
            "customer": data.get("customer", data.get("from", "")),
            "detail": reason[:200],
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("etsy", instruction)
        return _launch_agent_with_instruction("etsy", "daily",
            f"Respond to customer -- {reason[:60]}", str(path))

    # Sale / pricing
    if "sale" in reason.lower() or "price" in reason.lower() or data.get("sale_end_date"):
        instruction = {
            "action": "pricing_update",
            "entity_id": entity_id,
            "detail": reason[:200],
            "data": data,
            "source_review_id": item.get("review_id", ""),
        }
        path = _write_instruction("etsy", instruction)
        return _launch_agent_with_instruction("etsy", "daily",
            f"Pricing/sale action -- {reason[:60]}", str(path))

    # Generic etsy action
    instruction = {
        "action": "etsy_task",
        "entity_id": entity_id,
        "detail": reason[:200],
        "data": data,
        "source_review_id": item.get("review_id", ""),
    }
    path = _write_instruction("etsy", instruction)
    return _launch_agent_with_instruction("etsy", "daily",
        f"Etsy action -- {reason[:80]}", str(path))


def _execute_email(item: dict) -> ExecutionResult:
    """Execute an email action.

    Acknowledge and log. Actual sending of replies/new emails is still
    gated -- only Michelle can authorize external sends.
    """
    data = item.get("data", {})
    reason = item.get("reason", "")
    entity_id = item.get("entity_id", "")
    sender = data.get("from", "unknown")
    action_needed = data.get("action_needed", "")

    if action_needed:
        send_words = ["reply", "respond", "send", "forward", "email"]
        is_send = any(w in action_needed.lower() for w in send_words)
        if not is_send:
            instruction = {
                "action": "email_task",
                "entity_id": entity_id,
                "from": sender,
                "action_needed": action_needed,
                "detail": reason[:200],
                "source_review_id": item.get("review_id", ""),
            }
            path = _write_instruction("gmail", instruction)
            return _launch_agent_with_instruction("gmail", "daily",
                f"Email action: {action_needed[:80]}", str(path))
        else:
            # Send action -- write instruction but don't auto-launch
            # This stays queued until Michelle explicitly approves the send
            instruction = {
                "action": "draft_send",
                "entity_id": entity_id,
                "from": sender,
                "action_needed": action_needed,
                "detail": reason[:200],
                "gated": True,
                "source_review_id": item.get("review_id", ""),
            }
            _write_instruction("gmail", instruction)
            return ExecutionResult(
                success=True,
                action_taken="email_send_queued",
                detail=f"Email from {sender} -- send action queued (requires Michelle's explicit approval): {action_needed}",
            )

    return ExecutionResult(
        success=True,
        action_taken="email_acknowledged",
        detail=f"Email from {sender} acknowledged -- {reason[:120]}",
    )


def _execute_affiliate(item: dict) -> ExecutionResult:
    """Execute an affiliate action with targeted instructions."""
    data = item.get("data", {})
    reason = item.get("reason", "")
    entity_id = item.get("entity_id", "")

    instruction = {
        "action": "affiliate_task",
        "entity_id": entity_id,
        "detail": reason[:200],
        "data": data,
        "source_review_id": item.get("review_id", ""),
    }
    path = _write_instruction("affiliate", instruction)
    return _launch_agent_with_instruction("affiliate", "daily",
        f"Affiliate action -- {reason[:80]}", str(path))


# ---------------------------------------------------------------------------
# Agent launcher (with instruction awareness)
# ---------------------------------------------------------------------------

def _launch_agent_with_instruction(
    agent_name: str, scan_type: str, reason: str, instruction_path: str
) -> ExecutionResult:
    """Launch a managed agent with a reference to its instruction file."""
    cmd = [str(CRON_RUNNER), agent_name, scan_type]
    try:
        subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            cwd=str(BASE),
        )
        return ExecutionResult(
            success=True,
            action_taken=f"instruction_queued:{agent_name}",
            detail=f"{reason} -- instruction at {instruction_path}",
        )
    except Exception as exc:
        return ExecutionResult(
            success=False,
            action_taken=f"agent_launch_failed:{agent_name}",
            detail=str(exc),
        )


# ---------------------------------------------------------------------------
# Main dispatch
# ---------------------------------------------------------------------------

EXECUTOR_MAP = {
    "job": _execute_job,
    "etsy_listing": _execute_etsy,
    "email": _execute_email,
    "affiliate_article": _execute_affiliate,
}


def execute_approved_item(item: dict) -> dict:
    """Dispatch execution for an approved review item.

    Args:
        item: The review queue item dict.

    Returns:
        ExecutionResult as a dict.
    """
    entity_type = item.get("entity_type", "other")
    executor = EXECUTOR_MAP.get(entity_type)

    if executor:
        result = executor(item)
    else:
        # Unknown type -- still try to do something useful
        agent_hint = item.get("agent", "")
        if agent_hint in ("career", "etsy", "gmail", "affiliate", "life-ops"):
            instruction = {
                "action": f"{entity_type}_task",
                "entity_id": item.get("entity_id", ""),
                "detail": item.get("reason", "")[:200],
                "data": item.get("data", {}),
                "source_review_id": item.get("review_id", ""),
            }
            path = _write_instruction(agent_hint, instruction)
            result = _launch_agent_with_instruction(
                agent_hint, "daily",
                f"{entity_type} action via {agent_hint}", str(path))
        else:
            result = ExecutionResult(
                success=True,
                action_taken="acknowledged",
                detail=f"Acknowledged '{entity_type}' item -- no specific executor, logged for follow-up",
            )

    # Audit log
    action_logger.log_action(
        source_event_id=item.get("source_event_id", ""),
        action_type=f"review_executed:{result.action_taken}",
        target_file=item.get("entity_id", ""),
        result="applied" if result.success else "failed",
        reason=result.detail,
    )

    return result.to_dict()
