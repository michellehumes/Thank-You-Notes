#!/usr/bin/env python3
"""
Generate Mother's Day Handprint Flower Bouquet:
- Print-ready PDFs (8x10, 8.5x11, A4)
- High-res PNGs (300 DPI)
- Etsy listing mockup images (2000x2000)
- Etsy listing video frames (for MP4 assembly)
"""

import os
import math
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "output")
PRINTABLES_DIR = os.path.join(OUT_DIR, "printable-files")
MOCKUPS_DIR = os.path.join(OUT_DIR, "etsy-listing-images")
VIDEO_DIR = os.path.join(OUT_DIR, "etsy-video-frames")

os.makedirs(PRINTABLES_DIR, exist_ok=True)
os.makedirs(MOCKUPS_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# ─── Color Palette ──────────────────────────────────────────
BG_CREAM = HexColor("#fdf8f4")
BG_CREAM_RGB = (253, 248, 244)
BROWN_DARK = HexColor("#8b6b5e")
BROWN_MED = HexColor("#b8977e")
BROWN_LIGHT = HexColor("#d4c4b0")
VASE_GOLD = HexColor("#d4b896")
VASE_DARK = HexColor("#b8956e")
STEM_GREEN = HexColor("#7a9e6b")
LEAF_GREEN = HexColor("#8ab478")
DASHED_TAN = HexColor("#c9a98c")
PINK_SOFT = HexColor("#e8b4c8")
BLUE_SOFT = HexColor("#c8dae8")
GREEN_SOFT = HexColor("#d4e8c8")

# PIL colors
PIL_BG = (253, 248, 244)
PIL_BROWN_DARK = (139, 107, 94)
PIL_BROWN_MED = (184, 151, 126)
PIL_BROWN_LIGHT = (212, 196, 176)
PIL_TAN = (201, 169, 140)
PIL_STEM = (122, 158, 107)
PIL_LEAF = (138, 180, 120)
PIL_VASE_GOLD = (212, 184, 150)
PIL_VASE_DARK = (184, 149, 110)
PIL_WHITE = (255, 255, 255)
PIL_BLACK = (0, 0, 0)


def get_system_font(style="serif", bold=False, italic=False):
    """Find a suitable system font."""
    candidates = {
        ("script", False, False): [
            "/System/Library/Fonts/Supplemental/Snell Roundhand.ttc",
            "/System/Library/Fonts/Supplemental/Zapfino.ttf",
            "/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf",
        ],
        ("serif", False, False): [
            "/System/Library/Fonts/Supplemental/Georgia.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
            "/System/Library/Fonts/NewYork.ttf",
        ],
        ("serif", False, True): [
            "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
        ],
        ("serif", True, False): [
            "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        ],
        ("sans", False, False): [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ],
        ("sans", True, False): [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ],
    }
    key = (style, bold, italic)
    for path in candidates.get(key, []):
        if os.path.exists(path):
            return path
    # Fallback
    for path in ["/System/Library/Fonts/Supplemental/Georgia.ttf",
                 "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
                 "/System/Library/Fonts/Helvetica.ttc"]:
        if os.path.exists(path):
            return path
    return None


def register_fonts():
    """Register fonts with reportlab."""
    script_font = get_system_font("script")
    serif_font = get_system_font("serif")
    serif_italic = get_system_font("serif", italic=True)
    serif_bold = get_system_font("serif", bold=True)

    fonts = {}
    if script_font:
        try:
            pdfmetrics.registerFont(TTFont("ScriptFont", script_font))
            fonts["script"] = "ScriptFont"
        except:
            fonts["script"] = "Helvetica"
    else:
        fonts["script"] = "Helvetica"

    if serif_font:
        try:
            pdfmetrics.registerFont(TTFont("SerifFont", serif_font))
            fonts["serif"] = "SerifFont"
        except:
            fonts["serif"] = "Times-Roman"
    else:
        fonts["serif"] = "Times-Roman"

    if serif_italic:
        try:
            pdfmetrics.registerFont(TTFont("SerifItalic", serif_italic))
            fonts["serif_italic"] = "SerifItalic"
        except:
            fonts["serif_italic"] = "Times-Italic"
    else:
        fonts["serif_italic"] = "Times-Italic"

    if serif_bold:
        try:
            pdfmetrics.registerFont(TTFont("SerifBold", serif_bold))
            fonts["serif_bold"] = "SerifBold"
        except:
            fonts["serif_bold"] = "Times-Bold"
    else:
        fonts["serif_bold"] = "Times-Bold"

    return fonts


def draw_printable(c, w, h, fonts):
    """Draw the handprint bouquet design on a reportlab canvas."""
    # Background
    c.setFillColor(BG_CREAM)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Subtle watercolor blobs
    for cx_pct, cy_pct, rx, ry, color, op in [
        (0.15, 0.8, 2.2*inch, 1.8*inch, PINK_SOFT, 0.08),
        (0.85, 0.85, 1.8*inch, 1.5*inch, BLUE_SOFT, 0.08),
        (0.5, 0.2, 1.5*inch, 2.2*inch, GREEN_SOFT, 0.06),
    ]:
        c.saveState()
        c.setFillColor(color, op)
        cx_abs = w * cx_pct
        cy_abs = h * cy_pct
        c.ellipse(cx_abs - rx, cy_abs - ry, cx_abs + rx, cy_abs + ry, fill=1, stroke=0)
        c.restoreState()

    # Border frame
    margin = 0.25 * inch
    c.setStrokeColor(HexColor("#c8af9b"))
    c.setStrokeAlpha(0.25)
    c.setLineWidth(0.5)
    c.roundRect(margin, margin, w - 2*margin, h - 2*margin, 3, fill=0, stroke=1)
    c.setStrokeAlpha(1.0)

    # ─── HEADING ─────────────────────────────────
    c.setFillColor(BROWN_DARK)
    c.setFont(fonts["script"], 38)
    c.drawCentredString(w/2, h - 0.75*inch, "Happy Mother's Day")

    c.setFillColor(BROWN_MED)
    c.setFont(fonts["serif"], 10)
    text_w = c.stringWidth("A  B O U Q U E T  M A D E  W I T H  L O V E", fonts["serif"], 10)
    c.drawCentredString(w/2, h - 1.0*inch, "A  B O U Q U E T  M A D E  W I T H  L O V E")

    # ─── STEMS ───────────────────────────────────
    vase_top_y = 2.15 * inch
    stem_positions = [
        (-1.5, 18), (-0.9, 10), (-0.35, 3), (0, 0),
        (0.35, -3), (0.9, -10), (1.5, -18)
    ]
    stem_heights = [2.6, 2.8, 2.9, 3.0, 2.9, 2.8, 2.6]

    for i, ((offset, angle), sh) in enumerate(zip(stem_positions, stem_heights)):
        c.saveState()
        sx = w/2 + offset * inch
        c.translate(sx, vase_top_y)
        c.rotate(angle)
        c.setStrokeColor(STEM_GREEN)
        c.setLineWidth(2.5)
        c.line(0, 0, 0, sh * inch)

        # Leaf
        if i != 3:
            leaf_y = sh * 0.4 * inch
            leaf_side = 1 if i < 3 else -1
            c.saveState()
            c.translate(0, leaf_y)
            c.setFillColor(LEAF_GREEN)
            c.setFillAlpha(0.6)
            lw, lh = 12, 22
            if leaf_side > 0:
                c.ellipse(2, -lh/2, 2+lw, lh/2, fill=1, stroke=0)
            else:
                c.ellipse(-2-lw, -lh/2, -2, lh/2, fill=1, stroke=0)
            c.restoreState()

        c.restoreState()

    # ─── HANDPRINT CIRCLES ───────────────────────
    circle_r = 0.72 * inch
    # Positions relative to center of page (x_offset_inches, y_from_page_bottom_inches)
    circle_positions = [
        (-1.8, 4.8), (-1.0, 5.8), (-0.1, 5.2), (-0.1, 6.2),
        (0.8, 5.8), (1.6, 4.8), (0.3, 4.2)
    ]

    for (ox, oy) in circle_positions:
        cx = w/2 + ox * inch
        cy = oy * inch
        c.saveState()
        # Dashed circle
        c.setStrokeColor(DASHED_TAN)
        c.setLineWidth(1.8)
        c.setDash(4, 4)
        # Fill with very light bg
        c.setFillColor(BG_CREAM)
        c.setFillAlpha(0.4)
        c.circle(cx, cy, circle_r, fill=1, stroke=1)
        c.restoreState()

        # Hand icon
        c.saveState()
        c.setFillColor(DASHED_TAN)
        c.setFillAlpha(0.4)
        c.setFont(fonts["serif"], 18)
        c.drawCentredString(cx, cy + 5, "\u270B")
        c.restoreState()

        # Label text
        c.saveState()
        c.setFillColor(DASHED_TAN)
        c.setFont(fonts["serif_italic"], 7.5)
        c.drawCentredString(cx, cy - 6, "place handprint")
        c.drawCentredString(cx, cy - 15, "here")
        c.restoreState()

    # ─── VASE ────────────────────────────────────
    vase_cx = w/2
    vase_bottom = 0.7 * inch
    vase_w = 2.0 * inch
    vase_h = 1.45 * inch

    # Vase body
    p = c.beginPath()
    rim_w = vase_w * 0.52
    rim_y = vase_bottom + vase_h
    base_w = vase_w * 0.38

    # Right side
    p.moveTo(vase_cx - rim_w/2, rim_y)
    p.lineTo(vase_cx - rim_w/2 - 0.05*inch, rim_y - 0.15*inch)
    p.curveTo(
        vase_cx - vase_w/2 - 0.1*inch, rim_y - vase_h*0.5,
        vase_cx - base_w/2 - 0.15*inch, vase_bottom + 0.3*inch,
        vase_cx - base_w/2, vase_bottom
    )
    # Bottom
    p.lineTo(vase_cx + base_w/2, vase_bottom)
    # Left side
    p.curveTo(
        vase_cx + base_w/2 + 0.15*inch, vase_bottom + 0.3*inch,
        vase_cx + vase_w/2 + 0.1*inch, rim_y - vase_h*0.5,
        vase_cx + rim_w/2 + 0.05*inch, rim_y - 0.15*inch
    )
    p.lineTo(vase_cx + rim_w/2, rim_y)
    p.close()

    c.setFillColor(VASE_GOLD)
    c.setStrokeColor(VASE_DARK)
    c.setLineWidth(0.5)
    c.drawPath(p, fill=1, stroke=1)

    # Vase rim
    c.setFillColor(HexColor("#c9a882"))
    c.setFillAlpha(0.6)
    c.roundRect(vase_cx - rim_w/2, rim_y - 2, rim_w, 4, 2, fill=1, stroke=0)
    c.setFillAlpha(1.0)

    # Vase highlight
    c.saveState()
    c.setFillColor(HexColor("#f0e6d6"))
    c.setFillAlpha(0.35)
    hl_x = vase_cx - 0.25*inch
    hl_w = 0.18*inch
    c.ellipse(hl_x, vase_bottom + 0.15*inch, hl_x + hl_w, rim_y - 0.2*inch, fill=1, stroke=0)
    c.restoreState()

    # ─── POEM ────────────────────────────────────
    poem_lines = [
        "This little bouquet was made with care,",
        "tiny hands that show how much we share.",
        "A gift of love that will never fade \u2014",
        "the sweetest flowers these hands have made.",
    ]

    c.setFillColor(BROWN_DARK)
    c.setFont(fonts["serif_italic"], 9.5)
    poem_y = 0.55 * inch
    line_h = 14
    start_y = poem_y + (len(poem_lines) - 1) * line_h / 2

    # Tiny decorative line above poem
    c.setStrokeColor(BROWN_LIGHT)
    c.setLineWidth(0.5)
    deco_w = 1.2 * inch
    deco_y = start_y + line_h + 6
    c.line(w/2 - deco_w/2, deco_y, w/2 + deco_w/2, deco_y)

    for i, line in enumerate(poem_lines):
        c.drawCentredString(w/2, start_y - i * line_h, line)

    # Signature line
    sig_y = start_y - len(poem_lines) * line_h - 8
    c.setFillColor(BROWN_MED)
    c.setFont(fonts["script"], 13)
    label_text = "With love from"
    label_w = c.stringWidth(label_text, fonts["script"], 13)
    total_w = label_w + 1.8*inch + 0.5*inch + 0.8*inch + 0.3*inch
    start_x = w/2 - total_w/2

    c.drawString(start_x, sig_y, label_text)
    # Name blank
    blank_x = start_x + label_w + 0.15*inch
    c.setStrokeColor(BROWN_LIGHT)
    c.setLineWidth(1)
    c.line(blank_x, sig_y - 2, blank_x + 1.6*inch, sig_y - 2)

    # Dot separator
    dot_x = blank_x + 1.6*inch + 0.15*inch
    c.setFillColor(BROWN_MED)
    c.setFont(fonts["serif"], 10)
    c.drawCentredString(dot_x, sig_y, "\u2022")

    # Age label
    age_x = dot_x + 0.15*inch
    c.setFont(fonts["script"], 13)
    c.drawString(age_x, sig_y, "Age")
    age_blank_x = age_x + c.stringWidth("Age", fonts["script"], 13) + 0.1*inch
    c.line(age_blank_x, sig_y - 2, age_blank_x + 0.7*inch, sig_y - 2)


def generate_printable_pdfs(fonts):
    """Generate print-ready PDFs in 3 sizes."""
    sizes = {
        "8x10": (8*inch, 10*inch),
        "8.5x11": (8.5*inch, 11*inch),
        "A4": A4,
    }
    for name, (w, h) in sizes.items():
        path = os.path.join(PRINTABLES_DIR, f"Mothers-Day-Handprint-Bouquet-{name}.pdf")
        c = canvas.Canvas(path, pagesize=(w, h))
        draw_printable(c, w, h, fonts)
        c.save()
        print(f"  Created: {path}")


def pdf_to_png(pdf_path, png_path, dpi=300):
    """Convert first page of PDF to PNG using sips/preview on macOS."""
    # Use reportlab to render to a temp image via macOS tools
    # Actually, let's render directly with PIL for the PNG versions
    pass


def generate_png_printables():
    """Generate high-res PNG versions using PIL (300 DPI)."""
    sizes = {
        "8x10": (8, 10),
        "8.5x11": (8.5, 11),
        "A4": (8.27, 11.69),
    }
    for name, (w_in, h_in) in sizes.items():
        dpi = 300
        w_px = int(w_in * dpi)
        h_px = int(h_in * dpi)
        img = render_design_pil(w_px, h_px, dpi)
        path = os.path.join(PRINTABLES_DIR, f"Mothers-Day-Handprint-Bouquet-{name}.png")
        img.save(path, "PNG", dpi=(dpi, dpi))
        print(f"  Created: {path}")


def render_design_pil(w, h, dpi=300):
    """Render the full design using PIL for pixel-perfect PNG output."""
    img = Image.new("RGB", (w, h), PIL_BG)
    draw = ImageDraw.Draw(img)
    scale = dpi / 72  # scale factor from points to pixels

    # Load fonts
    script_path = get_system_font("script")
    serif_path = get_system_font("serif")
    serif_italic_path = get_system_font("serif", italic=True)
    serif_bold_path = get_system_font("serif", bold=True)

    def load_font(path, size_pt):
        px_size = int(size_pt * scale)
        if path and os.path.exists(path):
            try:
                return ImageFont.truetype(path, px_size)
            except:
                pass
        return ImageFont.load_default()

    font_script_lg = load_font(script_path, 38)
    font_serif_sm = load_font(serif_path, 10)
    font_serif_italic = load_font(serif_italic_path, 9.5)
    font_serif_italic_sm = load_font(serif_italic_path, 7.5)
    font_script_md = load_font(script_path, 13)

    def inch_to_px(inches):
        return int(inches * dpi)

    # Watercolor blobs
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for cx_pct, cy_pct, rx_in, ry_in, color, alpha in [
        (0.15, 0.2, 2.2, 1.8, (232, 180, 200), 20),
        (0.85, 0.15, 1.8, 1.5, (200, 218, 232), 20),
        (0.5, 0.8, 1.5, 2.2, (212, 232, 200), 15),
    ]:
        cx = int(w * cx_pct)
        cy = int(h * cy_pct)
        rx = inch_to_px(rx_in)
        ry = inch_to_px(ry_in)
        overlay_draw.ellipse(
            [cx - rx, cy - ry, cx + rx, cy + ry],
            fill=(*color, alpha)
        )
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Border frame
    margin = inch_to_px(0.25)
    draw.rounded_rectangle(
        [margin, margin, w - margin, h - margin],
        radius=int(3 * scale),
        outline=(*PIL_BROWN_LIGHT, 64),
        width=max(1, int(0.5 * scale))
    )

    # ─── HEADING ──────────────────────
    title = "Happy Mother's Day"
    bbox = draw.textbbox((0, 0), title, font=font_script_lg)
    tw = bbox[2] - bbox[0]
    title_x = (w - tw) // 2
    title_y = inch_to_px(0.55)
    draw.text((title_x, title_y), title, fill=PIL_BROWN_DARK, font=font_script_lg)

    subtitle = "A  B O U Q U E T  M A D E  W I T H  L O V E"
    bbox = draw.textbbox((0, 0), subtitle, font=font_serif_sm)
    sw = bbox[2] - bbox[0]
    draw.text(((w - sw) // 2, inch_to_px(0.95)), subtitle, fill=PIL_BROWN_MED, font=font_serif_sm)

    # ─── STEMS ────────────────────────
    vase_top_y = h - inch_to_px(2.15)
    stem_data = [
        (-1.5, -18, 2.6), (-0.9, -10, 2.8), (-0.35, -3, 2.9), (0, 0, 3.0),
        (0.35, 3, 2.9), (0.9, 10, 2.8), (1.5, 18, 2.6)
    ]
    stem_width = max(2, int(2.5 * scale))
    for ox, angle, sh in stem_data:
        sx = w // 2 + inch_to_px(ox)
        sy = vase_top_y
        rad = math.radians(angle)
        ex = sx + int(inch_to_px(sh) * math.sin(rad))
        ey = sy - int(inch_to_px(sh) * math.cos(rad))
        draw.line([(sx, sy), (ex, ey)], fill=PIL_STEM, width=stem_width)

        # Leaf
        if angle != 0:
            leaf_pct = 0.4
            lx = int(sx + (ex - sx) * leaf_pct)
            ly = int(sy + (ey - sy) * leaf_pct)
            lr = inch_to_px(0.12)
            leaf_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            leaf_draw = ImageDraw.Draw(leaf_overlay)
            leaf_draw.ellipse(
                [lx - lr//2, ly - lr, lx + lr//2 + inch_to_px(0.08), ly + lr],
                fill=(*PIL_LEAF, 150)
            )
            img = Image.alpha_composite(img.convert("RGBA"), leaf_overlay).convert("RGB")
            draw = ImageDraw.Draw(img)

    # ─── HANDPRINT CIRCLES ────────────
    circle_r = inch_to_px(0.72)
    # y positions from top of image
    circles = [
        (-1.8, 5.2), (-1.0, 4.2), (-0.1, 4.8), (-0.1, 3.8),
        (0.8, 4.2), (1.6, 5.2), (0.3, 5.8)
    ]
    dash_len = int(4 * scale)
    for ox, oy in circles:
        cx = w // 2 + inch_to_px(ox)
        cy = inch_to_px(oy)

        # Draw dashed circle
        num_dashes = 40
        for d in range(num_dashes):
            if d % 2 == 0:
                a1 = 2 * math.pi * d / num_dashes
                a2 = 2 * math.pi * (d + 0.8) / num_dashes
                draw.arc(
                    [cx - circle_r, cy - circle_r, cx + circle_r, cy + circle_r],
                    start=math.degrees(a1), end=math.degrees(a2),
                    fill=PIL_TAN, width=max(1, int(1.8 * scale))
                )

        # Light fill
        fill_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        fill_draw = ImageDraw.Draw(fill_overlay)
        fill_draw.ellipse(
            [cx - circle_r + 2, cy - circle_r + 2, cx + circle_r - 2, cy + circle_r - 2],
            fill=(253, 248, 244, 100)
        )
        img = Image.alpha_composite(img.convert("RGBA"), fill_overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

        # Hand emoji placeholder
        hand_font = load_font(serif_path, 16)
        hand_text = "\u270b"
        try:
            bbox = draw.textbbox((0, 0), hand_text, font=hand_font)
            hw = bbox[2] - bbox[0]
            draw.text((cx - hw//2, cy - inch_to_px(0.15)), hand_text, fill=(*PIL_TAN, 100), font=hand_font)
        except:
            pass

        # Label
        label1 = "place handprint"
        label2 = "here"
        bbox1 = draw.textbbox((0, 0), label1, font=font_serif_italic_sm)
        bbox2 = draw.textbbox((0, 0), label2, font=font_serif_italic_sm)
        draw.text((cx - (bbox1[2]-bbox1[0])//2, cy + inch_to_px(0.05)), label1, fill=PIL_TAN, font=font_serif_italic_sm)
        draw.text((cx - (bbox2[2]-bbox2[0])//2, cy + inch_to_px(0.05) + int(10*scale)), label2, fill=PIL_TAN, font=font_serif_italic_sm)

    # ─── VASE ─────────────────────────
    vase_cx = w // 2
    vase_bottom = h - inch_to_px(0.7)
    vase_top = h - inch_to_px(2.15)
    rim_half_w = inch_to_px(0.52)
    base_half_w = inch_to_px(0.38)

    # Simple vase shape with polygon
    vase_points = []
    # Left rim
    vase_points.append((vase_cx - rim_half_w, vase_top))
    # Left side curve (approximate with points)
    steps = 20
    for i in range(steps + 1):
        t = i / steps
        # Bezier-like curve from rim to base
        x_top = vase_cx - rim_half_w - inch_to_px(0.05)
        x_mid = vase_cx - inch_to_px(0.55)
        x_bot = vase_cx - base_half_w
        y_top = vase_top + inch_to_px(0.1)
        y_bot = vase_bottom

        x = x_top * (1-t)**2 + x_mid * 2*t*(1-t) + x_bot * t**2
        y = y_top * (1-t) + y_bot * t
        vase_points.append((int(x), int(y)))

    # Right side curve
    for i in range(steps, -1, -1):
        t = i / steps
        x_top = vase_cx + rim_half_w + inch_to_px(0.05)
        x_mid = vase_cx + inch_to_px(0.55)
        x_bot = vase_cx + base_half_w
        y_top = vase_top + inch_to_px(0.1)
        y_bot = vase_bottom

        x = x_top * (1-t)**2 + x_mid * 2*t*(1-t) + x_bot * t**2
        y = y_top * (1-t) + y_bot * t
        vase_points.append((int(x), int(y)))

    vase_points.append((vase_cx + rim_half_w, vase_top))

    draw.polygon(vase_points, fill=PIL_VASE_GOLD, outline=PIL_VASE_DARK)

    # Vase rim
    rim_h = int(4 * scale)
    draw.rounded_rectangle(
        [vase_cx - rim_half_w, vase_top - rim_h//2, vase_cx + rim_half_w, vase_top + rim_h//2],
        radius=int(2*scale), fill=(201, 168, 130, 180)
    )

    # Vase highlight
    hl_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hl_draw = ImageDraw.Draw(hl_overlay)
    hl_x = vase_cx - inch_to_px(0.2)
    hl_w = inch_to_px(0.15)
    hl_draw.ellipse(
        [hl_x, vase_top + inch_to_px(0.15), hl_x + hl_w, vase_bottom - inch_to_px(0.1)],
        fill=(240, 230, 214, 90)
    )
    img = Image.alpha_composite(img.convert("RGBA"), hl_overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # ─── POEM ─────────────────────────
    poem_lines = [
        "This little bouquet was made with care,",
        "tiny hands that show how much we share.",
        "A gift of love that will never fade \u2014",
        "the sweetest flowers these hands have made.",
    ]
    line_h = int(14 * scale)
    poem_start_y = h - inch_to_px(0.75)

    # Decorative line above poem
    deco_w = inch_to_px(1.2)
    deco_y = poem_start_y - int(8 * scale)
    draw.line(
        [(w//2 - deco_w//2, deco_y), (w//2 + deco_w//2, deco_y)],
        fill=PIL_BROWN_LIGHT, width=max(1, int(0.5*scale))
    )

    for i, line in enumerate(poem_lines):
        bbox = draw.textbbox((0, 0), line, font=font_serif_italic)
        lw = bbox[2] - bbox[0]
        draw.text(
            ((w - lw) // 2, poem_start_y + i * line_h),
            line, fill=PIL_BROWN_DARK, font=font_serif_italic
        )

    # Signature line
    sig_y = poem_start_y + len(poem_lines) * line_h + int(10 * scale)
    sig_text = "With love from"
    bbox = draw.textbbox((0, 0), sig_text, font=font_script_md)
    sig_tw = bbox[2] - bbox[0]
    blank_w = inch_to_px(1.6)
    age_text = "Age"
    age_bbox = draw.textbbox((0, 0), age_text, font=font_script_md)
    age_tw = age_bbox[2] - age_bbox[0]
    age_blank_w = inch_to_px(0.7)
    gap = inch_to_px(0.15)
    dot_gap = inch_to_px(0.12)

    total_sig_w = sig_tw + gap + blank_w + dot_gap*2 + age_tw + gap + age_blank_w
    sx = (w - total_sig_w) // 2

    draw.text((sx, sig_y), sig_text, fill=PIL_BROWN_MED, font=font_script_md)
    blank_x = sx + sig_tw + gap
    line_y = sig_y + int(15 * scale)
    draw.line([(blank_x, line_y), (blank_x + blank_w, line_y)], fill=PIL_BROWN_LIGHT, width=max(1, int(scale)))

    # Dot
    dot_font = load_font(serif_path, 10)
    dot_x = blank_x + blank_w + dot_gap
    draw.text((dot_x, sig_y), "\u2022", fill=PIL_BROWN_MED, font=dot_font)

    # Age
    age_x = dot_x + dot_gap + inch_to_px(0.08)
    draw.text((age_x, sig_y), age_text, fill=PIL_BROWN_MED, font=font_script_md)
    age_blank_x = age_x + age_tw + gap
    draw.line([(age_blank_x, line_y), (age_blank_x + age_blank_w, line_y)], fill=PIL_BROWN_LIGHT, width=max(1, int(scale)))

    return img


def generate_etsy_mockup_images():
    """Generate 10 Etsy listing images at 2000x2000px."""
    print("\n  Generating Etsy listing mockup images...")

    # We need the base design first
    design_8x10 = render_design_pil(2400, 3000, 300)

    # ─── IMAGE 1: Hero/Main Image ─────────────────
    # Clean product shot with shadow on neutral background
    img1 = Image.new("RGB", (2000, 2000), (245, 240, 235))
    draw1 = ImageDraw.Draw(img1)

    # Paper shadow
    shadow = Image.new("RGBA", (2000, 2000), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([310, 210, 1510, 1710], radius=8, fill=(0, 0, 0, 40))
    shadow = shadow.filter(ImageFilter.GaussianBlur(15))
    img1 = Image.alpha_composite(img1.convert("RGBA"), shadow).convert("RGB")
    draw1 = ImageDraw.Draw(img1)

    # White paper background
    draw1.rounded_rectangle([300, 200, 1500, 1700], radius=4, fill=PIL_WHITE)

    # Paste design
    design_thumb = design_8x10.resize((1160, 1450), Image.LANCZOS)
    img1.paste(design_thumb, (320, 220))

    # "DIGITAL DOWNLOAD" badge
    badge_font = ImageFont.load_default()
    try:
        sans_path = get_system_font("sans", bold=True)
        if sans_path:
            badge_font = ImageFont.truetype(sans_path, 28)
    except:
        pass

    # Badge
    draw1.rounded_rectangle([700, 1750, 1300, 1810], radius=20, fill=(139, 107, 94))
    badge_text = "DIGITAL DOWNLOAD"
    bb = draw1.textbbox((0, 0), badge_text, font=badge_font)
    bw = bb[2] - bb[0]
    draw1.text(((2000 - bw) // 2, 1758), badge_text, fill=PIL_WHITE, font=badge_font)

    # Top corner ribbon
    draw1.polygon([(0, 0), (350, 0), (0, 350)], fill=(139, 107, 94))
    try:
        ribbon_font = ImageFont.truetype(get_system_font("sans", bold=True), 22)
    except:
        ribbon_font = badge_font

    img1_path = os.path.join(MOCKUPS_DIR, "01-hero-main-image.jpg")
    img1.save(img1_path, "JPEG", quality=95, dpi=(300, 300))
    print(f"  Created: {img1_path}")

    # ─── IMAGE 2: What You Get / Files Included ───
    img2 = Image.new("RGB", (2000, 2000), PIL_BG)
    draw2 = ImageDraw.Draw(img2)

    try:
        title_font = ImageFont.truetype(get_system_font("serif", bold=True), 52)
        body_font = ImageFont.truetype(get_system_font("serif"), 36)
        check_font = ImageFont.truetype(get_system_font("sans", bold=True), 38)
    except:
        title_font = body_font = check_font = ImageFont.load_default()

    draw2.text((100, 80), "What You Get", fill=PIL_BROWN_DARK, font=title_font)
    draw2.line([(100, 150), (800, 150)], fill=PIL_BROWN_LIGHT, width=3)

    items = [
        "8x10 inch PDF (print ready)",
        "8.5x11 inch PDF (US Letter)",
        "A4 PDF (international)",
        "8x10 inch PNG (300 DPI)",
        "8.5x11 inch PNG (300 DPI)",
        "A4 PNG (300 DPI)",
        "Printable instructions",
    ]

    y = 200
    for item in items:
        draw2.text((100, y), "\u2713", fill=(122, 158, 107), font=check_font)
        draw2.text((160, y + 2), item, fill=PIL_BROWN_DARK, font=body_font)
        y += 70

    # Small preview on right side
    small_preview = design_8x10.resize((600, 750), Image.LANCZOS)
    img2.paste(small_preview, (1300, 600))

    # Shadow behind preview
    draw2.rounded_rectangle([1290, 590, 1910, 1360], radius=4, outline=PIL_BROWN_LIGHT, width=2)

    draw2.text((100, 800), "Instant Download!", fill=(122, 158, 107), font=title_font)
    draw2.text((100, 870), "Print at home or at any print shop", fill=PIL_BROWN_MED, font=body_font)

    img2.save(os.path.join(MOCKUPS_DIR, "02-what-you-get.jpg"), "JPEG", quality=95)
    print(f"  Created: 02-what-you-get.jpg")

    # ─── IMAGE 3: How It Works ────────────────────
    img3 = Image.new("RGB", (2000, 2000), PIL_BG)
    draw3 = ImageDraw.Draw(img3)

    draw3.text((100, 80), "How It Works", fill=PIL_BROWN_DARK, font=title_font)
    draw3.line([(100, 150), (750, 150)], fill=PIL_BROWN_LIGHT, width=3)

    steps = [
        ("1", "Purchase & Download", "Instant access after purchase"),
        ("2", "Print at Home", "Use any home printer or print shop"),
        ("3", "Add Handprints", "Dip tiny hands in paint & press!"),
        ("4", "Gift to Mom", "A keepsake she'll treasure forever"),
    ]

    try:
        num_font = ImageFont.truetype(get_system_font("script"), 72)
        step_title_font = ImageFont.truetype(get_system_font("serif", bold=True), 40)
        step_desc_font = ImageFont.truetype(get_system_font("serif", italic=True), 32)
    except:
        num_font = step_title_font = step_desc_font = ImageFont.load_default()

    y = 250
    for num, title, desc in steps:
        # Circle with number
        draw3.ellipse([100, y, 200, y+100], fill=PIL_BROWN_DARK)
        bb = draw3.textbbox((0, 0), num, font=num_font)
        nw = bb[2] - bb[0]
        nh = bb[3] - bb[1]
        draw3.text((150 - nw//2, y + 50 - nh//2 - 10), num, fill=PIL_WHITE, font=num_font)

        draw3.text((260, y + 10), title, fill=PIL_BROWN_DARK, font=step_title_font)
        draw3.text((260, y + 60), desc, fill=PIL_BROWN_MED, font=step_desc_font)
        y += 180

    img3.save(os.path.join(MOCKUPS_DIR, "03-how-it-works.jpg"), "JPEG", quality=95)
    print(f"  Created: 03-how-it-works.jpg")

    # ─── IMAGE 4: Close-up of handprint area ──────
    img4 = Image.new("RGB", (2000, 2000), PIL_BG)
    # Crop and enlarge the handprint area
    crop = design_8x10.crop((200, 800, 2200, 2200))
    crop_resized = crop.resize((2000, 2000), Image.LANCZOS)
    img4.paste(crop_resized, (0, 0))

    draw4 = ImageDraw.Draw(img4)
    # Add instruction overlay
    draw4.rounded_rectangle([50, 1700, 1950, 1950], radius=20, fill=(139, 107, 94, 220))
    try:
        overlay_font = ImageFont.truetype(get_system_font("sans", bold=True), 36)
    except:
        overlay_font = ImageFont.load_default()
    text4 = "Use washable paint for tiny handprints!"
    bb4 = draw4.textbbox((0, 0), text4, font=overlay_font)
    tw4 = bb4[2] - bb4[0]
    draw4.text(((2000 - tw4) // 2, 1800), text4, fill=PIL_WHITE, font=overlay_font)

    img4.save(os.path.join(MOCKUPS_DIR, "04-handprint-closeup.jpg"), "JPEG", quality=95)
    print(f"  Created: 04-handprint-closeup.jpg")

    # ─── IMAGE 5: Size comparison / all 3 sizes ──
    img5 = Image.new("RGB", (2000, 2000), (245, 240, 235))
    draw5 = ImageDraw.Draw(img5)

    draw5.text((100, 80), "3 Sizes Included", fill=PIL_BROWN_DARK, font=title_font)

    # Three slightly offset papers
    sizes_info = [
        ("8x10", 450, 562, 200, 350),
        ("8.5x11", 478, 618, 650, 300),
        ("A4", 465, 657, 1100, 250),
    ]
    for label, pw, ph, px, py in sizes_info:
        # Shadow
        draw5.rounded_rectangle([px+5, py+5, px+pw+5, py+ph+5], radius=3, fill=(200, 190, 180))
        # Paper
        draw5.rounded_rectangle([px, py, px+pw, py+ph], radius=3, fill=PIL_WHITE, outline=PIL_BROWN_LIGHT, width=1)
        # Tiny design
        tiny = design_8x10.resize((pw-20, ph-20), Image.LANCZOS)
        img5.paste(tiny, (px+10, py+10))
        # Label below
        try:
            label_font = ImageFont.truetype(get_system_font("sans", bold=True), 32)
        except:
            label_font = ImageFont.load_default()
        bb = draw5.textbbox((0, 0), label, font=label_font)
        lw = bb[2] - bb[0]
        draw5.text((px + pw//2 - lw//2, py + ph + 20), label, fill=PIL_BROWN_DARK, font=label_font)

    # "PDF + PNG" text
    draw5.text((100, 1100), "Each size in PDF + PNG format", fill=PIL_BROWN_MED, font=body_font)

    img5.save(os.path.join(MOCKUPS_DIR, "05-three-sizes.jpg"), "JPEG", quality=95)
    print(f"  Created: 05-three-sizes.jpg")

    # ─── IMAGE 6: Poem close-up ──────────────────
    img6 = Image.new("RGB", (2000, 2000), PIL_BG)
    poem_crop = design_8x10.crop((100, 2400, 2300, 3000))
    poem_resized = poem_crop.resize((2000, 1100), Image.LANCZOS)
    img6.paste(poem_resized, (0, 500))

    draw6 = ImageDraw.Draw(img6)
    draw6.text((100, 100), "Heartfelt Poem", fill=PIL_BROWN_DARK, font=title_font)
    draw6.text((100, 170), "Included on every print", fill=PIL_BROWN_MED, font=body_font)

    # Decorative hearts
    try:
        heart_font = ImageFont.truetype(get_system_font("serif"), 60)
    except:
        heart_font = ImageFont.load_default()
    draw6.text((1700, 100), "\u2665", fill=(232, 180, 200), font=heart_font)
    draw6.text((1780, 180), "\u2665", fill=(232, 180, 200, 128), font=heart_font)

    img6.save(os.path.join(MOCKUPS_DIR, "06-poem-closeup.jpg"), "JPEG", quality=95)
    print(f"  Created: 06-poem-closeup.jpg")

    # ─── IMAGE 7: Perfect For section ─────────────
    img7 = Image.new("RGB", (2000, 2000), PIL_BG)
    draw7 = ImageDraw.Draw(img7)

    draw7.text((100, 80), "Perfect For", fill=PIL_BROWN_DARK, font=title_font)
    draw7.line([(100, 150), (600, 150)], fill=PIL_BROWN_LIGHT, width=3)

    perfect_items = [
        "\u2665  Mother's Day gift from kids",
        "\u2665  Grandma's birthday keepsake",
        "\u2665  Daycare & preschool craft",
        "\u2665  Baby's first Mother's Day",
        "\u2665  Sunday school activity",
        "\u2665  Classroom art project",
        "\u2665  Nanny or babysitter gift",
    ]

    y = 220
    for item in perfect_items:
        draw7.text((120, y), item, fill=PIL_BROWN_DARK, font=body_font)
        y += 75

    # Small design preview
    small = design_8x10.resize((500, 625), Image.LANCZOS)
    img7.paste(small, (1350, 800))

    img7.save(os.path.join(MOCKUPS_DIR, "07-perfect-for.jpg"), "JPEG", quality=95)
    print(f"  Created: 07-perfect-for.jpg")

    # ─── IMAGE 8: Printing tips ──────────────────
    img8 = Image.new("RGB", (2000, 2000), PIL_BG)
    draw8 = ImageDraw.Draw(img8)

    draw8.text((100, 80), "Printing Tips", fill=PIL_BROWN_DARK, font=title_font)
    draw8.line([(100, 150), (700, 150)], fill=PIL_BROWN_LIGHT, width=3)

    tips = [
        "\u2713  Use cardstock for best results",
        "\u2713  Print at 100% / Actual Size",
        "\u2713  Use washable paint for handprints",
        "\u2713  Let paint dry completely",
        "\u2713  Frame for a beautiful gift!",
        "",
        "Works with any home printer",
        "or local print shop (Staples,",
        "FedEx, Walgreens, etc.)",
    ]

    y = 220
    for tip in tips:
        if tip == "":
            y += 30
            continue
        color = PIL_BROWN_DARK if tip.startswith("\u2713") else PIL_BROWN_MED
        draw8.text((120, y), tip, fill=color, font=body_font)
        y += 65

    img8.save(os.path.join(MOCKUPS_DIR, "08-printing-tips.jpg"), "JPEG", quality=95)
    print(f"  Created: 08-printing-tips.jpg")

    # ─── IMAGE 9: Reviews / Social Proof style ────
    img9 = Image.new("RGB", (2000, 2000), PIL_BG)
    draw9 = ImageDraw.Draw(img9)

    draw9.text((100, 80), "Customers Love It!", fill=PIL_BROWN_DARK, font=title_font)

    # Stars
    try:
        star_font = ImageFont.truetype(get_system_font("serif"), 50)
    except:
        star_font = ImageFont.load_default()
    draw9.text((100, 160), "\u2605 \u2605 \u2605 \u2605 \u2605", fill=(218, 165, 32), font=star_font)

    quotes = [
        '"My daughter loved making this\nfor her grandma!"',
        '"So easy to print and the poem\nmade me cry happy tears"',
        '"Perfect last-minute gift.\nDownloaded and printed in\n5 minutes!"',
    ]

    y = 350
    try:
        quote_font = ImageFont.truetype(get_system_font("serif", italic=True), 34)
    except:
        quote_font = ImageFont.load_default()

    for quote in quotes:
        # Quote box
        draw9.rounded_rectangle([80, y-10, 1920, y+160], radius=15, fill=PIL_WHITE, outline=PIL_BROWN_LIGHT, width=1)
        draw9.text((120, y + 10), quote, fill=PIL_BROWN_DARK, font=quote_font)
        draw9.text((120, y + 120), "\u2605\u2605\u2605\u2605\u2605", fill=(218, 165, 32), font=body_font)
        y += 220

    draw9.text((100, 1100), "Join thousands of happy moms!", fill=PIL_BROWN_MED, font=body_font)

    img9.save(os.path.join(MOCKUPS_DIR, "09-social-proof.jpg"), "JPEG", quality=95)
    print(f"  Created: 09-social-proof.jpg")

    # ─── IMAGE 10: Urgency / CTA ─────────────────
    img10 = Image.new("RGB", (2000, 2000), PIL_BROWN_DARK)
    draw10 = ImageDraw.Draw(img10)

    try:
        big_script = ImageFont.truetype(get_system_font("script"), 72)
        cta_font = ImageFont.truetype(get_system_font("sans", bold=True), 44)
        cta_sub = ImageFont.truetype(get_system_font("serif", italic=True), 36)
    except:
        big_script = cta_font = cta_sub = ImageFont.load_default()

    # Center design preview
    preview = design_8x10.resize((800, 1000), Image.LANCZOS)
    img10.paste(preview, (600, 100))

    # Overlay text
    draw10.text((200, 1200), "Make Mom's Day", fill=PIL_WHITE, font=big_script)
    draw10.text((350, 1310), "Extra Special", fill=(232, 180, 200), font=big_script)

    draw10.rounded_rectangle([500, 1500, 1500, 1600], radius=30, fill=PIL_WHITE)
    cta = "INSTANT DOWNLOAD"
    bb = draw10.textbbox((0, 0), cta, font=cta_font)
    cw = bb[2] - bb[0]
    draw10.text(((2000 - cw)//2, 1520), cta, fill=PIL_BROWN_DARK, font=cta_font)

    draw10.text((450, 1650), "Print at home in minutes!", fill=(232, 180, 200), font=cta_sub)
    draw10.text((550, 1750), "No shipping, no waiting", fill=PIL_BROWN_LIGHT, font=cta_sub)

    img10.save(os.path.join(MOCKUPS_DIR, "10-cta-urgency.jpg"), "JPEG", quality=95)
    print(f"  Created: 10-cta-urgency.jpg")


def generate_video_frames():
    """Generate frames for a 10-second Etsy listing video."""
    print("\n  Generating video frames...")
    design = render_design_pil(1080, 1350, 150)
    num_frames = 150  # 15fps * 10 seconds

    for i in range(num_frames):
        frame = Image.new("RGB", (1080, 1080), PIL_BG)
        draw = ImageDraw.Draw(frame)

        t = i / num_frames

        if t < 0.3:
            # Zoom into full design
            progress = t / 0.3
            s = 0.5 + 0.3 * progress
            preview = design.resize((int(1080*s), int(1350*s)), Image.LANCZOS)
            x = (1080 - preview.width) // 2
            y = (1080 - preview.height) // 2
            frame.paste(preview, (x, y))
        elif t < 0.6:
            # Show handprint area zoomed
            progress = (t - 0.3) / 0.3
            crop_y = int(400 + 200 * (1 - abs(2*progress - 1)))
            crop = design.crop((100, crop_y, 980, crop_y + 880))
            crop_r = crop.resize((1080, 1080), Image.LANCZOS)
            frame.paste(crop_r, (0, 0))
        elif t < 0.8:
            # Show poem area
            crop = design.crop((100, 1050, 980, 1350))
            crop_r = crop.resize((1080, 370), Image.LANCZOS)
            frame = Image.new("RGB", (1080, 1080), PIL_BG)
            frame.paste(crop_r, (0, 355))
            draw = ImageDraw.Draw(frame)
            try:
                vf = ImageFont.truetype(get_system_font("script"), 48)
            except:
                vf = ImageFont.load_default()
            draw.text((200, 100), "A Keepsake", fill=PIL_BROWN_DARK, font=vf)
            draw.text((200, 170), "She'll Treasure", fill=PIL_BROWN_MED, font=vf)
            draw.text((200, 240), "Forever", fill=(232, 180, 200), font=vf)
        else:
            # CTA frame
            progress = (t - 0.8) / 0.2
            frame = Image.new("RGB", (1080, 1080), PIL_BROWN_DARK)
            draw = ImageDraw.Draw(frame)
            small = design.resize((500, 625), Image.LANCZOS)
            frame.paste(small, (290, 50))
            try:
                cta_f = ImageFont.truetype(get_system_font("script"), 52)
                btn_f = ImageFont.truetype(get_system_font("sans", bold=True), 36)
            except:
                cta_f = btn_f = ImageFont.load_default()
            draw.text((250, 730), "Instant Download", fill=PIL_WHITE, font=cta_f)
            draw.text((250, 810), "Print at Home", fill=(232, 180, 200), font=cta_f)
            draw.rounded_rectangle([300, 920, 780, 1000], radius=25, fill=PIL_WHITE)
            draw.text((370, 935), "SHOP NOW", fill=PIL_BROWN_DARK, font=btn_f)

        frame.save(os.path.join(VIDEO_DIR, f"frame_{i:04d}.jpg"), "JPEG", quality=90)

    print(f"  Created: {num_frames} video frames in {VIDEO_DIR}")


def generate_instructions_pdf(fonts):
    """Generate a simple instructions page for the bundle."""
    path = os.path.join(PRINTABLES_DIR, "Printing-Instructions.pdf")
    w, h = letter
    c = canvas.Canvas(path, pagesize=letter)

    c.setFillColor(BG_CREAM)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    c.setFillColor(BROWN_DARK)
    c.setFont(fonts["script"], 28)
    c.drawCentredString(w/2, h - 0.8*inch, "How to Create Your Handprint Bouquet")

    c.setFont(fonts["serif"], 11)
    c.setFillColor(BROWN_DARK)

    instructions = [
        ("What You'll Need:", [
            "Your printed bouquet page (use cardstock for best results!)",
            "Washable finger paint in your chosen colors",
            "Paper plate or palette for paint",
            "Paper towels and wet wipes for cleanup",
        ]),
        ("Steps:", [
            "1. Print the bouquet page at 100% / Actual Size on cardstock paper",
            "2. Pour a thin layer of washable paint onto a paper plate",
            "3. Press your child's hand into the paint, spreading fingers slightly",
            "4. Carefully press their hand onto each dashed circle on the bouquet",
            "5. Use different colors for each 'flower' for a colorful bouquet!",
            "6. Let dry completely (about 30 minutes)",
            "7. Write your child's name and age on the signature line",
            "8. Frame and gift to Mom, Grandma, or any special lady!",
        ]),
        ("Printing Tips:", [
            "Print on white cardstock (65-110 lb) for the best look and durability",
            "Select 'Actual Size' or '100%' in your printer settings (not 'Fit to Page')",
            "Use a color printer for the beautiful warm tones",
            "You can also take the file to Staples, FedEx, or Walgreens for printing",
        ]),
        ("Paint Suggestions:", [
            "Crayola Washable Finger Paints work great and clean up easily",
            "Try pink, purple, yellow, orange, and red for a vibrant bouquet",
            "For babies: apply paint with a foam brush, then gently press their hand",
            "Multiple children? Use a different color for each child's handprints!",
        ]),
    ]

    y = h - 1.3*inch
    for heading, items in instructions:
        c.setFont(fonts["serif_bold"], 12)
        c.setFillColor(BROWN_DARK)
        c.drawString(0.8*inch, y, heading)
        y -= 20

        c.setFont(fonts["serif"], 10)
        c.setFillColor(HexColor("#5a4a42"))
        for item in items:
            c.drawString(1.0*inch, y, item)
            y -= 16
        y -= 10

    c.setFillColor(BROWN_MED)
    c.setFont(fonts["serif_italic"], 9)
    c.drawCentredString(w/2, 0.5*inch, "Thank you for your purchase! \u2665 Shelzy's Designs")

    c.save()
    print(f"  Created: {path}")


# ─── MAIN ────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Mother's Day Handprint Bouquet - Asset Generator")
    print("=" * 60)

    print("\n[1/5] Registering fonts...")
    fonts = register_fonts()

    print("\n[2/5] Generating print-ready PDFs...")
    generate_printable_pdfs(fonts)

    print("\n[3/5] Generating high-res PNGs...")
    generate_png_printables()

    print("\n[4/5] Generating printing instructions...")
    generate_instructions_pdf(fonts)

    print("\n[5/5] Generating Etsy listing images...")
    generate_etsy_mockup_images()

    # Video frames (optional - takes longer)
    print("\n[BONUS] Generating video frames...")
    generate_video_frames()

    print("\n" + "=" * 60)
    print("  ALL ASSETS GENERATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\n  Printable files: {PRINTABLES_DIR}")
    print(f"  Etsy images:     {MOCKUPS_DIR}")
    print(f"  Video frames:    {VIDEO_DIR}")
    print(f"\n  Next: Assemble video with ffmpeg:")
    print(f"  ffmpeg -framerate 15 -i {VIDEO_DIR}/frame_%04d.jpg -c:v libx264 -pix_fmt yuv420p -t 10 listing-video.mp4")
