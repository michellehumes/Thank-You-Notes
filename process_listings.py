#!/usr/bin/env python3
"""
Etsy Digital Product Production Engine — process_listings.py
Loads etsy_master_listings.csv, classifies products, generates build specs,
image prompts, and image_queue.json for batch rendering.
"""

import pandas as pd
import json
import re
import os
import sys

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CSV_PATH = "etsy_master_listings.csv"

CATEGORY_KEYWORDS = {
    "spreadsheet_system": [
        "spreadsheet", "excel", "google sheets", "tracker", "budget tracker",
        "financial tracker", "xlsx", "editable spreadsheet", "bookkeeping",
        "accounting", "expense tracker", "inventory tracker", "kpi dashboard",
        "business tracker", "revenue tracker", "profit loss"
    ],
    "planner_system": [
        "planner", "agenda", "daily planner", "weekly planner", "monthly planner",
        "undated planner", "dated planner", "goal planner", "habit tracker",
        "meal planner", "fitness planner", "wedding planner", "schedule",
        "to do list", "to-do list", "journal", "calendar"
    ],
    "printable_bundle": [
        "printable bundle", "print at home", "pdf printable", "printable set",
        "printable pack", "instant download bundle", "digital download bundle",
        "printable kit"
    ],
    "wall_art_printable": [
        "wall art", "art print", "digital art", "poster", "gallery wall",
        "nursery art", "home decor print", "wall decor", "digital print",
        "printable art", "minimalist art", "abstract art", "watercolor print"
    ],
    "sublimation_png_bundle": [
        "sublimation", "tumbler wrap", "sublimation design", "mug wrap",
        "sublimation bundle", "sublimation png", "tumbler design",
        "20oz tumbler", "skinny tumbler", "sublimation transfer"
    ],
    "educational_activity": [
        "worksheet", "activity", "learning", "educational", "homeschool",
        "kids activity", "coloring page", "coloring book", "tracing",
        "preschool", "kindergarten", "math worksheet", "sight words",
        "flashcards", "busy book"
    ],
}

# Priority order for tie-breaking
CATEGORY_PRIORITY = [
    "spreadsheet_system", "planner_system", "printable_bundle",
    "wall_art_printable", "sublimation_png_bundle", "educational_activity"
]

GLOBAL_IMAGE_PREAMBLE = (
    "Digital product listing image. Dimensions: 2700 x 2025 px, 4:3 aspect ratio, "
    "300 DPI, RGB color mode. Pure white background. Bright, high-contrast, premium "
    "structured layout. No decorative clutter. Strong thumbnail readability at small "
    "sizes. Slight soft shadow depth beneath elements for dimension. "
    "NO stock mockups. NO laptops. NO desk props. NO hands. "
    "Digital product preview only. Clean modern professional design."
)

CATEGORY_STYLING = {
    "spreadsheet_system": (
        "Show spreadsheet interface with visible cells, formulas, color-coded tabs, "
        "conditional formatting highlights, charts/graphs, and clean data layout. "
        "Professional business aesthetic."
    ),
    "planner_system": (
        "Show planner pages with dated headers, section dividers, check boxes, "
        "lined areas, and organized layout sections. Clean minimal stationery aesthetic."
    ),
    "printable_bundle": (
        "Show multiple printable pages arranged in an organized spread. "
        "Variety of page designs visible. Clean print-ready aesthetic."
    ),
    "wall_art_printable": (
        "Show the art piece prominently with clean framing lines suggesting a print. "
        "Emphasize color, composition, and visual impact. Gallery-quality presentation."
    ),
    "sublimation_png_bundle": (
        "Show the sublimation design wrapped or flat with vibrant full-color graphics. "
        "Show how design maps to product surface. Bold colorful aesthetic."
    ),
    "educational_activity": (
        "Show activity pages with kid-friendly layouts, illustrations, writing lines, "
        "and interactive elements. Bright cheerful educational aesthetic."
    ),
    "other": (
        "Show the digital product in a clean, professional layout with clear structure "
        "and organized presentation."
    ),
}

