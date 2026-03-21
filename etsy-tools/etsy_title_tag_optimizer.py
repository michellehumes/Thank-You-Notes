#!/usr/bin/env python3
"""
etsy_title_tag_optimizer.py — Shelzy's Designs Etsy SEO Title + Tag Generator

Usage:
    python etsy_title_tag_optimizer.py <listings.csv>
    python etsy_title_tag_optimizer.py --sample   # run on built-in test data

Input CSV columns:
    Listing Title, Category, Section, Key Features (optional pipe-separated)

Output:
    - Terminal: paste-ready titles + tags per listing, grouped by section
    - etsy_optimized_titles_tags.csv saved to same directory as input

Title rules enforced:
    - 140 char max
    - Front-load highest-volume buyer keyword
    - Pipe ( | ) separators between keyword phrases
    - No shop name or brand name
    - 3–4 distinct keyword phrases
    - Product type + use case + compatibility included where relevant

Tag rules enforced:
    - Exactly 13 tags
    - Multi-word phrases only
    - No duplicate concepts
    - Mix exact-match and long-tail
    - Include buyer intent phrases
"""

import sys
import csv
import os


# ── Keyword database by category ─────────────────────────────────────────────
# Format: (title_phrases[], tags_pool[])
KEYWORD_DB = {
    "budget spreadsheet": {
        "title_phrases": [
            "Budget Planner Spreadsheet",
            "Monthly Budget Template Google Sheets Excel",
            "Personal Finance Tracker",
            "Instant Download",
        ],
        "tags": [
            "budget planner spreadsheet",
            "monthly budget template",
            "google sheets budget",
            "excel budget tracker",
            "personal finance template",
            "paycheck budget spreadsheet",
            "digital budget planner",
            "household budget tracker",
            "zero based budget google sheets",
            "bi-weekly budget template",
            "income expense tracker",
            "instant download spreadsheet",
            "printable budget planner",
        ],
    },
    "wedding spreadsheet": {
        "title_phrases": [
            "Wedding Planning Spreadsheet",
            "Wedding Budget Tracker Google Sheets Excel",
            "Bride Wedding Organizer",
            "Instant Download",
        ],
        "tags": [
            "wedding planning spreadsheet",
            "wedding budget tracker",
            "wedding planner google sheets",
            "bride to be planner",
            "wedding guest list tracker",
            "wedding organizer digital",
            "wedding checklist template",
            "wedding vendor tracker",
            "bridal planning spreadsheet",
            "excel wedding planner",
            "wedding day timeline template",
            "digital wedding organizer",
            "gift for bride to be",
        ],
    },
    "debt tracker": {
        "title_phrases": [
            "Debt Payoff Tracker Spreadsheet",
            "Debt Snowball Avalanche Planner Google Sheets Excel",
            "Credit Card Payoff Tracker",
            "Instant Download",
        ],
        "tags": [
            "debt payoff tracker",
            "debt snowball spreadsheet",
            "debt avalanche tracker",
            "credit card payoff planner",
            "debt free planner",
            "google sheets debt tracker",
            "excel debt payoff template",
            "financial freedom planner",
            "debt reduction spreadsheet",
            "monthly debt tracker",
            "bill payment tracker",
            "instant download spreadsheet",
            "personal finance google sheets",
        ],
    },
    "adhd planner": {
        "title_phrases": [
            "ADHD Daily Planner Dashboard",
            "ADHD Productivity Tracker Google Sheets",
            "ADHD Task Manager Digital Planner",
            "Instant Download",
        ],
        "tags": [
            "adhd planner digital",
            "adhd daily planner",
            "adhd productivity tracker",
            "adhd task manager",
            "adhd google sheets dashboard",
            "executive function planner",
            "neurodivergent planner",
            "adhd organization tools",
            "adhd habit tracker",
            "digital planner adhd adult",
            "adhd schedule template",
            "instant download planner",
            "adhd life planner",
        ],
    },
    "etsy seller": {
        "title_phrases": [
            "Etsy Seller Analytics Dashboard",
            "Etsy Shop Tracker Spreadsheet Google Sheets",
            "Small Business Sales Tracker",
            "Instant Download",
        ],
        "tags": [
            "etsy seller spreadsheet",
            "etsy shop analytics tracker",
            "etsy sales dashboard",
            "small business tracker google sheets",
            "etsy income expense tracker",
            "etsy seller tools",
            "shop performance dashboard",
            "etsy profit tracker",
            "digital product business tracker",
            "etsy revenue tracker",
            "online shop analytics",
            "instant download spreadsheet",
            "etsy seller planner",
        ],
    },
    "small business": {
        "title_phrases": [
            "Small Business Spreadsheet Bundle",
            "Business Expense Tracker Google Sheets Excel",
            "Small Business Finance Templates",
            "Instant Download",
        ],
        "tags": [
            "small business spreadsheet",
            "business expense tracker",
            "small business finance template",
            "google sheets business tracker",
            "self employed expense tracker",
            "freelancer income tracker",
            "business budget spreadsheet",
            "profit and loss template",
            "small business planner",
            "business starter bundle",
            "entrepreneur spreadsheet",
            "instant download template",
            "excel business tracker",
        ],
    },
    "cash stuffing": {
        "title_phrases": [
            "Digital Cash Stuffing Envelopes",
            "Cash Envelope Budget System Google Sheets",
            "Digital Envelope Budget Tracker",
            "Instant Download",
        ],
        "tags": [
            "digital cash stuffing",
            "cash envelope budget",
            "cash stuffing spreadsheet",
            "digital envelope system",
            "envelope budget google sheets",
            "cash stuffing template",
            "budget envelope digital",
            "cash stuffing digital download",
            "dave ramsey envelope method",
            "zero based budget envelopes",
            "digital budget envelopes",
            "instant download budget",
            "cash stuffing planner",
        ],
    },
    "water bottle": {
        "title_phrases": [
            "Personalized Water Bottle 40oz",
            "Custom Name Tumbler Sublimation Water Bottle",
            "Bridesmaid Gift Water Bottle",
            "Ships from East Hampton NY",
        ],
        "tags": [
            "personalized water bottle",
            "custom name water bottle",
            "sublimation water bottle",
            "40oz personalized tumbler",
            "bridesmaid gift water bottle",
            "bachelorette water bottle",
            "custom tumbler gift",
            "personalized gift for her",
            "bridesmaid proposal gift",
            "custom water bottle wedding",
            "personalized stainless bottle",
            "bridal party gift set",
            "name water bottle gift",
        ],
    },
    "wedding physical": {
        "title_phrases": [
            "Sea Glass Place Cards",
            "Beach Wedding Place Cards Seating Cards",
            "Coastal Wedding Decor Seating",
            "Ships from East Hampton NY",
        ],
        "tags": [
            "sea glass place cards",
            "beach wedding place cards",
            "coastal wedding seating cards",
            "seaglass table cards",
            "nautical wedding decor",
            "beach wedding table setting",
            "custom place cards wedding",
            "unique wedding place cards",
            "boho beach wedding decor",
            "coastal wedding table decor",
            "sea glass wedding favor",
            "beach bridal shower decor",
            "handmade place cards",
        ],
    },
    "bachelorette": {
        "title_phrases": [
            "Bachelorette Party Bundle",
            "Villa Vibes Bachelorette Printables",
            "Bachelorette Weekend Games Itinerary",
            "Instant Download",
        ],
        "tags": [
            "bachelorette party bundle",
            "villa vibes bachelorette",
            "bachelorette printables",
            "bachelorette itinerary template",
            "bachelorette party games",
            "bach party printable bundle",
            "bachelorette weekend planner",
            "bride tribe activities",
            "bachelorette party decor printable",
            "girls trip bachelorette",
            "bachelorette digital download",
            "instant download bachelorette",
            "bachelorette scavenger hunt",
        ],
    },
    "budget bundle": {
        "title_phrases": [
            "Budget Starter Bundle Spreadsheet Pack",
            "Personal Finance Tracker Google Sheets Excel Bundle",
            "Budget Planner Set Instant Download",
            "Beginner Budget Template",
        ],
        "tags": [
            "budget bundle spreadsheet",
            "personal finance bundle",
            "budget starter kit",
            "google sheets bundle",
            "budget planner bundle",
            "financial planner bundle",
            "spreadsheet bundle digital",
            "budget template bundle",
            "money management bundle",
            "instant download bundle",
            "budget gift bundle",
            "excel spreadsheet bundle",
            "beginner budget spreadsheet",
        ],
    },
    "wedding bundle": {
        "title_phrases": [
            "Wedding Planning Bundle Spreadsheet Pack",
            "Complete Wedding Planner Google Sheets Excel",
            "Bride Bundle Wedding Templates",
            "Instant Download",
        ],
        "tags": [
            "wedding planning bundle",
            "wedding spreadsheet bundle",
            "complete wedding planner",
            "bride bundle digital",
            "wedding planner bundle",
            "wedding template bundle",
            "google sheets wedding bundle",
            "wedding organizer bundle",
            "engaged gift bundle",
            "wedding digital bundle",
            "bridal shower gift digital",
            "instant download wedding",
            "gift for bride bundle",
        ],
    },
    "business bundle": {
        "title_phrases": [
            "Small Business Starter Bundle Spreadsheet Pack",
            "Business Finance Tracker Templates Google Sheets Excel",
            "Entrepreneur Spreadsheet Bundle",
            "Instant Download",
        ],
        "tags": [
            "small business bundle",
            "business starter bundle",
            "entrepreneur spreadsheet bundle",
            "business template bundle",
            "google sheets business bundle",
            "small business tools digital",
            "self employed bundle",
            "freelancer spreadsheet bundle",
            "business finance bundle",
            "instant download business",
            "side hustle tracker bundle",
            "digital business bundle",
            "business planner bundle",
        ],
    },
}

