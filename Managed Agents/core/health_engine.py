from __future__ import annotations

"""
core.health_engine -- Deterministic agent health computation.

Computes agent health from system_state.json facts (timestamps, failure
counts, event volumes), not from narrative logs.

Health statuses: healthy, warning, stale, failed, idle, running
Freshness score: 0-100 integer, decays linearly past expected window.
"""

from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Optional

from core.file_utils import safe_read_json, atomic_write, append_jsonl
from core.config_loader import get_state_path
from core.review_queue import count_pending
from core.state_schema import AGENT_NAMES, create_default_system_state

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

STATE_DIR = get_state_path()
SYSTEM_STATE_PATH = f"{STATE_DIR}/system_state.json"
HEALTH_LOG_PATH = f"{STATE_DIR}/health_log.jsonl"

# ---------------------------------------------------------------------------
# Default expected intervals (hours). Configurable per-agent.
# ---------------------------------------------------------------------------

DEFAULT_INTERVALS: dict[str, float] = {
    "career": 4.0,
    "etsy": 24.0,
    "gmail": 24.0,
    "fertility": 24.0,
    "affiliate": 24.0,
    "life-ops": 12.0,
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_iso(iso_str: Optional[str]) -> Optional[datetime]:
    """Parse an ISO timestamp string to a timezone-aware datetime, or None."""
    if not iso_str:
        return None
    try:
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# Freshness score
# ---------------------------------------------------------------------------

def compute_freshness(
    last_successful_run_iso: Optional[str],
    expected_interval_hours: float,
) -> int:
    """Compute a 0-100 freshness score.

    100 if the last successful run is within the expected interval.
    Decays linearly: lose 10 points per hour past the expected next run.
    Floor at 0.
    """
    last_ok = _parse_iso(last_successful_run_iso)
    if last_ok is None:
        return 0

    now = _now()
    expected_next = last_ok + timedelta(hours=expected_interval_hours)
    overdue_seconds = (now - expected_next).total_seconds()

    if overdue_seconds <= 0:
        # Still within the expected window
        return 100

    overdue_hours = overdue_seconds / 3600.0
    score = 100 - int(overdue_hours * 10)
    return max(score, 0)


# ---------------------------------------------------------------------------
# Per-agent health
# ---------------------------------------------------------------------------

def compute_agent_health(
    agent_name: str,
    agent_data: dict[str, Any],
    expected_interval_hours: float,
) -> dict[str, Any]:
    """Compute health for a single agent. Returns an updated copy of agent_data.

    Fields read from agent_data:
        status, last_run, last_successful_run, failures_today, events_today

    Fields written:
        health_status, freshness, last_health_check
    """
    data = dict(agent_data)  # shallow copy
    now_iso = _now().isoformat()

    current_status = data.get("status", "idle")
    last_run_iso = data.get("last_run")
    last_ok_iso = data.get("last_successful_run", last_run_iso)
    failures_today = data.get("failures_today", data.get("failures", 0))
    events_today = data.get("events_today", 0)

    last_run_dt = _parse_iso(last_run_iso)
    last_ok_dt = _parse_iso(last_ok_iso)

    # -- Determine health_status --

    if current_status == "running":
        health_status = "running"

    elif last_run_dt is None:
        # Never ran
        health_status = "idle"

    elif _is_failed(last_run_iso, last_ok_iso, expected_interval_hours):
        health_status = "failed"

    elif _is_stale(last_ok_iso, expected_interval_hours):
        health_status = "stale"

    elif failures_today > 2:
        health_status = "warning"

    elif events_today == 0 and _should_have_events(agent_name):
        health_status = "warning"

    else:
        health_status = "healthy"

    # -- Freshness --
    freshness = compute_freshness(last_ok_iso, expected_interval_hours)

    data["health_status"] = health_status
    data["freshness"] = freshness
    data["last_health_check"] = now_iso

    return data


def _is_failed(
    last_run_iso: Optional[str],
    last_ok_iso: Optional[str],
    expected_interval_hours: float,
) -> bool:
    """True if the last run was a failure AND no successful run in the
    last 2 expected windows."""
    last_ok_dt = _parse_iso(last_ok_iso)
    if last_ok_dt is None:
        # Never succeeded -- if it has run at all, that's a failure
        return _parse_iso(last_run_iso) is not None

    cutoff = _now() - timedelta(hours=expected_interval_hours * 2)
    return last_ok_dt < cutoff


def _is_stale(
    last_ok_iso: Optional[str],
    expected_interval_hours: float,
) -> bool:
    """True if last successful run is older than 1.5x expected interval."""
    last_ok_dt = _parse_iso(last_ok_iso)
    if last_ok_dt is None:
        return True
    cutoff = _now() - timedelta(hours=expected_interval_hours * 1.5)
    return last_ok_dt < cutoff


def _should_have_events(agent_name: str) -> bool:
    """Return True if this agent is expected to produce events daily.
    All agents except life-ops are expected to generate events when active."""
    # life-ops is a meta-agent; zero events is normal if nothing changed
    return agent_name not in ("life-ops",)


# ---------------------------------------------------------------------------
# System-wide status
# ---------------------------------------------------------------------------

def compute_system_status(state: dict[str, Any]) -> str:
    """Compute aggregate system status from all agent health_statuses.

    Returns one of: healthy, warning, degraded, failed
    """
    agents = state.get("agents", {})
    statuses = [
        a.get("health_status", a.get("status", "idle"))
        for a in agents.values()
    ]

    failed_count = statuses.count("failed")
    stale_count = statuses.count("stale")
    warning_count = statuses.count("warning")

    if failed_count >= 2:
        return "failed"
    if failed_count >= 1:
        return "degraded"
    if stale_count >= 2:
        return "degraded"
    if stale_count >= 1 or warning_count >= 1:
        return "warning"
    return "healthy"


# ---------------------------------------------------------------------------
# Health log
# ---------------------------------------------------------------------------

def log_health_snapshot(state: dict[str, Any]) -> dict[str, Any]:
    """Append a health snapshot to health_log.jsonl. Returns the entry."""
    agents_summary = {}
    for name, adata in state.get("agents", {}).items():
        agents_summary[name] = {
            "status": adata.get("health_status", adata.get("status", "idle")),
            "freshness": adata.get("freshness", 0),
        }

    entry = {
        "timestamp": _now().isoformat(),
        "system_status": state.get("system_status", compute_system_status(state)),
        "agents": agents_summary,
    }
    append_jsonl(HEALTH_LOG_PATH, entry)
    return entry


# ---------------------------------------------------------------------------
# Affiliate target tracking
# ---------------------------------------------------------------------------

def _check_affiliate_targets(state: dict[str, Any]) -> None:
    """Check if affiliate agent is hitting article production targets.

    Reads data/affiliate/state.json for article counts and adds
    warnings to state alerts if targets are missed.
    """
    aff_state_path = Path(SYSTEM_STATE_PATH).parent.parent / "data" / "affiliate" / "state.json"
    aff_state = safe_read_json(str(aff_state_path))
    if not aff_state:
        return

    articles = aff_state.get("articles_produced", [])
    if not articles:
        return

    from datetime import timedelta
    now = _now()
    week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    articles_this_week = sum(
        1 for a in articles if a.get("deploy_date", "") >= week_ago
    )

    alerts = state.setdefault("affiliate_alerts", [])

    # Weekly minimum check (15 articles / 7 days = ~2.1/day target)
    if articles_this_week < 15:
        alerts.append({
            "type": "affiliate_below_target",
            "message": f"Affiliate produced {articles_this_week} articles in last 7 days (target: 15)",
            "severity": "warning" if articles_this_week >= 10 else "critical",
            "articles_this_week": articles_this_week,
            "checked_at": now.isoformat(),
        })


# ---------------------------------------------------------------------------
# Compute all
# ---------------------------------------------------------------------------

def compute_all_health(state: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    """Compute health for all agents. Load state if not provided.

    Returns the updated state dict with health_status and freshness
    set on each agent, and system_status set at the top level.
    """
    if state is None:
        state = safe_read_json(SYSTEM_STATE_PATH)
        if not state or "agents" not in state:
            state = create_default_system_state()

    agents = state.get("agents", {})

    for agent_name in AGENT_NAMES:
        if agent_name not in agents:
            agents[agent_name] = {
                "status": "idle",
                "last_run": None,
                "last_successful_run": None,
                "failures_today": 0,
                "events_today": 0,
            }

        interval = DEFAULT_INTERVALS.get(agent_name, 24.0)
        agents[agent_name] = compute_agent_health(
            agent_name, agents[agent_name], interval
        )

    state["agents"] = agents
    state["system_status"] = compute_system_status(state)
    state["last_updated"] = _now().isoformat()

    # Update counts (aligned with state_manager.update_counts schema)
    stale_count = sum(1 for a in agents.values() if a.get("health_status") == "stale" or a.get("status") == "stale")
    failed_count = sum(1 for a in agents.values() if a.get("health_status") == "failed" or a.get("status") == "failed")
    state["counts"] = {
        "pending_reviews": count_pending(),
        "pending_actions": sum(a.get("events_today", 0) for a in agents.values()),
        "failed_actions": sum(a.get("failures_today", 0) for a in agents.values()),
        "stale_agents": stale_count,
        "alerts": failed_count,
    }

    # Affiliate production target check
    _check_affiliate_targets(state)

    return state


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def run_health_check() -> dict[str, Any]:
    """Full health check cycle: load state, compute, log, save.

    Returns the updated state dict.
    """
    state = safe_read_json(SYSTEM_STATE_PATH)
    if not state or "agents" not in state:
        state = create_default_system_state()

    state = compute_all_health(state)
    log_health_snapshot(state)
    atomic_write(SYSTEM_STATE_PATH, state)

    return state