IMAGE_SLOTS = [
    {
        "number": 1,
        "name": "HERO IMAGE",
        "template": (
            "HERO IMAGE — Primary listing thumbnail. "
            "Dominant product preview of \"{title}\" filling 60-70% of the frame. "
            "Bold headline text at top: \"{headline}\". "
            "Supporting subheadline below: \"{subheadline}\". "
            "Trust badge in corner: \"{badge}\". "
            "Strong visual hierarchy: headline > product > subheadline > badge. "
            "Product is the clear focal point. Premium typography with clean sans-serif font."
        ),
    },
    {
        "number": 2,
        "name": "EVERYTHING INCLUDED",
        "template": (
            "EVERYTHING INCLUDED — Full contents overview. "
            "Clean grid layout showing all items included in \"{title}\". "
            "Arrange components in an organized 2x3 or 3x3 grid with clear spacing. "
            "Each grid item has a small label beneath it. "
            "Header text: \"Everything You Get\". "
            "Show the complete scope of what the buyer receives. "
            "Even spacing, aligned edges, consistent sizing across grid items."
        ),
    },
    {
        "number": 3,
        "name": "FEATURE POWER IMAGE",
        "template": (
            "FEATURE POWER IMAGE — Strongest feature zoom. "
            "Zoomed-in view highlighting the most valuable feature of \"{title}\". "
            "Header: \"{feature_headline}\". "
            "Callout arrows or highlight boxes pointing to the key feature. "
            "Show detail and quality of the specific feature. "
            "Clean annotation style with thin lines connecting labels to features."
        ),
    },
    {
        "number": 4,
        "name": "USE CASE IMAGE",
        "template": (
            "USE CASE IMAGE — Target audience and application. "
            "Show who \"{title}\" is perfect for and how they use it. "
            "Header: \"Perfect For\" with 3-4 use case labels arranged cleanly. "
            "Icons or simple illustrations representing each use case. "
            "Show practical real-world application context. "
            "Clean infographic style with consistent icon sizing."
        ),
    },
    {
        "number": 5,
        "name": "CLOSE DETAIL IMAGE",
        "template": (
            "CLOSE DETAIL IMAGE — Quality and readability showcase. "
            "Extreme close-up crop of \"{title}\" showing fine detail, text clarity, "
            "and production quality. Show that text is crisp and readable. "
            "Show formatting precision and professional finish. "
            "Header: \"Crystal Clear Quality\". "
            "Magnification effect or zoom-in visual treatment."
        ),
    },
    {
        "number": 6,
        "name": "VALUE STACK IMAGE",
        "template": (
            "VALUE STACK IMAGE — Perceived value and abundance. "
            "Layered fanned-out arrangement of all pages/components in \"{title}\". "
            "Create a sense of abundance and high value. "
            "Pages slightly overlapping in a cascading spread. "
            "Header: \"Incredible Value\" with item count badge. "
            "Show volume and comprehensiveness of the product."
        ),
    },
    {
        "number": 7,
        "name": "TECH / PRINT SPECS IMAGE",
        "template": (
            "TECH SPECS IMAGE — File details and compatibility. "
            "Clean infographic showing technical specifications for \"{title}\". "
            "Display: file type badge ({file_type}), page size, instant download icon, "
            "compatibility badges (iPad, PC, Mac, Print). "
            "Header: \"Instant Download\". "
            "Organized spec list with icons. "
            "Clean technical layout with consistent badge styling."
        ),
    },
]


# ---------------------------------------------------------------------------
# Column name normalization
# ---------------------------------------------------------------------------

