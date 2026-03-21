#!/usr/bin/env python3
"""
etsy_tier_grid.py — Shelzy's Designs Etsy Listing Tier Classifier

Usage:
    python etsy_tier_grid.py <path_to_etsy_stats.csv>

Input:
    Etsy Stats CSV export from Shop Manager > Stats > Download CSV
    Expected columns (case-insensitive match): Listing Title, Views, Visits,
    Orders, Revenue, Favorites, Conversion Rate, Listing Date (optional)

Output:
    - Colored terminal table sorted by revenue (desc)
    - etsy_tier_grid_output.csv with Tier + Recommended Action columns
    - Summary stats: count/revenue/avg CR per tier
"""

import sys
import csv
import os
import io
from datetime import datetime, date


# ── ANSI colors ──────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
GREY   = "\033[37m"
RED    = "\033[91m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

TIER_COLORS = {"A": GREEN, "B": YELLOW, "C": GREY, "D": RED}


# ── Column name normalizer ────────────────────────────────────────────────────
COLUMN_MAP = {
    "listing title":    "title",
    "title":            "title",
    "views":            "views",
    "visits":           "visits",
    "orders":           "orders",
    "revenue":          "revenue",
    "favorites":        "favorites",
    "favorite":         "favorites",
    "conversion rate":  "cr",
    "cr":               "cr",
    "listing date":     "listing_date",
    "date listed":      "listing_date",
    "created":          "listing_date",
}


def normalize_headers(headers):
    mapping = {}
    for i, h in enumerate(headers):
        key = h.strip().lower()
        if key in COLUMN_MAP:
            mapping[COLUMN_MAP[key]] = i
    return mapping


def safe_float(val, default=0.0):
    if val is None:
        return default
    try:
        return float(str(val).replace("$", "").replace("%", "").replace(",", "").strip())
    except ValueError:
        return default


def safe_int(val, default=0):
    return int(safe_float(val, default))


def days_since(date_str):
    """Return days since listing_date, or None if unparseable."""
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%B %d, %Y", "%b %d, %Y"):
        try:
            listed = datetime.strptime(date_str.strip(), fmt).date()
            return (date.today() - listed).days
        except ValueError:
            continue
    return None


# ── Tier classification ───────────────────────────────────────────────────────
def classify(row, idx_map):
    views   = safe_int(row.get("views"))
    orders  = safe_int(row.get("orders"))
    revenue = safe_float(row.get("revenue"))
    favs    = safe_int(row.get("favorites"))
    cr_raw  = safe_float(row.get("cr"))          # may already be 0–100 or 0–1
    cr      = cr_raw if cr_raw > 1 else cr_raw * 100  # normalise to 0–100

    age = None
    if "listing_date" in row:
        age = days_since(row["listing_date"])

    is_new = age is not None and age < 30

    # A-Tier: SCALE
    if (cr > 3 and views >= 20) or orders >= 10 or revenue >= 200:
        return "A", "SCALE"

    # B-Tier: FIX
    if (views >= 30 and orders == 0) or (1 <= cr <= 3) or (favs > orders * 3 and orders > 0):
        return "B", "FIX"

    # C-Tier: MONITOR
    if is_new or (10 <= views <= 29 and orders <= 1):
        return "C", "MONITOR"

    # D-Tier: KILL
    if views <= 5 or (orders == 0 and views < 20 and (age is None or age >= 30)):
        return "D", "DEACTIVATE"

    # Default fallback
    return "C", "MONITOR"


# ── Load CSV ──────────────────────────────────────────────────────────────────
def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        headers = next(reader)
        idx_map = normalize_headers(headers)

        if "title" not in idx_map:
            print(f"{RED}ERROR: Could not find a 'Listing Title' column. "
                  f"Headers found: {headers}{RESET}")
            sys.exit(1)

        for raw in reader:
            if not any(raw):
                continue
            row = {}
            for field, i in idx_map.items():
                row[field] = raw[i] if i < len(raw) else ""
            rows.append(row)
    return rows


