#!/usr/bin/env python3
"""
etsy_description_generator.py — Shelzy's Designs Etsy Listing Description Generator

Usage:
    python etsy_description_generator.py --name "Product Name" --type digital \
        --features "Feature 1|Feature 2|Feature 3" --persona "Budget beginners|Newlyweds"

    python etsy_description_generator.py --sample   # run 3 built-in examples

Arguments:
    --name       Product name (required)
    --type       "digital" or "physical" (default: digital)
    --features   Pipe-separated list of key features
    --persona    Pipe-separated list of target buyer personas
    --files      Pipe-separated list of file names included (digital only)
    --formats    File formats, e.g. "Google Sheets, Microsoft Excel" (digital only)
    --material   Product material (physical only)
    --size       Product size/dimensions (physical only)
    --custom     What can be customized (physical only)
    --output     Save to file path (optional; prints to terminal if omitted)

Output:
    Complete paste-ready Etsy description, plain text, under 1500 words.
    Uses unicode dividers that render in Etsy.
"""

import argparse
import sys
import os
import textwrap


DIV = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


# ── Hook library ──────────────────────────────────────────────────────────────
HOOKS = {
    "budget":    ("Stop budgeting in your head — get it all in one clean, color-coded spreadsheet. "
                  "This template does the math so you can focus on actually reaching your goals."),
    "wedding":   ("Planning a wedding shouldn't feel like a second job. "
                  "This spreadsheet keeps every vendor, budget line, and guest list detail in one place."),
    "adhd":      ("Designed for the way your brain actually works. "
                  "This planner breaks your day into focused blocks so tasks get done, not forgotten."),
    "debt":      ("See exactly how fast you can pay off every debt — and watch the numbers shrink. "
                  "This tracker does the snowball and avalanche math automatically."),
    "business":  ("Running a business means tracking every dollar. "
                  "This spreadsheet gives you a clean, professional dashboard for income, expenses, and profit."),
    "etsy":      ("Know exactly what's selling, what's stalling, and where your money is coming from. "
                  "This dashboard turns your Etsy stats into a clear weekly picture."),
    "cash":      ("The cash envelope method, done digitally. "
                  "Allocate every dollar before you spend it — no physical envelopes required."),
    "water":     ("A personalized water bottle they'll actually use every day. "
                  "Sublimation-printed for a clean, lasting finish that won't peel or fade."),
    "place":     ("Set the scene with something they've never seen on a table before. "
                  "These sea glass place cards bring real coastal texture to your wedding day."),
    "bundle":    ("Everything you need in one download — no hunting for separate templates. "
                  "This bundle covers every spreadsheet from day one so you're organized from the start."),
    "default":   ("Designed to save you hours of setup and keep you organized from day one. "
                  "Download, open, and start using — no formula-building required."),
}


def pick_hook(name):
    n = name.lower()
    if "adhd" in n:              return HOOKS["adhd"]
    if "debt" in n:              return HOOKS["debt"]
    if "cash stuff" in n:        return HOOKS["cash"]
    if "etsy" in n:              return HOOKS["etsy"]
    if "business" in n:          return HOOKS["business"]
    if "wedding" in n:           return HOOKS["wedding"]
    if "budget" in n or "paycheck" in n or "finance" in n: return HOOKS["budget"]
    if "water bottle" in n:      return HOOKS["water"]
    if "place card" in n:        return HOOKS["place"]
    if "bundle" in n:            return HOOKS["bundle"]
    return HOOKS["default"]