COLUMN_MAP = {
    "listing_title": "title",
    "name": "title",
    "item_title": "title",
    "listing_name": "title",
    "product_title": "title",
    "listing_description": "description",
    "item_description": "description",
    "product_description": "description",
    "desc": "description",
    "listing_tags": "tags",
    "item_tags": "tags",
    "product_tags": "tags",
    "listing_category": "category",
    "item_category": "category",
    "product_category": "category",
    "taxonomy": "category",
    "listing_price": "price",
    "item_price": "price",
    "product_price": "price",
    "current_price": "price",
    "listing_url": "url",
    "item_url": "url",
    "product_url": "url",
    "link": "url",
}


# ---------------------------------------------------------------------------
# Functions
# ---------------------------------------------------------------------------

def load_and_clean(csv_path):
    """Load CSV and normalize column names."""
    if not os.path.exists(csv_path):
        print(f"ERROR: {csv_path} not found.")
        print("Run your Apify Etsy scrape and export the CSV first.")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    # Normalize columns: lowercase, strip whitespace
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Map known variants
    rename = {}
    for col in df.columns:
        if col in COLUMN_MAP:
            rename[col] = COLUMN_MAP[col]
    if rename:
        df = df.rename(columns=rename)

    # Ensure required columns exist
    required = ["title"]
    for r in required:
        if r not in df.columns:
            print(f"ERROR: Required column '{r}' not found in CSV.")
            print(f"Available columns: {list(df.columns)}")
            sys.exit(1)

    # Fill missing optional columns
    for col in ["description", "tags", "category", "price", "url"]:
        if col not in df.columns:
            df[col] = ""

    df = df.fillna("")
    # Convert all text columns to string
    for col in ["title", "description", "tags", "category", "url"]:
        df[col] = df[col].astype(str)

    print(f"Loaded {len(df)} listings from {csv_path}")
    return df


def make_clean_name(title):
    """Create a folder-safe clean name from a listing title."""
    name = title.lower()
    name = re.sub(r"[^a-z0-9\s]", "", name)
    name = re.sub(r"\s+", "_", name.strip())
    name = name.strip("_")
    return name[:40]


def deduplicate_names(names):
    """Ensure all clean names are unique by appending _2, _3, etc."""
    seen = {}
    result = []
    for name in names:
        if name in seen:
            seen[name] += 1
            result.append(f"{name}_{seen[name]}")
        else:
            seen[name] = 1
            result.append(name)
    return result


def classify_listing(title, description, tags):
    """Classify a listing into a product type based on keyword matching."""
    search_text = f"{title} {description} {tags}".lower()

    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in search_text)
        scores[category] = score

    max_score = max(scores.values())
    if max_score == 0:
        return "other"

    # Use priority order for tie-breaking
    for cat in CATEGORY_PRIORITY:
        if scores[cat] == max_score:
            return cat

    return "other"


def get_file_type(product_type):
    """Determine the primary file type based on product category."""
    mapping = {
        "spreadsheet_system": ".xlsx / Google Sheets",
        "planner_system": "PDF",
        "printable_bundle": "PDF (multi-page)",
        "wall_art_printable": "PNG / PDF (high-res)",
        "sublimation_png_bundle": "PNG (300 DPI, transparent)",
        "educational_activity": "PDF",
        "other": "PDF / PNG",
    }
    return mapping.get(product_type, "PDF / PNG")


def get_value_angle(product_type):
    """Determine the value positioning angle for the product."""
    mapping = {
        "spreadsheet_system": "Small business growth & productivity",
        "planner_system": "Personal organization & goal achievement",
        "printable_bundle": "Creative convenience & instant access",
        "wall_art_printable": "Home aesthetics & personal expression",
        "sublimation_png_bundle": "Boutique apparel & craft business energy",
        "educational_activity": "Educational value & child development",
        "other": "Practical digital convenience",
    }
    return mapping.get(product_type, "Practical digital convenience")