# Fallback generic tags if no category match
FALLBACK_TAGS = [
    "digital download spreadsheet",
    "google sheets template",
    "excel template download",
    "instant download digital",
    "printable planner template",
    "editable spreadsheet",
    "digital planner template",
    "spreadsheet bundle",
    "personal planner download",
    "organizer template",
    "instant download template",
    "editable google sheets",
    "digital organizer template",
]


def build_title(phrases):
    """Join phrases with pipe, truncate to 140 chars."""
    title = " | ".join(phrases)
    if len(title) > 140:
        # Try dropping last phrase
        title = " | ".join(phrases[:-1])
    return title[:140]


def infer_category(title_raw):
    title = title_raw.lower()
    if "adhd" in title:
        return "adhd planner"
    if "debt" in title or "snowball" in title or "payoff" in title:
        return "debt tracker"
    if "cash stuff" in title or "envelope" in title:
        return "cash stuffing"
    if "etsy seller" in title or "etsy shop" in title or "etsy analytic" in title:
        return "etsy seller"
    if "bachelorette" in title or "bach" in title or "villa vibes" in title:
        return "bachelorette"
    if "wedding bundle" in title or "bride bundle" in title:
        return "wedding bundle"
    if "wedding" in title and ("place card" in title or "sea glass" in title):
        return "wedding physical"
    if "wedding" in title or "bride" in title or "bridal" in title:
        return "wedding spreadsheet"
    if "water bottle" in title or "tumbler" in title:
        return "water bottle"
    if "budget bundle" in title or "budget starter bundle" in title:
        return "budget bundle"
    if "business bundle" in title or "small business starter" in title:
        return "business bundle"
    if "small business" in title or "expense tracker" in title:
        return "small business"
    if "budget" in title or "paycheck" in title or "finance" in title:
        return "budget spreadsheet"
    return None