# ── Template builders ─────────────────────────────────────────────────────────
def build_digital(name, features, personas, files, formats):
    hook     = pick_hook(name)
    feat_list = features if features else ["Easy to customize", "Works on mobile and desktop", "No formulas to build — it's done for you"]
    persona_list = personas if personas else ["Anyone wanting to get organized", "Digital product lovers", "Spreadsheet beginners"]
    file_list = files if files else [f"{name}.xlsx", f"{name} (Google Sheets link).pdf"]
    fmt_str   = formats if formats else "Google Sheets and Microsoft Excel"

    lines = []

    # Opening hook
    lines.append(hook)
    lines.append("")

    # What's Included
    lines.append(DIV)
    lines.append("📋 WHAT'S INCLUDED")
    lines.append(DIV)
    lines.append("")
    for feat in feat_list:
        lines.append(f"✔ {feat}")
    lines.append("")

    # Key Features
    lines.append(DIV)
    lines.append("✨ KEY FEATURES")
    lines.append(DIV)
    lines.append("")
    for i, feat in enumerate(feat_list[:5], 1):
        lines.append(f"{i}. {feat}")
    lines.append("")

    # How It Works
    lines.append(DIV)
    lines.append("⚡ HOW IT WORKS")
    lines.append(DIV)
    lines.append("")
    lines.append("1. Purchase and download your file instantly")
    lines.append("2. Open in Google Sheets (free) or Microsoft Excel")
    lines.append("3. Follow the included setup instructions")
    lines.append("4. Start entering your data — everything auto-calculates")
    lines.append("")

    # Perfect For
    lines.append(DIV)
    lines.append("💛 PERFECT FOR")
    lines.append(DIV)
    lines.append("")
    for p in persona_list:
        lines.append(f"→ {p}")
    lines.append("")

    # Your Download Includes
    lines.append(DIV)
    lines.append("📥 YOUR DOWNLOAD INCLUDES")
    lines.append(DIV)
    lines.append("")
    for f in file_list:
        lines.append(f"• {f}")
    lines.append("")
    lines.append("Files are delivered as a .zip folder. Extract before opening.")
    lines.append("You'll receive your download link immediately after purchase.")
    lines.append("")

    # Compatibility
    lines.append(DIV)
    lines.append("💻 COMPATIBILITY")
    lines.append(DIV)
    lines.append("")
    lines.append(f"Works with: {fmt_str}")
    lines.append("Compatible with desktop, laptop, tablet, and mobile devices.")
    lines.append("Google Sheets is free — no software purchase required.")
    lines.append("")

    # Need Help?
    lines.append(DIV)
    lines.append("💬 NEED HELP?")
    lines.append(DIV)
    lines.append("")
    lines.append("Message me through Etsy — I respond within 24 hours.")
    lines.append("I'm happy to help with setup, customization questions, or anything else.")
    lines.append("")

    return "\n".join(lines)


def build_physical(name, features, personas, material, size, customization):
    hook = pick_hook(name)
    feat_list    = features if features else ["Handmade with care", "Durable and long-lasting", "Ships carefully packaged"]
    persona_list = personas if personas else ["Wedding couples", "Gift givers", "Event hosts"]
    mat_str      = material if material else "Premium quality materials"
    size_str     = size if size else "See listing photos for exact dimensions"
    custom_str   = customization if customization else "Personalization details can be added via the notes at checkout"

    lines = []

    lines.append(hook)
    lines.append("")

    lines.append(DIV)
    lines.append("📦 PRODUCT DETAILS")
    lines.append(DIV)
    lines.append("")
    lines.append(f"Material: {mat_str}")
    lines.append(f"Size: {size_str}")
    for feat in feat_list:
        lines.append(f"• {feat}")
    lines.append("")

    lines.append(DIV)
    lines.append("✏️ PERSONALIZATION")
    lines.append(DIV)
    lines.append("")
    lines.append(custom_str)
    lines.append("Add your personalization details in the notes field at checkout.")
    lines.append("For questions about custom options, message me before ordering.")
    lines.append("")

    lines.append(DIV)
    lines.append("💛 PERFECT FOR")
    lines.append(DIV)
    lines.append("")
    for p in persona_list:
        lines.append(f"→ {p}")
    lines.append("")

    lines.append(DIV)
    lines.append("🚚 SHIPPING")
    lines.append(DIV)
    lines.append("")
    lines.append("Processing time: 3–5 business days")
    lines.append("Ships from: East Hampton, NY")
    lines.append("Shipping carrier: USPS")
    lines.append("Items are carefully packaged to arrive in perfect condition.")
    lines.append("")

    lines.append(DIV)
    lines.append("🧼 CARE INSTRUCTIONS")
    lines.append(DIV)
    lines.append("")
    if "water bottle" in name.lower() or "tumbler" in name.lower():
        lines.append("Hand wash only. Not dishwasher safe.")
        lines.append("Avoid submerging lid in water.")
        lines.append("Sublimation print is durable but keep away from abrasive scrubbers.")
    elif "place card" in name.lower():
        lines.append("Keep dry. Display indoors only.")
        lines.append("Handle with care — natural sea glass may have sharp edges.")
    else:
        lines.append("Handle with care. Store in a dry location.")

    lines.append("")
    lines.append(DIV)
    lines.append("💬 QUESTIONS?")
    lines.append(DIV)
    lines.append("")
    lines.append("Message me through Etsy before ordering if you have any questions.")
    lines.append("I respond within 24 hours and want you to love what you receive.")
    lines.append("")

    return "\n".join(lines)