# ── Report ────────────────────────────────────────────────────────────────────
def print_table(rows):
    COL_W = [55, 8, 8, 8, 12, 10, 8, 12]
    headers = ["Listing Title", "Views", "Orders", "Favs", "Revenue", "CR%", "Tier", "Action"]

    divider = "─" * sum(COL_W + [3 * len(COL_W)])

    def row_fmt(cols):
        return "  ".join(str(c).ljust(w) for c, w in zip(cols, COL_W))

    print(f"\n{BOLD}{row_fmt(headers)}{RESET}")
    print(divider)

    for r in rows:
        tier   = r["_tier"]
        action = r["_action"]
        color  = TIER_COLORS[tier]
        title  = (r.get("title") or "")[:54]
        views  = safe_int(r.get("views"))
        orders = safe_int(r.get("orders"))
        favs   = safe_int(r.get("favorites"))
        rev    = safe_float(r.get("revenue"))
        cr_raw = safe_float(r.get("cr"))
        cr     = cr_raw if cr_raw > 1 else cr_raw * 100

        cols = [title, views, orders, favs, f"${rev:.2f}", f"{cr:.1f}%", tier, action]
        print(f"{color}{row_fmt(cols)}{RESET}")

    print(divider)


def print_summary(rows):
    from collections import defaultdict
    tiers = defaultdict(list)
    for r in rows:
        tiers[r["_tier"]].append(r)

    print(f"\n{BOLD}── SUMMARY ──────────────────────────────────{RESET}")
    for tier in ["A", "B", "C", "D"]:
        label = {"A": "SCALE", "B": "FIX", "C": "MONITOR", "D": "KILL"}[tier]
        group = tiers.get(tier, [])
        total_rev = sum(safe_float(r.get("revenue")) for r in group)
        crs = [safe_float(r.get("cr")) for r in group if safe_float(r.get("cr")) > 0]
        avg_cr = (sum(crs) / len(crs) if crs else 0)
        avg_cr = avg_cr if avg_cr > 1 else avg_cr * 100
        color = TIER_COLORS[tier]
        print(f"  {color}{tier}-Tier ({label}){RESET}: "
              f"{len(group)} listings  |  "
              f"Revenue: ${total_rev:.2f}  |  "
              f"Avg CR: {avg_cr:.1f}%")


def write_csv(rows, source_path):
    out_path = os.path.join(os.path.dirname(os.path.abspath(source_path)),
                            "etsy_tier_grid_output.csv")
    fieldnames = list(rows[0].keys()) if rows else []
    # Put tier/action at front after title
    ordered = ["title", "_tier", "_action"] + [k for k in fieldnames
                                                if k not in ("title", "_tier", "_action")]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=ordered, extrasaction="ignore")
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
    return out_path


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <etsy_stats.csv>")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.exists(path):
        print(f"{RED}File not found: {path}{RESET}")
        sys.exit(1)

    rows = load_csv(path)

    for r in rows:
        tier, action = classify(r, {})
        r["_tier"]   = tier
        r["_action"] = action

    # Sort by revenue desc
    rows.sort(key=lambda r: safe_float(r.get("revenue")), reverse=True)

    print_table(rows)
    print_summary(rows)

    out = write_csv(rows, path)
    print(f"\n{BOLD}Output saved:{RESET} {out}\n")


# ── Sample data test ──────────────────────────────────────────────────────────
def _run_sample():
    """Run against built-in sample data for testing."""
    sample = """\
Listing Title,Views,Visits,Orders,Revenue,Favorites,Conversion Rate,Listing Date
Budget Planner Spreadsheet Google Sheets,450,380,22,330.00,87,4.89%,2024-06-01
Wedding Planning Spreadsheet Template,312,260,8,96.00,41,2.56%,2024-08-15
ADHD Daily Planner Dashboard Google Sheets,88,72,0,0.00,14,0.00%,2025-01-10
Debt Payoff Tracker Snowball Method,34,28,0,0.00,6,0.00%,2024-11-20
Sea Glass Place Cards Set of 50,7,5,0,0.00,2,0.00%,2024-09-01
Bachelorette Party Bundle Villa Vibes,190,160,11,165.00,38,5.79%,2024-07-01
Digital Cash Stuffing Envelopes,55,44,1,12.00,9,1.82%,2025-02-01
Etsy Seller Analytics Dashboard,22,18,0,0.00,3,0.00%,2025-03-01
White Personalized Water Bottle 40oz,10,8,0,0.00,1,0.00%,2024-10-01
Small Business Expense Tracker,145,120,4,60.00,22,2.76%,2024-12-01
"""
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False,
                                    encoding="utf-8") as tmp:
        tmp.write(sample)
        tmp_path = tmp.name

    print(f"{BOLD}Running on sample data...{RESET}\n")
    sys.argv = [sys.argv[0], tmp_path]
    main()
    os.unlink(tmp_path)
    # Clean up output
    out = os.path.join(os.path.dirname(tmp_path), "etsy_tier_grid_output.csv")
    if os.path.exists(out):
        os.unlink(out)


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--sample":
        _run_sample()
    else:
        main()
