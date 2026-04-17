#!/usr/bin/env python3
from __future__ import annotations

"""
Dashboard HTTP server for Michelle's Operations OS.

Serves the dashboard UI and exposes JSON API endpoints that read
canonical state files and trigger local scripts.

Usage:
    python3 dashboard_server.py          # starts on 0.0.0.0:7777
"""

import csv
import io
import json
import os
import subprocess
import sys
import traceback
import urllib.parse
from datetime import datetime, timezone, timedelta
from collections import Counter
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

BASE = Path("/Users/michellehumes/Managed Agents")
STATE = BASE / "state"
DATA = BASE / "data"
SCRIPTS = BASE / "scripts"
DASHBOARD_DIR = BASE / "dashboard"
CRON_RUNNER = BASE / "cron-runner" / "run-agent.sh"

VALID_AGENTS = {"career", "etsy", "gmail", "fertility", "affiliate", "life-ops"}
AGENT_DEFAULT_SCAN = {
    "career": "morning",
    "etsy": "daily",
    "gmail": "daily",
    "fertility": "daily",
    "affiliate": "daily",
    "life-ops": "daily",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def read_json_file(path: Path) -> dict | list | None:
    """Read and parse a JSON file, returning None on any failure."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def read_jsonl_tail(path: Path, n: int) -> list[dict]:
    """Read last *n* lines from a JSONL file, return parsed list newest-first."""
    try:
        lines = path.read_text(encoding="utf-8").strip().splitlines()
    except Exception:
        return []
    tail = lines[-n:] if n < len(lines) else lines
    result: list[dict] = []
    for line in reversed(tail):
        line = line.strip()
        if not line:
            continue
        try:
            result.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return result


def merge_json_files(*paths: Path) -> dict:
    """Read multiple JSON files and shallow-merge them into one dict."""
    merged: dict = {}
    for p in paths:
        data = read_json_file(p)
        if isinstance(data, dict):
            merged.update(data)
    return merged


def parse_csv_file(path: Path) -> list[dict]:
    """Parse a CSV file with csv.DictReader, return list of row dicts."""
    try:
        text = path.read_text(encoding="utf-8")
        reader = csv.DictReader(io.StringIO(text))
        return list(reader)
    except Exception:
        return []


def json_response(data, status: int = 200) -> tuple[bytes, int]:
    """Serialize *data* to JSON bytes and return with status code."""
    body = json.dumps(data, indent=2, default=str).encode("utf-8")
    return body, status


def error_response(message: str, status: int = 500) -> tuple[bytes, int]:
    """Return a JSON error payload."""
    return json_response({"error": message}, status)


def run_script(cmd: list[str], timeout: int = 30) -> tuple[bytes, int]:
    """Run a command synchronously and return JSON result."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(BASE),
        )
        if result.returncode == 0:
            # Try to extract events_added from rules engine output
            events_added = None
            for line in result.stdout.splitlines():
                if "Processed:" in line:
                    try:
                        events_added = int(line.split("Processed:")[1].strip())
                    except (ValueError, IndexError):
                        pass
            resp = {"status": "ok", "output": result.stdout}
            if events_added is not None:
                resp["events_added"] = events_added
            return json_response(resp)
        else:
            return json_response(
                {"status": "error", "output": result.stderr or result.stdout},
                500,
            )
    except subprocess.TimeoutExpired:
        return error_response("Script timed out", 504)
    except FileNotFoundError:
        return error_response("Script not found", 404)
    except Exception as exc:
        return error_response(str(exc), 500)


# ---------------------------------------------------------------------------
# Request handler
# ---------------------------------------------------------------------------