def optimize_listing(row):
    original_title = row.get("title", row.get("Listing Title", "")).strip()
    section        = row.get("section", row.get("Section", "General")).strip()
    category       = row.get("category", row.get("Category", "")).strip().lower()

    if not category:
        category = infer_category(original_title)

    data = KEYWORD_DB.get(category)

    if data:
        phrases = data["title_phrases"]
        tags    = data["tags"]
    else:
        # Generic fallback
        phrases = [original_title, "Digital Download", "Instant Download", "Google Sheets Excel"]
        tags    = FALLBACK_TAGS

    new_title = build_title(phrases)
    assert len(new_title) <= 140, f"Title too long: {len(new_title)}"
    assert len(tags) == 13, f"Tag count off: {len(tags)}"

    return {
        "section":        section,
        "original_title": original_title,
        "new_title":      new_title,
        "char_count":     len(new_title),
        "tags":           tags,
        "category":       category or "unmatched",
    }


def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            # Normalize keys to lowercase
            rows.append({k.lower().strip(): v for k, v in r.items()})
    return rows


def print_results(results):
    from collections import defaultdict
    by_section = defaultdict(list)
    for r in results:
        by_section[r["section"]].append(r)

    print()
    for section, listings in sorted(by_section.items()):
        print(f"\n{'='*70}")
        print(f"  SECTION: {section.upper()}")
        print(f"{'='*70}")
        for r in listings:
            print(f"\n  Original : {r['original_title']}")
            print(f"  New Title: {r['new_title']}")
            print(f"  Chars    : {r['char_count']}/140")
            print(f"  Tags ({len(r['tags'])}):")
            for i, tag in enumerate(r["tags"], 1):
                print(f"    {i:2}. {tag}")


def write_csv(results, source_path):
    out_path = os.path.join(
        os.path.dirname(os.path.abspath(source_path)),
        "etsy_optimized_titles_tags.csv"
    )
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Section", "Original Title", "New Title", "Char Count",
                         "Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5", "Tag 6",
                         "Tag 7", "Tag 8", "Tag 9", "Tag 10", "Tag 11", "Tag 12",
                         "Tag 13"])
        for r in results:
            writer.writerow([
                r["section"], r["original_title"], r["new_title"], r["char_count"],
                *r["tags"]
            ])
    return out_path


def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <listings.csv>")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.exists(path):
        print(f"File not found: {path}")
        sys.exit(1)

    rows    = load_csv(path)
    results = [optimize_listing(r) for r in rows]

    print_results(results)
    out = write_csv(results, path)
    print(f"\nOutput saved: {out}\n")


def _run_sample():
    sample = """\
Listing Title,Category,Section
Paycheck Budget Spreadsheet,budget spreadsheet,Budget Templates
Wedding Planning Spreadsheet,wedding spreadsheet,Wedding Templates
ADHD Dashboard Google Sheets,adhd planner,Planners & Trackers
Debt Payoff Tracker,debt tracker,Budget Templates
Bachelorette Bundle Villa Vibes,bachelorette,Party Printables
Budget Starter Bundle,budget bundle,Bundles
Sea Glass Place Cards,wedding physical,Wedding Physical
"""
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, encoding="utf-8") as tmp:
        tmp.write(sample)
        tmp_path = tmp.name

    print("Running on sample data...\n")
    sys.argv = [sys.argv[0], tmp_path]
    main()
    os.unlink(tmp_path)
    out = os.path.join(os.path.dirname(tmp_path), "etsy_optimized_titles_tags.csv")
    if os.path.exists(out):
        os.unlink(out)


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--sample":
        _run_sample()
    else:
        main()