def generate_build_spec(row, product_type, clean_name):
    """Generate a template build specification for a listing."""
    title = row["title"]
    price = row["price"]
    url = row["url"]
    file_type = get_file_type(product_type)
    value_angle = get_value_angle(product_type)

    spec = f"""## {title}

- **Clean Name:** `{clean_name}`
- **Product Type:** `{product_type}`
- **Price:** {price}
- **URL:** {url}

### 1. Final File Type
{file_type}

### 2. Required Pages / Tabs
"""

    if product_type == "spreadsheet_system":
        spec += """- Dashboard (overview with KPIs)
- Data Entry (main input sheet)
- Summary / Reports (auto-calculated)
- Instructions (how-to-use tab)

### 3. Spreadsheet Specifications
- **Formulas:** SUM, AVERAGE, COUNTIF, conditional calculations
- **Conditional Formatting:** Color-coded status indicators, threshold alerts
- **KPI Logic:** Auto-calculated metrics from data entry
- **Charts:** At least 1 summary chart on Dashboard
- **Data Validation:** Dropdown lists for category fields, date pickers
"""
    elif product_type == "planner_system":
        spec += """- Cover Page
- Yearly Overview
- Monthly Spreads (12)
- Weekly Spreads
- Notes / Goals Pages

### 3. Printable Specifications
- **Page Size:** US Letter (8.5 x 11 in) + A4 compatibility
- **Margins:** 0.5 in minimum for print safety
- **Typography:** Clean sans-serif, high readability
- **Line Thickness:** 0.5pt for writing lines
- **Print Clarity:** Optimized for both inkjet and laser
- **Black Ink Optimization:** Minimize color for economical printing
"""
    elif product_type == "printable_bundle":
        spec += """- Multiple themed pages
- Cover / title page
- Variety of layouts within bundle

### 3. Printable Specifications
- **Page Size:** US Letter (8.5 x 11 in) + A4 compatibility
- **Margins:** 0.5 in minimum
- **Typography:** Clean, readable fonts
- **Print Clarity:** High contrast for clean printing
"""
    elif product_type == "wall_art_printable":
        spec += """- Main art file (multiple size ratios)
- Common sizes: 5x7, 8x10, 11x14, 16x20, A4, A3

### 3. Art Specifications
- **Resolution:** 300 DPI minimum
- **Color Mode:** RGB for digital, CMYK-safe colors
- **File Formats:** PNG + PDF
"""
    elif product_type == "sublimation_png_bundle":
        spec += """- Individual design PNGs
- Template/wrap guides
- Size reference sheet

### 3. Sublimation Specifications
- **Resolution:** 300 DPI
- **Background:** Transparent PNG
- **Color Mode:** RGB (vibrant for sublimation)
- **Sizing:** Matched to standard tumbler/mug dimensions
"""
    elif product_type == "educational_activity":
        spec += """- Activity pages (varied types)
- Answer key (if applicable)
- Instructions for parents/teachers

### 3. Educational Specifications
- **Page Size:** US Letter (8.5 x 11 in) + A4
- **Typography:** Kid-friendly, large readable fonts
- **Line Thickness:** Thick lines for young writers
- **Print Clarity:** High contrast, minimal ink usage
"""
    else:
        spec += """- Main content pages
- Cover / title page
- Instructions if needed

### 3. General Specifications
- **Page Size:** US Letter + A4 compatibility
- **Resolution:** 300 DPI
"""

    spec += f"""
### 4. Styling Direction
- White background
- High contrast elements
- Clean modern layout
- Professional visual hierarchy
- No clutter or decorative noise

### 5. Value Positioning
{value_angle}

### 6. Suggested Filename
`{clean_name}.{file_type.split('/')[0].strip().lower().replace('(', '').replace(')', '').split()[0]}`

---
"""
    return spec


