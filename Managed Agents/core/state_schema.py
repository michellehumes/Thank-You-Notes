from __future__ import annotations

"""
Default state structures for the Managed Agents OS.

Defines the shape of system_state.json and dashboard_state.json
with all fields initialized to sensible defaults.
"""

from datetime import datetime, timezone
from typing import Any

AGENT_NAMES = ["career", "etsy", "gmail", "fertility", "affiliate", "life-ops"]


def _default_agent_entry() -> dict[str, Any]:
    """Default per-agent status block for system_state."""
    return {
        "status": "idle",
        "last_run": None,
        "failures": 0,
        "events_today": 0,
        "freshness": "stale",
    }


def create_default_system_state() -> dict[str, Any]:
    """Create the default system_state.json structure.

    Contains per-agent status tracking and aggregate counts.
    """
    return {
        "agents": {name: _default_agent_entry() for name in AGENT_NAMES},
        "counts": {
            "pending_reviews": 0,
            "pending_actions": 0,
            "failed_actions": 0,
            "stale_agents": 0,
            "alerts": 0,
        },
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def create_default_dashboard_state() -> dict[str, Any]:
    """Create the default dashboard_state.json structure.

    Provides a full snapshot consumed by the life-tracker dashboard.
    """
    now = datetime.now(timezone.utc).isoformat()

    agent_grid = {
        name: {
            "status": "idle",
            "last_run": None,
            "events_today": 0,
            "freshness": "stale",
            "health": "unknown",
        }
        for name in AGENT_NAMES
    }

    return {
        "generated_at": now,
        "global_status": "ok",
        "agent_grid": agent_grid,
        "recent_events": [],
        "review_queue_preview": [],
        "alerts": [],
        "career_summary": {
            "active_applications": 0,
            "new_matches": 0,
            "interviews_scheduled": 0,
            "top_lead": None,
            "pipeline_health": "empty",
        },
        "etsy_summary": {
            "revenue_today": 0.0,
            "revenue_mtd": 0.0,
            "orders_today": 0,
            "active_listings": 0,
            "top_product": None,
            "shop_health": "unknown",
        },
        "fertility_summary": {
            "cycle_day": None,
            "phase": None,
            "next_appointment": None,
            "notes": "",
        },
        "affiliate_summary": {
            "articles_live": 0,
            "articles_queued": 0,
            "clicks_today": 0,
            "revenue_mtd": 0.0,
            "top_article": None,
        },
        "tomorrow_priorities": [],
        "decisions_needed": [],
    }