class DashboardHandler(SimpleHTTPRequestHandler):
    """Routes API requests and serves static files from /dashboard."""

    def __init__(self, *args, **kwargs):
        # Set the directory for static file serving
        super().__init__(*args, directory=str(DASHBOARD_DIR), **kwargs)

    # -- CORS & headers -----------------------------------------------------

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    # -- Helpers ------------------------------------------------------------

    def _send_json(self, body: bytes, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def _parse_query(self) -> dict[str, str]:
        parsed = urllib.parse.urlparse(self.path)
        return dict(urllib.parse.parse_qsl(parsed.query))

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return {}

    # -- GET routing --------------------------------------------------------

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/api/state":
            self._handle_state()
        elif path == "/api/dashboard":
            self._handle_dashboard()
        elif path == "/api/reviews":
            self._handle_reviews()
        elif path == "/api/events":
            self._handle_events()
        elif path == "/api/actions":
            self._handle_actions()
        elif path == "/api/health":
            self._handle_health()
        elif path == "/api/career":
            self._handle_career()
        elif path == "/api/fertility":
            self._handle_fertility()
        elif path == "/api/etsy":
            self._handle_etsy()
        elif path == "/api/affiliate":
            self._handle_affiliate()
        elif path == "/api/products":
            self._handle_products()
        elif path == "/api/archive":
            self._handle_archive()
        elif path == "/api/registry":
            self._handle_registry()
        elif path == "/api/gmail":
            self._handle_gmail()
        elif path == "/api/instructions":
            self._handle_instructions()
        elif path == "/api/ingestion":
            self._handle_ingestion()
        elif path.startswith("/api/"):
            body, status = error_response("Not found", 404)
            self._send_json(body, status)
        else:
            # Serve static files from dashboard directory
            super().do_GET()

    # -- POST routing -------------------------------------------------------

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/api/run/rules-engine":
            self._handle_run_rules_engine()
        elif path == "/api/run/health":
            self._handle_run_health()
        elif path == "/api/run/rebuild":
            self._handle_run_rebuild()
        elif path == "/api/run/ingestion":
            self._handle_run_ingestion()
        elif path.startswith("/api/run/agent/"):
            agent_name = path.split("/api/run/agent/", 1)[1]
            self._handle_run_agent(agent_name)
        elif path.startswith("/api/review/") and path.endswith("/approve"):
            review_id = path.split("/api/review/", 1)[1].rsplit("/approve", 1)[0]
            self._handle_review_action(review_id, "approve")
        elif path.startswith("/api/review/") and path.endswith("/hold"):
            review_id = path.split("/api/review/", 1)[1].rsplit("/hold", 1)[0]
            self._handle_review_action(review_id, "hold")
        elif path.startswith("/api/review/") and path.endswith("/reject"):
            review_id = path.split("/api/review/", 1)[1].rsplit("/reject", 1)[0]
            self._handle_review_action(review_id, "reject")
        elif path.startswith("/api/archive/") and path.endswith("/restore"):
            review_id = path.split("/api/archive/", 1)[1].rsplit("/restore", 1)[0]
            self._handle_archive_restore(review_id)
        elif path == "/api/archive/purge":
            self._handle_archive_purge()
        elif path == "/api/reviews/bulk":
            self._handle_bulk_review()
        else:
            body, status = error_response("Not found", 404)
            self._send_json(body, status)

    # -- GET handlers -------------------------------------------------------

    def _handle_state(self):
        data = read_json_file(STATE / "system_state.json")
        if data is None:
            body, status = error_response("Could not read system_state.json")
        else:
            body, status = json_response(data)
        self._send_json(body, status)

    def _handle_dashboard(self):
        data = read_json_file(STATE / "dashboard_state.json")
        if data is None:
            body, status = error_response("Could not read dashboard_state.json")
        else:
            body, status = json_response(data)
        self._send_json(body, status)

    def _handle_reviews(self):
        data = read_json_file(STATE / "review_queue.json")
        if data is None:
            body, status = error_response("Could not read review_queue.json")
        else:
            body, status = json_response(data)
        self._send_json(body, status)

    def _handle_events(self):
        params = self._parse_query()
        limit = int(params.get("limit", "50"))
        data = read_jsonl_tail(STATE / "events.jsonl", limit)
        body, status = json_response(data)
        self._send_json(body, status)

    def _handle_actions(self):
        params = self._parse_query()
        limit = int(params.get("limit", "30"))
        data = read_jsonl_tail(STATE / "action_log.jsonl", limit)
        body, status = json_response(data)
        self._send_json(body, status)

    def _handle_health(self):
        data = read_jsonl_tail(STATE / "health_log.jsonl", 10)
        body, status = json_response(data)
        self._send_json(body, status)

    def _handle_career(self):
        csv_path = DATA / "job-tracker" / "jobs.csv"
        jobs = parse_csv_file(csv_path)
        # Build pipeline summary -- count by status column
        status_counts: dict[str, int] = {}
        today = datetime.now(timezone.utc).date()
        for job in jobs:
            s = job.get("status", "unknown").strip()
            status_counts[s] = status_counts.get(s, 0) + 1
            # Compute days since last action
            lt = job.get("last_touch", "")
            if lt:
                try:
                    touch_date = datetime.strptime(lt.strip(), "%Y-%m-%d").date()
                    job["days_since_action"] = (today - touch_date).days
                except ValueError:
                    job["days_since_action"] = None
            else:
                job["days_since_action"] = None
            # Check materials readiness from subdirectories
            slug = self._company_slug(job.get("company", ""), job.get("role", ""))
            materials = []
            job_dir = DATA / "job-tracker" / slug
            if job_dir.is_dir():
                for f in job_dir.iterdir():
                    if f.is_file() and f.suffix == ".md":
                        materials.append(f.stem)
            job["materials"] = materials
            job["has_resume"] = any("resume" in m for m in materials)
            job["has_cover_letter"] = any("cover" in m for m in materials)
        result = {
            "jobs": jobs,
            "pipeline": {
                "total": len(jobs),
                "by_status": status_counts,
            },
        }
        body, status = json_response(result)
        self._send_json(body, status)

    @staticmethod
    def _company_slug(company: str, role: str) -> str:
        """Build a slug matching the job-tracker directory naming convention."""
        import re
        text = f"{company} {role}".lower().strip()
        text = re.sub(r"[^a-z0-9\s-]", "", text)
        text = re.sub(r"\s+", "-", text)
        return text

    def _handle_fertility(self):
        data = merge_json_files(
            DATA / "fertility" / "state.json",
            DATA / "fertility" / "current_cycle.json",
        )
        body, status = json_response(data)
        self._send_json(body, status)

    def _handle_etsy(self):
        """Build Etsy metrics from structured data/etsy/metrics.json first,
        then fall back to agents/MEMORY.md regex parsing for any gaps."""
        result = {
            "revenue_mtd": None, "orders_mtd": None, "visits_mtd": None,
            "cvr": None, "aov": None, "ads_spend": None, "ads_roas": None,
            "open_messages": None, "abandoned_carts": None, "active_listings": None,
            "ytd_revenue": None, "ytd_orders": None, "reviews": None,
            "ads_daily_budget": None, "last_updated": None,
            "today_revenue": None, "today_orders": None,
            "top_ad_listings": [], "sources_used": [], "sources_missing": [],
        }

        # Source 1 (PRIMARY): data/etsy/metrics.json -- structured, reliable
        metrics = read_json_file(DATA / "etsy" / "metrics.json")
        if metrics:
            result["sources_used"].append("data/etsy/metrics.json")
            result["last_updated"] = metrics.get("last_updated")

            shop = metrics.get("shop", {})
            result["active_listings"] = shop.get("active_listings")
            result["reviews"] = shop.get("reviews")

            p30 = metrics.get("period_30d", {})
            if p30.get("revenue") is not None:
                result["revenue_mtd"] = p30["revenue"]
            if p30.get("orders") is not None:
                result["orders_mtd"] = p30["orders"]
            if p30.get("visits") is not None:
                result["visits_mtd"] = p30["visits"]
            if p30.get("cvr") is not None:
                result["cvr"] = p30["cvr"]
            if p30.get("aov") is not None:
                result["aov"] = p30["aov"]

            today = metrics.get("today", {})
            result["today_revenue"] = today.get("revenue")
            result["today_orders"] = today.get("orders")

            ytd = metrics.get("ytd", {})
            result["ytd_revenue"] = ytd.get("revenue")
            result["ytd_orders"] = ytd.get("orders")

            ads = metrics.get("ads", {})
            result["ads_daily_budget"] = ads.get("daily_budget")
            result["ads_spend"] = ads.get("spend_mtd")
            result["ads_roas"] = ads.get("roas")
            result["top_ad_listings"] = ads.get("top_listings", [])

            msgs = metrics.get("messages", {})
            result["open_messages"] = msgs.get("unread")
        else:
            result["sources_missing"].append("data/etsy/metrics.json")

        # Source 2 (FALLBACK): agents/MEMORY.md regex parsing -- fills gaps
        memory_path = BASE / "agents" / "MEMORY.md"
        if memory_path.exists():
            try:
                text = memory_path.read_text()
                result["sources_used"].append("agents/MEMORY.md (fallback)")
                import re
                # 30-Day stats (prefer broader window)
                lines = text.split("\n")
                for i, line in enumerate(lines):
                    if "30-Day" in line and i + 1 < len(lines):
                        m30 = re.search(r"Visits:\s*([\d,]+)\s*\|\s*Orders:\s*(\d+)\s*\|\s*Conversion:\s*([\d.]+)%\s*\|\s*Revenue:\s*\$([\d,.]+)", lines[i+1])
                        if m30:
                            if result["visits_mtd"] is None:
                                result["visits_mtd"] = int(m30.group(1).replace(",", ""))
                            if result["orders_mtd"] is None:
                                result["orders_mtd"] = int(m30.group(2))
                            if result["cvr"] is None:
                                result["cvr"] = float(m30.group(3))
                            if result["revenue_mtd"] is None:
                                result["revenue_mtd"] = float(m30.group(4).replace(",", ""))
                # 7-Day stats (only if 30-day didn't fill)
                if result["revenue_mtd"] is None:
                    m = re.search(r"Visits:\s*([\d,]+)\s*\|\s*Orders:\s*(\d+)\s*\|\s*Conversion:\s*([\d.]+)%\s*\|\s*Revenue:\s*\$([\d,.]+)", text)
                    if m:
                        result["visits_mtd"] = result["visits_mtd"] or int(m.group(1).replace(",", ""))
                        result["orders_mtd"] = result["orders_mtd"] or int(m.group(2))
                        result["cvr"] = result["cvr"] or float(m.group(3))
                        result["revenue_mtd"] = float(m.group(4).replace(",", ""))
                # Active listings
                if result["active_listings"] is None:
                    m_list = re.search(r"Active listings:\s*(\d+)", text)
                    if m_list:
                        result["active_listings"] = int(m_list.group(1))
                # Reviews
                if result["reviews"] is None:
                    m_rev = re.search(r"Reviews:\s*(\d+)", text)
                    if m_rev:
                        result["reviews"] = int(m_rev.group(1))
                # Ads
                if result["ads_roas"] is None:
                    m_roas = re.search(r"ROAS:\s*([\d.]+)", text)
                    if m_roas:
                        result["ads_roas"] = float(m_roas.group(1))
                if result["ads_spend"] is None:
                    m_spend = re.search(r"Spend:\s*\$([\d,.]+)", text)
                    if m_spend:
                        result["ads_spend"] = float(m_spend.group(1).replace(",", ""))
                if result["ads_daily_budget"] is None:
                    m_budget = re.search(r"Now:\s*\$([\d.]+)/day", text)
                    if m_budget:
                        result["ads_daily_budget"] = float(m_budget.group(1))
                # Messages
                if result["open_messages"] is None:
                    m_msg = re.search(r"(\d+)\s*unread messages", text)
                    if m_msg:
                        result["open_messages"] = int(m_msg.group(1))
                # AOV
                if result["aov"] is None and result["revenue_mtd"] and result["orders_mtd"] and result["orders_mtd"] > 0:
                    result["aov"] = round(result["revenue_mtd"] / result["orders_mtd"], 2)
                # Top ad listings (only if structured didn't provide)
                if not result["top_ad_listings"]:
                    ad_rows = re.findall(r"\|\s*([^|]+?)\s*\|\s*\d+\s*\|\s*[\d.]+%\s*\|\s*\d+\s*\|\s*\$([\d,.]+)\s*\|\s*\$([\d,.]+)\s*\|\s*([\d.~]+)\s*\|\s*(\w+)", text)
                    for row in ad_rows:
                        result["top_ad_listings"].append({
                            "name": row[0].strip(),
                            "revenue": row[1].replace(",", ""),
                            "spend": row[2].replace(",", ""),
                            "roas": row[3].replace("~", ""),
                            "verdict": row[4],
                        })
                # Last updated from memory (only if structured didn't set it)
                if result["last_updated"] is None:
                    m_updated = re.search(r"Last updated:\s*([\d-]+)", text)
                    if m_updated:
                        result["last_updated"] = m_updated.group(1)
            except Exception:
                result["sources_missing"].append("agents/MEMORY.md (parse error)")
        else:
            result["sources_missing"].append("agents/MEMORY.md")

        # Source 3: dashboard_state.json etsy_summary (fill remaining gaps)
        ds = read_json_file(STATE / "dashboard_state.json")
        if ds and "etsy_summary" in ds:
            es = ds["etsy_summary"]
            result["sources_used"].append("state/dashboard_state.json")
            if result["revenue_mtd"] is None and es.get("revenue_mtd"):
                result["revenue_mtd"] = es["revenue_mtd"]
            if result["orders_mtd"] is None and es.get("orders_today"):
                result["orders_mtd"] = es["orders_today"]

        body, status_code = json_response(result)
        self._send_json(body, status_code)

    def _handle_affiliate(self):
        """Build affiliate metrics from real data files."""
        result = {
            "amazon_earnings_mtd": None, "amazon_clicks_mtd": None,
            "amazon_items_shipped": None, "amazon_conversion": None,
            "articles_live": None, "articles_this_week": 0,
            "gsc_impressions": None, "gsc_clicks": None, "gsc_avg_position": None,
            "gsc_ctr": None, "active_mode": None, "next_check_gate": None,
            "sites": {}, "last_updated": None,
            "sources_used": [], "sources_missing": [],
        }

        # Source 1: data/affiliate/metrics.json (Amazon + GSC data)
        metrics = read_json_file(DATA / "affiliate" / "metrics.json")
        if metrics:
            result["sources_used"].append("data/affiliate/metrics.json")
            result["last_updated"] = metrics.get("last_updated")
            aa = metrics.get("amazon_associates", {})
            # Parse earnings (may have $ prefix)
            earnings_str = aa.get("earnings_apr_mtd", "0")
            try:
                result["amazon_earnings_mtd"] = float(str(earnings_str).replace("$", "").replace(",", ""))
            except ValueError:
                result["amazon_earnings_mtd"] = 0
            result["amazon_clicks_mtd"] = aa.get("clicks_apr_mtd")
            result["amazon_items_shipped"] = aa.get("items_shipped_apr_mtd")
            conv_str = aa.get("conversion_apr_mtd", "0")
            try:
                result["amazon_conversion"] = float(str(conv_str).replace("%", ""))
            except ValueError:
                pass
            # GSC
            gsc = aa.get("gsc_3month_summary", {})
            result["gsc_impressions"] = gsc.get("total_impressions")
            result["gsc_clicks"] = gsc.get("total_clicks")
            result["gsc_avg_position"] = gsc.get("avg_position")
            result["gsc_ctr"] = gsc.get("avg_ctr")
            # Per-site breakdown
            for site_name, site_data in metrics.get("sites", {}).items():
                result["sites"][site_name] = {
                    "tracking_id": site_data.get("tracking_id"),
                    "total_posts": site_data.get("total_posts"),
                    "notes": site_data.get("notes"),
                }
        else:
            result["sources_missing"].append("data/affiliate/metrics.json")

        # Source 2: data/affiliate/state.json (mode, article counts, pipeline)
        aff_state = read_json_file(DATA / "affiliate" / "state.json")
        if aff_state:
            result["sources_used"].append("data/affiliate/state.json")
            result["active_mode"] = aff_state.get("mode")
            result["next_check_gate"] = aff_state.get("gsc_check_date")
            total = aff_state.get("articles_total_deployed")
            if total is not None:
                result["articles_live"] = total
            # Count articles this week
            from datetime import datetime, timedelta
            week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
            articles = aff_state.get("articles_produced", [])
            result["articles_this_week"] = sum(
                1 for a in articles
                if a.get("deploy_date", "") >= week_ago
            )
            if result["last_updated"] is None:
                result["last_updated"] = aff_state.get("last_run")
        else:
            result["sources_missing"].append("data/affiliate/state.json")

        body, status_code = json_response(result)
        self._send_json(body, status_code)

    def _handle_archive(self):
        """Return archived review items."""
        try:
            sys.path.insert(0, str(BASE))
            from core.review_queue import list_archived_reviews, purge_expired_archive
        except ImportError as exc:
            body, status = error_response(f"Could not import: {exc}", 500)
            self._send_json(body, status)
            return
        # Auto-purge expired items on every read
        purged = purge_expired_archive()
        items = list_archived_reviews()
        body, status = json_response({
            "items": items,
            "total": len(items),
            "purged_this_request": purged,
        })
        self._send_json(body, status)

    def _handle_archive_restore(self, review_id: str):
        """Restore an archived item back to pending."""
        try:
            sys.path.insert(0, str(BASE))
            from core.review_queue import restore_from_archive
        except ImportError as exc:
            body, status = error_response(f"Could not import: {exc}", 500)
            self._send_json(body, status)
            return
        try:
            item = restore_from_archive(review_id)
            body, status = json_response(item)
        except KeyError as exc:
            body, status = error_response(str(exc), 404)
        except Exception as exc:
            body, status = error_response(str(exc), 500)
        self._send_json(body, status)

    def _handle_archive_purge(self):
        """Manually purge expired archive items."""
        try:
            sys.path.insert(0, str(BASE))
            from core.review_queue import purge_expired_archive
        except ImportError as exc:
            body, status = error_response(f"Could not import: {exc}", 500)
            self._send_json(body, status)
            return
        purged = purge_expired_archive()
        body, status = json_response({"purged": purged})
        self._send_json(body, status)

    def _handle_products(self):
        """Build product launch tracker from digital-downloads/*/state.json."""
        products_dir = DATA / "etsy-products" / "digital-downloads"
        products = []
        if products_dir.is_dir():
            for child in sorted(products_dir.iterdir()):
                if not child.is_dir():
                    continue
                state_file = child / "state.json"
                state = read_json_file(state_file)
                if not state:
                    continue
                # Normalize fields
                name = state.get("product_name", child.name)
                folder = child.name
                raw_status = state.get("status", "unknown")
                etsy_status = state.get("etsy_status", "not_listed")
                images = state.get("images_generated", False)
                etsy_id = state.get("etsy_listing_id")
                price = state.get("price_usd") or state.get("price", "")
                if isinstance(price, str):
                    price = price.replace("$", "")
                    try:
                        price = float(price)
                    except ValueError:
                        price = None
                deadline = state.get("listing_deadline", state.get("seasonal_window", ""))
                # Determine display status
                if etsy_id and etsy_status == "live":
                    display_status = "live"
                elif etsy_id:
                    display_status = "listed"
                elif not images:
                    display_status = "images_pending"
                elif raw_status == "package_ready":
                    display_status = "ready_to_list"
                else:
                    display_status = raw_status
                products.append({
                    "name": name,
                    "folder": folder,
                    "status": display_status,
                    "raw_status": raw_status,
                    "etsy_status": etsy_status,
                    "images_generated": images,
                    "etsy_listing_id": etsy_id,
                    "price": price,
                    "deadline": deadline,
                    "cross_sell": state.get("cross_sell", []),
                })
        result = {
            "products": products,
            "total": len(products),
            "by_status": dict(Counter(p["status"] for p in products)),
        }
        body, status_code = json_response(result)
        self._send_json(body, status_code)

    def _handle_registry(self):
        data = read_json_file(STATE / "entity_registry.json")
        if data is None:
            body, status = error_response("Could not read entity_registry.json")
        else:
            body, status = json_response(data)
        self._send_json(body, status)

    def _handle_ingestion(self):
        """Return latest ingestion snapshot, normalized for dashboard consumption."""
        raw = read_json_file(STATE / "ingestion_snapshot.json")
        if raw:
            # Normalize structure for dashboard: flatten to {data, executive_snapshot}
            result = {
                "data": raw.get("ingestion", {}),
                "executive_snapshot": raw.get("analysis", {}).get("executive_snapshot", {}),
                "analyses": raw.get("analysis", {}).get("analyses", {}),
                "generated_at": raw.get("pipeline_run_at", ""),
            }
            body, status = json_response(result)
        else:
            body, status = error_response("No ingestion snapshot. Run: python3 scripts/run_ingestion.py", 404)
        self._send_json(body, status)

    def _handle_gmail(self):
        """Return Gmail summary from data/email-log/email_summary.json."""
        summary = read_json_file(DATA / "email-log" / "email_summary.json")
        if summary is None:
            body, status = error_response("No Gmail summary. Gmail agent has not run yet.", 404)
        else:
            # Enrich with computed fields
            counts = summary.get("counts", {})
            total_actionable = (
                counts.get("job_recruiter", 0)
                + counts.get("etsy_customer", 0)
                + counts.get("revenue_opportunity", 0)
                + counts.get("important_personal", 0)
            )
            summary["total_actionable"] = total_actionable
            summary["total_low_priority"] = counts.get("low_priority", 0)
            body, status = json_response(summary)
        self._send_json(body, status)

    def _handle_instructions(self):
        """Return all pending instruction files across all agents."""
        instructions_dir = DATA / "instructions"
        result = {"agents": {}, "total_pending": 0}
        if instructions_dir.is_dir():
            for agent_dir in sorted(instructions_dir.iterdir()):
                if not agent_dir.is_dir():
                    continue
                agent_name = agent_dir.name
                pending = []
                for f in sorted(agent_dir.glob("*.json")):
                    try:
                        data = json.loads(f.read_text(encoding="utf-8"))
                        if data.get("status") == "pending":
                            data["_filename"] = f.name
                            pending.append(data)
                    except (json.JSONDecodeError, OSError):
                        continue
                if pending:
                    result["agents"][agent_name] = pending
                    result["total_pending"] += len(pending)
        body, status = json_response(result)
        self._send_json(body, status)

    # -- POST handlers: script runners --------------------------------------

    def _handle_run_ingestion(self):
        cmd = ["python3", str(SCRIPTS / "run_ingestion.py")]
        body, status = run_script(cmd, timeout=60)
        self._send_json(body, status)

    def _handle_run_rules_engine(self):
        cmd = ["python3", str(SCRIPTS / "run_rules_engine.py")]
        body, status = run_script(cmd, timeout=30)
        self._send_json(body, status)

    def _handle_run_health(self):
        cmd = ["python3", str(SCRIPTS / "recompute_health.py")]
        body, status = run_script(cmd, timeout=30)
        self._send_json(body, status)

    def _handle_run_rebuild(self):
        cmd = ["python3", str(SCRIPTS / "rebuild_state.py"), "incremental"]
        body, status = run_script(cmd, timeout=30)
        self._send_json(body, status)

    def _handle_run_agent(self, agent_name: str):
        if agent_name not in VALID_AGENTS:
            body, status = error_response(
                f"Unknown agent '{agent_name}'. Valid: {', '.join(sorted(VALID_AGENTS))}",
                400,
            )
            self._send_json(body, status)
            return

        scan_type = AGENT_DEFAULT_SCAN.get(agent_name, "daily")
        # Read body to allow scan_type override
        req_body = self._read_body()
        if "scan_type" in req_body:
            scan_type = req_body["scan_type"]

        cmd = [str(CRON_RUNNER), agent_name, scan_type]
        try:
            subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                cwd=str(BASE),
            )
        except Exception as exc:
            body, status = error_response(f"Failed to launch agent: {exc}", 500)
            self._send_json(body, status)
            return

        body, status = json_response({
            "status": "started",
            "message": f"Agent {agent_name} launched in background",
        })
        self._send_json(body, status)

    # -- POST handlers: review actions --------------------------------------

    def _handle_review_action(self, review_id: str, action: str):
        # Import from core modules
        try:
            sys.path.insert(0, str(BASE))
            from core.review_queue import (
                approve_review_item, reject_review_item,
                hold_review_item, get_review_item,
            )
            from core.executor import execute_approved_item
        except ImportError as exc:
            body, status = error_response(f"Could not import core modules: {exc}", 500)
            self._send_json(body, status)
            return

        req_body = self._read_body()
        notes = req_body.get("notes", "")

        try:
            if action == "approve":
                # Mark approved, then execute
                item = approve_review_item(review_id, notes=notes)
                execution = execute_approved_item(item)
                item["execution"] = execution
            elif action == "hold":
                item = hold_review_item(review_id, notes=notes)
            elif action == "reject":
                # Permanently delete from queue
                item = reject_review_item(review_id, notes=notes)
            else:
                body, status = error_response(f"Unknown action: {action}", 400)
                self._send_json(body, status)
                return
            body, status = json_response(item)
        except KeyError as exc:
            body, status = error_response(str(exc), 404)
        except Exception as exc:
            traceback.print_exc()
            body, status = error_response(str(exc), 500)

        self._send_json(body, status)

    def _handle_bulk_review(self):
        """Bulk approve or reject multiple review items at once."""
        try:
            sys.path.insert(0, str(BASE))
            from core.review_queue import (
                approve_review_item, reject_review_item,
            )
            from core.executor import execute_approved_item
        except ImportError as exc:
            body, status = error_response(f"Could not import core modules: {exc}", 500)
            self._send_json(body, status)
            return

        req_body = self._read_body()
        action = req_body.get("action", "")
        ids = req_body.get("ids", [])
        notes = req_body.get("notes", "bulk action")

        if action not in ("approve", "reject"):
            body, status = error_response("action must be 'approve' or 'reject'", 400)
            self._send_json(body, status)
            return

        if not ids or not isinstance(ids, list):
            body, status = error_response("ids must be a non-empty array", 400)
            self._send_json(body, status)
            return

        results = []
        for rid in ids:
            try:
                if action == "approve":
                    item = approve_review_item(rid, notes=notes)
                    execution = execute_approved_item(item)
                    results.append({"id": rid, "status": "approved", "execution": execution})
                elif action == "reject":
                    item = reject_review_item(rid, notes=notes)
                    results.append({"id": rid, "status": "rejected"})
            except KeyError:
                results.append({"id": rid, "status": "not_found"})
            except Exception as exc:
                results.append({"id": rid, "status": "error", "error": str(exc)})

        body, status = json_response({
            "action": action,
            "processed": len(results),
            "results": results,
        })
        self._send_json(body, status)

    # -- Logging ------------------------------------------------------------

    def log_message(self, format, *args):
        """Quieter log -- single line per request."""
        sys.stderr.write(f"[dashboard] {self.address_string()} - {format % args}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    port = 7777
    server = HTTPServer(("0.0.0.0", port), DashboardHandler)
    print(f"Operations OS Dashboard Server")
    print(f"  URL:    http://localhost:{port}/")
    print(f"  API:    http://localhost:{port}/api/state")
    print(f"  Static: {DASHBOARD_DIR}")
    print(f"  Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()


if __name__ == "__main__":
    main()