def word_count(text):
    return len(text.split())


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate Etsy listing descriptions for Shelzy's Designs")
    parser.add_argument("--name",     required=False, help="Product name")
    parser.add_argument("--type",     default="digital", choices=["digital", "physical"])
    parser.add_argument("--features", default="", help="Pipe-separated key features")
    parser.add_argument("--persona",  default="", help="Pipe-separated buyer personas")
    parser.add_argument("--files",    default="", help="Pipe-separated file names (digital)")
    parser.add_argument("--formats",  default="", help="Compatibility string (digital)")
    parser.add_argument("--material", default="", help="Material (physical)")
    parser.add_argument("--size",     default="", help="Size/dimensions (physical)")
    parser.add_argument("--custom",   default="", help="Customization info (physical)")
    parser.add_argument("--output",   default="", help="Save to this file path")
    parser.add_argument("--sample",   action="store_true")
    args = parser.parse_args()

    if args.sample:
        _run_samples()
        return

    if not args.name:
        parser.print_help()
        sys.exit(1)

    features = [f.strip() for f in args.features.split("|") if f.strip()] if args.features else []
    personas = [p.strip() for p in args.persona.split("|") if p.strip()]  if args.persona  else []
    files    = [f.strip() for f in args.files.split("|")    if f.strip()] if args.files    else []

    if args.type == "digital":
        desc = build_digital(args.name, features, personas, files, args.formats)
    else:
        desc = build_physical(args.name, features, personas, args.material, args.size, args.custom)

    wc = word_count(desc)
    print(desc)
    print(f"\n[Word count: {wc} / 1500 limit]")

    if wc > 1500:
        print(f"⚠️  Description exceeds 1500 words. Consider trimming features or personas.")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(desc)
        print(f"\nSaved to: {args.output}")


def _run_samples():
    samples = [
        {
            "name": "Budget Starter Bundle",
            "type": "digital",
            "features": [
                "3 spreadsheet templates: Monthly Budget, Paycheck Planner, Savings Tracker",
                "All formulas pre-built — just enter your numbers",
                "Color-coded categories for easy scanning",
                "Works on both free Google Sheets and Microsoft Excel",
                "Includes a quick-start guide tab",
            ],
            "personas": [
                "First-time budgeters who feel overwhelmed by spreadsheets",
                "Anyone starting a zero-based budget",
                "People who've tried apps but prefer spreadsheets",
            ],
            "files": [
                "Budget_Starter_Bundle.zip",
                "Monthly_Budget_Template.xlsx",
                "Paycheck_Planner.xlsx",
                "Savings_Tracker.xlsx",
                "Google_Sheets_Links.pdf",
            ],
            "formats": "Google Sheets and Microsoft Excel",
        },
        {
            "name": "Wedding Planning Spreadsheet Bundle",
            "type": "digital",
            "features": [
                "5 tabs: Budget, Guest List, Vendor Tracker, Seating Chart, Day-Of Timeline",
                "Budget auto-totals by category with remaining balance tracker",
                "Guest list filters by RSVP status and meal choice",
                "Vendor contact log with contract deadlines",
                "Day-of timeline broken into 15-minute intervals",
            ],
            "personas": [
                "Engaged couples who want one place for everything",
                "Budget-conscious brides tracking every vendor",
                "Bridesmaids helping coordinate the day",
            ],
            "files": [
                "Wedding_Planning_Bundle.zip",
                "Wedding_Budget_Tracker.xlsx",
                "Guest_List_Manager.xlsx",
                "Vendor_Tracker.xlsx",
                "Google_Sheets_Links.pdf",
            ],
            "formats": "Google Sheets and Microsoft Excel",
        },
        {
            "name": "Personalized Water Bottle 40oz",
            "type": "physical",
            "features": [
                "Sublimation-printed for vivid, permanent color",
                "40oz stainless steel — keeps drinks cold 24 hours",
                "Leak-proof lid with handle",
                "Custom name or text printed on the bottle",
            ],
            "personas": [
                "Brides looking for matching bridesmaid gifts",
                "Bachelorette party hosts",
                "Anyone wanting a personalized gift for her",
            ],
            "material": "Stainless steel, BPA-free",
            "size": "40oz / 1.2L — approx 11 inches tall",
            "customization": "Add your name, date, or short phrase (max 25 characters). Enter in the notes field at checkout.",
        },
    ]

    for s in samples:
        print(f"\n{'#'*70}")
        print(f"# {s['name'].upper()}")
        print(f"{'#'*70}\n")
        if s["type"] == "digital":
            desc = build_digital(s["name"], s["features"], s["personas"], s["files"], s["formats"])
        else:
            desc = build_physical(s["name"], s["features"], s["personas"],
                                  s["material"], s["size"], s["customization"])
        print(desc)
        wc = word_count(desc)
        print(f"[Word count: {wc}]")


if __name__ == "__main__":
    main()
