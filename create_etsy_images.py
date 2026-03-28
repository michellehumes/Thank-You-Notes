#!/usr/bin/env python3
"""
Create Etsy listing images for 40 Days of Lent Activity Bundle
Etsy specs: 2000x2000px (1:1 square), also 3000x2250 for wide shots
Format: PNG, under 1MB each
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(OUTPUT_DIR, "etsy_images")
os.makedirs(IMG_DIR, exist_ok=True)

# Colors
PURPLE_DARK = (88, 44, 131)
PURPLE_MED = (128, 90, 170)
PURPLE_LIGHT = (200, 180, 220)
PURPLE_VERY_LIGHT = (235, 225, 245)
GOLD = (196, 164, 80)
GOLD_LIGHT = (230, 210, 150)
CREAM = (252, 248, 240)
WHITE = (255, 255, 255)
BLACK = (40, 40, 40)
GRAY = (120, 120, 120)
SOFT_PINK = (240, 220, 235)

def get_font(size, bold=False):
    """Get a font - fallback to default if system fonts not available"""
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    bold_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]

    paths = bold_paths if bold else font_paths
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()

def draw_cross(draw, x, y, size, color=PURPLE_DARK, width=3):
    """Draw a simple cross"""
    arm_w = size * 0.3
    # Vertical
    draw.rectangle([x - arm_w/2, y - size/2, x + arm_w/2, y + size/2], outline=color, width=width)
    # Horizontal (higher)
    hy = y - size * 0.15
    draw.rectangle([x - size*0.4, hy - arm_w/2, x + size*0.4, hy + arm_w/2], outline=color, width=width)

def draw_filled_cross(draw, x, y, size, color=PURPLE_DARK):
    """Draw a filled cross"""
    arm_w = size * 0.3
    draw.rectangle([x - arm_w/2, y - size/2, x + arm_w/2, y + size/2], fill=color)
    hy = y - size * 0.15
    draw.rectangle([x - size*0.4, hy - arm_w/2, x + size*0.4, hy + arm_w/2], fill=color)

def draw_decorative_border(draw, w, h, color=PURPLE_MED, margin=40, width=3):
    """Draw decorative double border"""
    draw.rectangle([margin, margin, w-margin, h-margin], outline=color, width=width)
    inner = margin + 8
    draw.rectangle([inner, inner, w-inner, h-inner], outline=color, width=1)

def draw_stars(draw, x, y, size, color=GOLD):
    """Draw a small star/sparkle"""
    draw.line([(x, y-size), (x, y+size)], fill=color, width=2)
    draw.line([(x-size, y), (x+size, y)], fill=color, width=2)
    s = size * 0.7
    draw.line([(x-s, y-s), (x+s, y+s)], fill=color, width=1)
    draw.line([(x+s, y-s), (x-s, y+s)], fill=color, width=1)

def text_centered(draw, y, text, font, fill=BLACK, img_width=2000):
    """Draw centered text"""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (img_width - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)

def image_1_main_listing():
    """Main listing image - hero shot"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # Purple gradient header block
    for y in range(0, 700):
        ratio = y / 700
        r = int(PURPLE_DARK[0] * (1-ratio*0.3))
        g = int(PURPLE_DARK[1] * (1-ratio*0.3))
        b = int(PURPLE_DARK[2] * (1-ratio*0.3))
        draw.line([(0, y), (W, y)], fill=(max(0,r), max(0,g), max(0,b)))

    # Gold decorative line
    draw.rectangle([100, 690, W-100, 696], fill=GOLD)
    draw.rectangle([100, 702, W-100, 705], fill=GOLD_LIGHT)

    # Title text
    font_title = get_font(120, bold=True)
    font_subtitle = get_font(60)
    font_accent = get_font(45, bold=True)

    text_centered(draw, 120, "40 Days of Lent", font_title, fill=WHITE)
    text_centered(draw, 280, "Activity Bundle", font_subtitle, fill=WHITE)

    # Decorative crosses
    for cx in [300, 500, 700, 900, 1100, 1300, 1500, 1700]:
        draw.text((cx, 420), "+", font=get_font(50), fill=GOLD)

    text_centered(draw, 520, "For Kids & Families", font_accent, fill=GOLD_LIGHT)

    # Content preview boxes
    features = [
        "40-Day Countdown Calendar",
        "Daily Devotional Journal",
        "Coloring Pages",
        "Acts of Kindness Cards",
        "Scripture Memory Verses",
        "Holy Week Activities",
        "Lenten Promise Pages",
        "Easter Reflection"
    ]

    start_y = 780
    box_h = 110
    gap = 20
    cols = 2
    box_w = (W - 300) // cols

    font_feature = get_font(36, bold=True)

    for i, feature in enumerate(features):
        col = i % cols
        row = i // cols
        x = 120 + col * (box_w + gap)
        y = start_y + row * (box_h + gap)

        # Feature box
        draw.rounded_rectangle([x, y, x + box_w, y + box_h], radius=15,
                              fill=PURPLE_VERY_LIGHT, outline=PURPLE_MED, width=2)

        # Small cross icon
        draw_filled_cross(draw, x + 40, y + box_h//2, 30, PURPLE_MED)

        # Text
        bbox = draw.textbbox((0, 0), feature, font=font_feature)
        ty = y + (box_h - (bbox[3] - bbox[1])) // 2
        draw.text((x + 70, ty), feature, font=font_feature, fill=PURPLE_DARK)

    # Bottom banner
    draw.rectangle([0, H-180, W, H], fill=PURPLE_DARK)
    font_bottom = get_font(38)
    font_bottom_sm = get_font(28)
    text_centered(draw, H-155, "Printable PDF  |  Instant Download  |  20 Pages", font_bottom, fill=WHITE)
    text_centered(draw, H-100, "8.5\" x 11\" Letter Size  |  Print at Home", font_bottom_sm, fill=GOLD_LIGHT)

    # Sparkle decorations
    for sx, sy in [(150, 100), (1850, 150), (200, 600), (1800, 550)]:
        draw_stars(draw, sx, sy, 20, GOLD)

    img.save(os.path.join(IMG_DIR, "01_main_listing.png"), quality=95)
    print("Created: 01_main_listing.png")

def image_2_whats_inside():
    """What's inside overview"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    draw_decorative_border(draw, W, H, PURPLE_MED, 30, 4)

    # Header
    draw.rectangle([0, 0, W, 300], fill=PURPLE_DARK)
    font_title = get_font(90, bold=True)
    text_centered(draw, 60, "What's Inside", font_title, fill=WHITE)
    font_sub = get_font(45)
    text_centered(draw, 180, "20 Pages of Lenten Activities", font_sub, fill=GOLD_LIGHT)

    # Feature list with icons
    items = [
        ("1", "40-Day Countdown Calendar", "Track your Lenten journey day by day"),
        ("7", "Daily Devotional Pages", "Scripture, reflection & prayer for each day"),
        ("4", "Coloring Pages", "Cross, Dove, Candle & Praying Hands"),
        ("20", "Acts of Kindness Cards", "Cut-out cards with daily kindness challenges"),
        ("1", "Kindness Tracker", "Color hearts as you complete kind acts"),
        ("1", "Lenten Promises Page", "Write your fasting & prayer commitments"),
        ("6", "Scripture Memory Cards", "One verse for each week of Lent"),
        ("1", "Holy Week Journey", "Day-by-day guide through Holy Week"),
        ("1", "Easter Reflection", "Celebrate with a reflection & completion certificate"),
    ]

    y_start = 360
    row_h = 160
    font_num = get_font(48, bold=True)
    font_item = get_font(40, bold=True)
    font_desc = get_font(30)

    for i, (num, title, desc) in enumerate(items):
        y = y_start + i * row_h

        if i % 2 == 0:
            draw.rectangle([50, y, W-50, y + row_h - 10], fill=(248, 244, 252))

        # Number circle
        cx, cy = 140, y + row_h//2 - 5
        draw.ellipse([cx-40, cy-40, cx+40, cy+40], fill=PURPLE_MED)
        bbox = draw.textbbox((0, 0), num, font=font_num)
        nw = bbox[2] - bbox[0]
        draw.text((cx - nw//2, cy - 28), num, font=font_num, fill=WHITE)

        # Title & description
        draw.text((220, y + 25), title, font=font_item, fill=PURPLE_DARK)
        draw.text((220, y + 80), desc, font=font_desc, fill=GRAY)

    img.save(os.path.join(IMG_DIR, "02_whats_inside.png"), quality=95)
    print("Created: 02_whats_inside.png")

def image_3_countdown_preview():
    """Preview of the countdown calendar page"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, W, 250], fill=PURPLE_DARK)
    font_title = get_font(80, bold=True)
    text_centered(draw, 50, "40-Day Countdown", font_title, fill=WHITE)
    font_sub = get_font(50)
    text_centered(draw, 155, "Calendar & Tracker", font_sub, fill=GOLD_LIGHT)

    # Preview grid of days
    cols = 8
    rows = 5
    margin = 80
    gap = 10
    cell_w = (W - 2 * margin - (cols-1) * gap) // cols
    cell_h = (H - 500 - (rows-1) * gap) // rows
    start_y = 320

    day = 1
    for row in range(rows):
        for col in range(cols):
            if day > 40:
                break
            x = margin + col * (cell_w + gap)
            y = start_y + row * (cell_h + gap)

            # Cell
            fill = PURPLE_VERY_LIGHT if day <= 5 else WHITE
            draw.rounded_rectangle([x, y, x + cell_w, y + cell_h], radius=10,
                                  fill=fill, outline=PURPLE_MED, width=2)

            # Day number
            font_day = get_font(28, bold=True)
            draw.text((x + 10, y + 8), f"Day {day}", font=font_day, fill=PURPLE_DARK)

            # Cross outline
            draw_cross(draw, x + cell_w//2, y + cell_h//2 + 15, 50, PURPLE_LIGHT, 2)

            # Checkmark for first few (showing as "done")
            if day <= 3:
                font_check = get_font(40, bold=True)
                draw.text((x + cell_w - 40, y + cell_h - 45), "✓", font=font_check, fill=GOLD)

            day += 1

    # Bottom text
    font_bottom = get_font(35)
    text_centered(draw, H - 130, "Color in each cross as you complete each day!", font_bottom, fill=PURPLE_DARK)
    font_sm = get_font(28)
    text_centered(draw, H - 75, "Ash Wednesday through Easter Sunday", font_sm, fill=GRAY)

    img.save(os.path.join(IMG_DIR, "03_countdown_preview.png"), quality=95)
    print("Created: 03_countdown_preview.png")

def image_4_devotional_preview():
    """Preview of devotional journal pages"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), SOFT_PINK)
    draw = ImageDraw.Draw(img)

    # Header
    font_title = get_font(80, bold=True)
    font_sub = get_font(45)
    text_centered(draw, 50, "Daily Devotional", font_title, fill=PURPLE_DARK)
    text_centered(draw, 155, "Journal Pages", font_sub, fill=PURPLE_MED)

    # Show a "page" mockup
    page_x, page_y = 200, 260
    page_w, page_h = W - 400, H - 420
    # Shadow
    draw.rectangle([page_x + 15, page_y + 15, page_x + page_w + 15, page_y + page_h + 15],
                  fill=(180, 170, 190))
    # Page
    draw.rectangle([page_x, page_y, page_x + page_w, page_y + page_h], fill=WHITE)
    draw.rectangle([page_x, page_y, page_x + page_w, page_y + page_h], outline=PURPLE_LIGHT, width=2)

    # Page header
    draw.rectangle([page_x + 20, page_y + 20, page_x + page_w - 20, page_y + 120],
                  fill=PURPLE_DARK)
    font_page_title = get_font(48, bold=True)
    draw.text((page_x + 50, page_y + 35), "Day 1", font=font_page_title, fill=WHITE)
    font_page_sub = get_font(32)
    draw.text((page_x + 50, page_y + 85), "Returning to God", font=font_page_sub, fill=GOLD_LIGHT)

    # Scripture box
    draw.rounded_rectangle([page_x + 30, page_y + 140, page_x + page_w - 30, page_y + 310],
                          radius=10, fill=(248, 244, 252), outline=PURPLE_LIGHT, width=1)
    font_label = get_font(26, bold=True)
    font_verse = get_font(24)
    draw.text((page_x + 50, page_y + 155), "Today's Scripture:", font=font_label, fill=PURPLE_DARK)
    draw.text((page_x + 50, page_y + 195), '"Yet even now," declares the Lord,', font=font_verse, fill=PURPLE_MED)
    draw.text((page_x + 50, page_y + 230), '"return to me with all your heart."', font=font_verse, fill=PURPLE_MED)
    draw.text((page_x + 50, page_y + 265), '- Joel 2:12', font=font_verse, fill=GRAY)

    # Reflect section
    draw.text((page_x + 40, page_y + 340), "Reflect:", font=font_label, fill=PURPLE_DARK)
    font_q = get_font(22)
    draw.text((page_x + 50, page_y + 375), "What does it mean to return to God", font=font_q, fill=BLACK)
    draw.text((page_x + 50, page_y + 405), "with all your heart?", font=font_q, fill=BLACK)

    # Writing lines
    for i in range(6):
        ly = page_y + 460 + i * 55
        draw.line([(page_x + 40, ly), (page_x + page_w - 40, ly)], fill=PURPLE_LIGHT, width=1)

    # Prayer section
    draw.text((page_x + 40, page_y + page_h - 350), "My Prayer Today:", font=font_label, fill=PURPLE_DARK)
    for i in range(3):
        ly = page_y + page_h - 290 + i * 55
        draw.line([(page_x + 40, ly), (page_x + page_w - 40, ly)], fill=PURPLE_LIGHT, width=1)

    # Grateful section
    draw.line([(page_x + 40, page_y + page_h - 120), (page_x + page_w - 40, page_y + page_h - 120)],
             fill=GOLD, width=2)
    draw.text((page_x + 40, page_y + page_h - 105), "Today I'm Grateful For:", font=font_label, fill=GOLD)

    # Bottom badge
    draw.rounded_rectangle([600, H - 120, 1400, H - 30], radius=20, fill=PURPLE_DARK)
    font_badge = get_font(32, bold=True)
    text_centered(draw, H - 105, "7 Devotional Pages Included", font_badge, fill=WHITE)

    img.save(os.path.join(IMG_DIR, "04_devotional_preview.png"), quality=95)
    print("Created: 04_devotional_preview.png")

def image_5_coloring_kindness():
    """Preview of coloring pages and kindness cards"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    # Split into two sections
    # Top half - Coloring Pages
    draw.rectangle([0, 0, W, 1000], fill=CREAM)

    font_section = get_font(65, bold=True)
    text_centered(draw, 30, "Coloring Pages", font_section, fill=PURPLE_DARK)
    font_sub = get_font(35)
    text_centered(draw, 110, "4 Beautiful Designs to Color", font_sub, fill=PURPLE_MED)

    # Four coloring page previews
    preview_size = 380
    gap = 40
    start_x = (W - 4 * preview_size - 3 * gap) // 2
    py = 180

    symbols = ["Cross", "Dove", "Candle", "Prayer"]
    for i, sym in enumerate(symbols):
        x = start_x + i * (preview_size + gap)
        # Page shadow
        draw.rectangle([x+8, py+8, x+preview_size+8, py+preview_size+8], fill=(200, 195, 205))
        # Page
        draw.rectangle([x, py, x+preview_size, py+preview_size], fill=WHITE, outline=PURPLE_LIGHT, width=2)
        # Symbol placeholder
        cx = x + preview_size//2
        cy = py + preview_size//2
        if sym == "Cross":
            draw_cross(draw, cx, cy, 150, PURPLE_MED, 3)
        elif sym == "Dove":
            draw.ellipse([cx-60, cy-25, cx+60, cy+25], outline=PURPLE_MED, width=3)
            draw.line([(cx, cy-15), (cx+40, cy-60)], fill=PURPLE_MED, width=3)
        elif sym == "Candle":
            draw.rectangle([cx-20, cy-30, cx+20, cy+70], outline=PURPLE_MED, width=3)
            draw.ellipse([cx-12, cy-70, cx+12, cy-30], outline=PURPLE_MED, width=3)
        elif sym == "Prayer":
            draw.ellipse([cx-25, cy-40, cx-2, cy+40], outline=PURPLE_MED, width=3)
            draw.ellipse([cx+2, cy-40, cx+25, cy+40], outline=PURPLE_MED, width=3)

        # Label
        font_label = get_font(24)
        bbox = draw.textbbox((0, 0), sym, font=font_label)
        lw = bbox[2] - bbox[0]
        draw.text((cx - lw//2, py + preview_size + 10), sym, font=font_label, fill=PURPLE_DARK)

    # Divider
    draw.rectangle([80, 990, W-80, 996], fill=GOLD)

    # Bottom half - Kindness Cards
    draw.rectangle([0, 1000, W, H], fill=PURPLE_VERY_LIGHT)
    text_centered(draw, 1030, "Acts of Kindness Cards", font_section, fill=PURPLE_DARK)
    text_centered(draw, 1110, "20 Cut-Out Cards + Tracker", font_sub, fill=PURPLE_MED)

    # Show mini kindness cards
    card_w = 340
    card_h = 240
    cards_per_row = 5
    card_gap = 20
    cx_start = (W - cards_per_row * card_w - (cards_per_row-1) * card_gap) // 2
    cy_start = 1190

    sample_acts = [
        "Write a thank\nyou note", "Help with\nchores", "Pray for\nsomeone",
        "Share your\ntoys", "Say something\nkind",
        "Help make\ndinner", "Draw a picture\nfor someone", "Pick up\ntrash",
        "Give a hug", "Donate to\na food bank"
    ]

    for row in range(2):
        for col in range(5):
            idx = row * 5 + col
            if idx >= len(sample_acts):
                break
            x = cx_start + col * (card_w + card_gap)
            y = cy_start + row * (card_h + card_gap)

            draw.rounded_rectangle([x, y, x+card_w, y+card_h], radius=10,
                                  fill=WHITE, outline=PURPLE_MED, width=2)
            # Number
            font_num = get_font(20, bold=True)
            draw.text((x + 10, y + 8), f"#{idx+1}", font=font_num, fill=GOLD)

            # Cross
            draw_filled_cross(draw, x + card_w//2, y + 50, 20, PURPLE_LIGHT)

            # Text
            font_card = get_font(22)
            lines = sample_acts[idx].split('\n')
            for li, line in enumerate(lines):
                bbox = draw.textbbox((0, 0), line, font=font_card)
                lw = bbox[2] - bbox[0]
                draw.text((x + (card_w - lw)//2, y + 90 + li * 30), line, font=font_card, fill=BLACK)

            # Checkbox
            draw.rectangle([x + card_w//2 - 10, y + card_h - 35, x + card_w//2 + 10, y + card_h - 15],
                          outline=PURPLE_LIGHT, width=1)

    img.save(os.path.join(IMG_DIR, "05_coloring_kindness.png"), quality=95)
    print("Created: 05_coloring_kindness.png")

def image_6_features_benefits():
    """Features & benefits selling image"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    # Background gradient-like effect
    for y in range(H):
        ratio = y / H
        r = int(255 * (1 - ratio * 0.05))
        g = int(248 * (1 - ratio * 0.05))
        b = int(240 * (1 - ratio * 0.05))
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    draw_decorative_border(draw, W, H, PURPLE_MED, 40, 3)

    # Title
    font_title = get_font(80, bold=True)
    text_centered(draw, 80, "Why Families Love", font_title, fill=PURPLE_DARK)
    text_centered(draw, 180, "This Lent Bundle", font_title, fill=PURPLE_DARK)

    # Gold separator
    draw.rectangle([300, 290, W-300, 296], fill=GOLD)

    benefits = [
        ("Easy to Use", "Just print and go! No prep needed."),
        ("Faith-Based", "Scripture-centered activities for meaningful Lent."),
        ("All Ages", "Perfect for kids ages 4-12 and families together."),
        ("Reusable", "Print as many copies as you need each year."),
        ("20 Full Pages", "Packed with activities for all 40 days."),
        ("Instant Download", "Start using immediately after purchase!"),
    ]

    start_y = 350
    row_h = 230
    font_benefit = get_font(48, bold=True)
    font_desc = get_font(34)

    for i, (title, desc) in enumerate(benefits):
        y = start_y + i * row_h

        # Icon circle
        cx = 180
        cy = y + 55
        draw.ellipse([cx-50, cy-50, cx+50, cy+50], fill=PURPLE_MED, outline=PURPLE_DARK, width=2)
        draw_filled_cross(draw, cx, cy, 35, WHITE)

        # Benefit text
        draw.text((270, y + 15), title, font=font_benefit, fill=PURPLE_DARK)
        draw.text((270, y + 75), desc, font=font_desc, fill=GRAY)

        # Separator
        if i < len(benefits) - 1:
            draw.line([(270, y + row_h - 20), (W - 100, y + row_h - 20)], fill=PURPLE_LIGHT, width=1)

    # Bottom CTA
    draw.rounded_rectangle([400, H - 160, W - 400, H - 60], radius=25, fill=PURPLE_DARK)
    font_cta = get_font(42, bold=True)
    text_centered(draw, H - 145, "Add to Cart - Instant Download!", font_cta, fill=WHITE)

    img.save(os.path.join(IMG_DIR, "06_features_benefits.png"), quality=95)
    print("Created: 06_features_benefits.png")

def image_7_holy_week_preview():
    """Holy Week + Scripture cards preview"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), PURPLE_VERY_LIGHT)
    draw = ImageDraw.Draw(img)

    # Top section - Holy Week
    draw.rectangle([0, 0, W, 250], fill=PURPLE_DARK)
    font_title = get_font(80, bold=True)
    text_centered(draw, 50, "Holy Week Journey", font_title, fill=WHITE)
    font_sub = get_font(40)
    text_centered(draw, 155, "Follow Jesus Through the Most Important Week", font_sub, fill=GOLD_LIGHT)

    days = ["Palm Sunday", "Monday", "Tuesday", "Wednesday",
            "Holy Thursday", "Good Friday", "Holy Saturday", "Easter!"]

    cols = 4
    rows = 2
    card_w = 420
    card_h = 280
    gap = 30
    start_x = (W - cols * card_w - (cols-1) * gap) // 2
    start_y = 300

    font_day = get_font(32, bold=True)
    for i, day in enumerate(days):
        col = i % cols
        row = i // cols
        x = start_x + col * (card_w + gap)
        y = start_y + row * (card_h + gap)

        color = GOLD if day == "Easter!" else WHITE
        draw.rounded_rectangle([x, y, x+card_w, y+card_h], radius=15,
                              fill=color, outline=PURPLE_MED, width=2)

        # Day name
        bbox = draw.textbbox((0, 0), day, font=font_day)
        tw = bbox[2] - bbox[0]
        draw.text((x + (card_w-tw)//2, y + 20), day, font=font_day, fill=PURPLE_DARK)

        # Cross or symbol
        draw_cross(draw, x + card_w//2, y + card_h//2 + 20, 80, PURPLE_LIGHT, 2)

    # Bottom section - Scripture Cards
    draw.rectangle([80, 940, W-80, 946], fill=GOLD)

    text_centered(draw, 980, "Scripture Memory Verse Cards", font_title, fill=PURPLE_DARK)
    text_centered(draw, 1080, "6 Cards - One for Each Week of Lent", font_sub, fill=PURPLE_MED)

    # Scripture card previews
    verses = ["Joel 2:13", "Psalm 51:10", "Isaiah 58:6",
              "Matthew 6:6", "James 4:8", "Phil. 4:13"]

    card_w2 = 540
    card_h2 = 350
    gap2 = 30
    start_x2 = (W - 3 * card_w2 - 2 * gap2) // 2

    font_ref = get_font(36, bold=True)
    font_verse_small = get_font(24)

    for row in range(2):
        for col in range(3):
            idx = row * 3 + col
            x = start_x2 + col * (card_w2 + gap2)
            y = 1160 + row * (card_h2 + gap2)

            # Card with dashed border effect
            draw.rounded_rectangle([x, y, x+card_w2, y+card_h2], radius=12,
                                  fill=WHITE, outline=PURPLE_MED, width=2)
            draw.rounded_rectangle([x+8, y+8, x+card_w2-8, y+card_h2-8], radius=8,
                                  outline=PURPLE_LIGHT, width=1)

            # Cross at top
            draw_cross(draw, x + card_w2//2, y + 50, 40, PURPLE_MED, 2)

            # Reference
            bbox = draw.textbbox((0, 0), verses[idx], font=font_ref)
            tw = bbox[2] - bbox[0]
            draw.text((x + (card_w2-tw)//2, y + 100), verses[idx], font=font_ref, fill=GOLD)

            # Week label
            week_text = f"Week {idx + 1}"
            bbox2 = draw.textbbox((0, 0), week_text, font=font_verse_small)
            tw2 = bbox2[2] - bbox2[0]
            draw.text((x + (card_w2-tw2)//2, y + card_h2 - 45), week_text,
                     font=font_verse_small, fill=GRAY)

    img.save(os.path.join(IMG_DIR, "07_holy_week_scripture.png"), quality=95)
    print("Created: 07_holy_week_scripture.png")

def image_8_how_to_use():
    """How to use / instant download instructions"""
    W, H = 2000, 2000
    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    draw_decorative_border(draw, W, H, PURPLE_MED, 30, 3)

    # Header
    font_title = get_font(80, bold=True)
    text_centered(draw, 60, "How It Works", font_title, fill=PURPLE_DARK)

    draw.rectangle([400, 170, W-400, 176], fill=GOLD)

    font_sub = get_font(38)
    text_centered(draw, 200, "Easy as 1-2-3!", font_sub, fill=PURPLE_MED)

    steps = [
        ("1", "Purchase & Download", "Add to cart and download\ninstantly after checkout.\nNo shipping, no waiting!"),
        ("2", "Print at Home", "Print on 8.5\" x 11\" paper.\nUse cardstock for coloring\npages & activity cards."),
        ("3", "Enjoy Your Lent!", "Start on Ash Wednesday\nand follow along for\nall 40 days of Lent!")
    ]

    step_w = 500
    gap = 60
    start_x = (W - 3 * step_w - 2 * gap) // 2
    step_y = 350

    font_num = get_font(100, bold=True)
    font_step = get_font(42, bold=True)
    font_desc = get_font(30)

    for i, (num, title, desc) in enumerate(steps):
        x = start_x + i * (step_w + gap)
        cx = x + step_w // 2

        # Number circle
        draw.ellipse([cx-70, step_y, cx+70, step_y+140], fill=PURPLE_DARK)
        bbox = draw.textbbox((0, 0), num, font=font_num)
        nw = bbox[2] - bbox[0]
        draw.text((cx - nw//2, step_y + 10), num, font=font_num, fill=WHITE)

        # Arrow between steps
        if i < 2:
            ax = x + step_w + gap//2
            draw.polygon([(ax-15, step_y+70-10), (ax+15, step_y+70), (ax-15, step_y+70+10)],
                        fill=GOLD)

        # Title
        bbox = draw.textbbox((0, 0), title, font=font_step)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw//2, step_y + 170), title, font=font_step, fill=PURPLE_DARK)

        # Description
        for li, line in enumerate(desc.split('\n')):
            bbox = draw.textbbox((0, 0), line, font=font_desc)
            lw = bbox[2] - bbox[0]
            draw.text((cx - lw//2, step_y + 240 + li * 40), line, font=font_desc, fill=GRAY)

    # Additional info boxes
    info_y = 900
    boxes = [
        "Printable PDF Format",
        "8.5\" x 11\" Letter Size",
        "Works with A4 Paper",
        "Print Unlimited Copies"
    ]
    box_w = 400
    box_gap = 20
    box_start = (W - 4 * box_w - 3 * box_gap) // 2

    for i, text in enumerate(boxes):
        x = box_start + i * (box_w + box_gap)
        draw.rounded_rectangle([x, info_y, x+box_w, info_y+80], radius=15,
                              fill=PURPLE_DARK, outline=PURPLE_MED, width=0)
        font_box = get_font(26, bold=True)
        bbox = draw.textbbox((0, 0), text, font=font_box)
        tw = bbox[2] - bbox[0]
        draw.text((x + (box_w-tw)//2, info_y + 25), text, font=font_box, fill=WHITE)

    # Perfect for section
    perfect_y = 1080
    font_perfect_title = get_font(55, bold=True)
    text_centered(draw, perfect_y, "Perfect For:", font_perfect_title, fill=PURPLE_DARK)

    uses = [
        "Family Devotions", "Sunday School", "Homeschool",
        "Children's Ministry", "Catholic Education", "Christian Families",
        "Kids Ages 4-12", "Small Groups"
    ]

    cols = 4
    rows = 2
    tag_w = 380
    tag_h = 70
    tag_gap = 30
    tag_start_x = (W - cols * tag_w - (cols-1) * tag_gap) // 2
    tag_start_y = perfect_y + 80

    font_tag = get_font(28)
    for i, use in enumerate(uses):
        col = i % cols
        row = i // cols
        x = tag_start_x + col * (tag_w + tag_gap)
        y = tag_start_y + row * (tag_h + tag_gap)

        draw.rounded_rectangle([x, y, x+tag_w, y+tag_h], radius=12,
                              fill=PURPLE_VERY_LIGHT, outline=PURPLE_MED, width=2)
        bbox = draw.textbbox((0, 0), use, font=font_tag)
        tw = bbox[2] - bbox[0]
        draw.text((x + (tag_w-tw)//2, y + 18), use, font=font_tag, fill=PURPLE_DARK)

    # Bottom section - testimonial style
    draw.rectangle([0, H-350, W, H], fill=PURPLE_DARK)

    font_quote = get_font(40)
    text_centered(draw, H-310, '"Makes Lent so meaningful for our whole family!"', font_quote, fill=GOLD_LIGHT)

    font_final = get_font(55, bold=True)
    text_centered(draw, H-220, "Instant Download", font_final, fill=WHITE)
    text_centered(draw, H-150, "Start Your Lenten Journey Today", font_final, fill=WHITE)

    img.save(os.path.join(IMG_DIR, "08_how_to_use.png"), quality=95)
    print("Created: 08_how_to_use.png")


if __name__ == "__main__":
    image_1_main_listing()
    image_2_whats_inside()
    image_3_countdown_preview()
    image_4_devotional_preview()
    image_5_coloring_kindness()
    image_6_features_benefits()
    image_7_holy_week_preview()
    image_8_how_to_use()
    print(f"\nAll images saved to: {IMG_DIR}")