def generate_image_prompts(row, product_type, clean_name):
    """Generate 7 high-conversion Etsy image prompts for a listing."""
    title = row["title"]
    description = str(row["description"])[:200]
    file_type = get_file_type(product_type)
    styling = CATEGORY_STYLING.get(product_type, CATEGORY_STYLING["other"])

    # Build context for template variables
    headline = title[:60]
    subheadline = f"Professional {product_type.replace('_', ' ').title()} — Instant Download"
    badge = "Instant Download" if "download" in description.lower() else "Digital Product"
    feature_headline = f"Key Feature: {product_type.replace('_', ' ').title()}"

    prompts = []
    for slot in IMAGE_SLOTS:
        prompt_body = slot["template"].format(
            title=title,
            headline=headline,
            subheadline=subheadline,
            badge=badge,
            feature_headline=feature_headline,
            file_type=file_type,
        )

        full_prompt = f"{GLOBAL_IMAGE_PREAMBLE}\n\n{prompt_body}\n\nCategory styling: {styling}"

        prompts.append({
            "listing": clean_name,
            "image_number": slot["number"],
            "slot_name": slot["name"],
            "prompt": full_prompt,
        })

    return prompts


def write_template_build_specs(df, specs):
    """Write template_build_specs.md."""
    with open("template_build_specs.md", "w", encoding="utf-8") as f:
        f.write("# Template Build Specifications\n\n")
        f.write(f"Generated from {len(df)} Etsy listings.\n\n")
        f.write("---\n\n")
        for spec in specs:
            f.write(spec)
            f.write("\n")
    print(f"Written: template_build_specs.md ({len(specs)} listings)")


def write_image_prompts_master(all_prompts):
    """Write image_prompts_master.md."""
    with open("image_prompts_master.md", "w", encoding="utf-8") as f:
        f.write("# Image Prompts Master\n\n")
        f.write(f"Total prompts: {len(all_prompts)}\n\n")
        f.write("---\n\n")

        current_listing = None
        for p in all_prompts:
            if p["listing"] != current_listing:
                current_listing = p["listing"]
                f.write(f"## {current_listing}\n\n")

            f.write(f"### Image {p['image_number']}: {p['slot_name']}\n\n")
            f.write(f"```\n{p['prompt']}\n```\n\n")

    print(f"Written: image_prompts_master.md ({len(all_prompts)} prompts)")


def write_image_queue(all_prompts):
    """Write image_queue.json."""
    queue = []
    for p in all_prompts:
        queue.append({
            "listing": p["listing"],
            "image_number": p["image_number"],
            "prompt": p["prompt"],
        })

    with open("image_queue.json", "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)

    print(f"Written: image_queue.json ({len(queue)} items)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("ETSY DIGITAL PRODUCT PRODUCTION ENGINE")
    print("=" * 60)
    print()

    # Load data
    df = load_and_clean(CSV_PATH)

    # Generate clean names
    raw_names = [make_clean_name(t) for t in df["title"]]
    clean_names = deduplicate_names(raw_names)
    df["clean_name"] = clean_names

    # Classify
    df["product_type"] = df.apply(
        lambda r: classify_listing(r["title"], r["description"], r["tags"]),
        axis=1,
    )

    # Print classification summary
    print("\nClassification Summary:")
    for ptype in CATEGORY_PRIORITY + ["other"]:
        count = (df["product_type"] == ptype).sum()
        if count > 0:
            print(f"  {ptype}: {count}")
    print()

    # Generate build specs
    specs = []
    for _, row in df.iterrows():
        spec = generate_build_spec(row, row["product_type"], row["clean_name"])
        specs.append(spec)

    # Generate image prompts
    all_prompts = []
    for _, row in df.iterrows():
        prompts = generate_image_prompts(row, row["product_type"], row["clean_name"])
        all_prompts.extend(prompts)

    # Write output files
    write_template_build_specs(df, specs)
    write_image_prompts_master(all_prompts)
    write_image_queue(all_prompts)

    print()
    print("=" * 60)
    print("COMPLETE")
    print(f"  Listings processed: {len(df)}")
    print(f"  Build specs generated: {len(specs)}")
    print(f"  Image prompts generated: {len(all_prompts)}")
    print(f"  Image queue items: {len(all_prompts)}")
    print()
    print("Next: python generate_images.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
