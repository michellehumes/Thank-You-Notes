#!/usr/bin/env python3
"""
Create Etsy listing video for 40 Days of Lent Activity Bundle
Etsy specs: 3-15 seconds, no audio, MP4, min 1080px, under 100MB
"""

from PIL import Image, ImageDraw, ImageFont
import subprocess
import os
import math

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
FRAMES_DIR = os.path.join(OUTPUT_DIR, "video_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

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

# Video specs: 1080x1080 (1:1 square), 12 seconds at 30fps = 360 frames
W, H = 1080, 1080
FPS = 24
DURATION = 12  # seconds
TOTAL_FRAMES = FPS * DURATION

def get_font(size, bold=False):
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()

def text_centered(draw, y, text, font, fill=BLACK, w=W):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (w - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)

def draw_filled_cross(draw, x, y, size, color=PURPLE_DARK):
    arm_w = size * 0.3
    draw.rectangle([x - arm_w/2, y - size/2, x + arm_w/2, y + size/2], fill=color)
    hy = y - size * 0.15
    draw.rectangle([x - size*0.4, hy - arm_w/2, x + size*0.4, hy + arm_w/2], fill=color)

def lerp(a, b, t):
    """Linear interpolation"""
    return a + (b - a) * t

def ease_in_out(t):
    """Smooth ease in/out"""
    return t * t * (3 - 2 * t)

def create_frame(frame_num):
    """Create a single video frame"""
    t = frame_num / TOTAL_FRAMES  # 0 to 1 progress

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # --- SCENE 1: Title (0-3 sec) ---
    if t < 0.25:
        scene_t = t / 0.25
        alpha = min(1.0, scene_t * 2)  # Fade in

        # Purple background
        draw.rectangle([0, 0, W, H], fill=PURPLE_DARK)

        # Animated crosses fade in
        if scene_t > 0.2:
            cross_alpha = min(1.0, (scene_t - 0.2) * 2)
            for cx in range(100, W, 150):
                y = 80
                cross_color = tuple(int(c * cross_alpha + PURPLE_DARK[i] * (1-cross_alpha))
                                   for i, c in enumerate(GOLD))
                draw.text((cx, y), "+", font=get_font(30), fill=cross_color)

        # Title slides in
        slide_offset = int((1 - ease_in_out(min(1.0, scene_t * 1.5))) * 200)

        font_title = get_font(72, bold=True)
        text_centered(draw, 250 + slide_offset, "40 Days of Lent", font_title, fill=WHITE)

        font_sub = get_font(48)
        if scene_t > 0.3:
            sub_offset = int((1 - ease_in_out(min(1.0, (scene_t - 0.3) * 2))) * 200)
            text_centered(draw, 360 + sub_offset, "Activity Bundle", font_sub, fill=WHITE)

        if scene_t > 0.5:
            font_accent = get_font(36, bold=True)
            accent_offset = int((1 - ease_in_out(min(1.0, (scene_t - 0.5) * 2))) * 100)
            text_centered(draw, 460 + accent_offset, "For Kids & Families", font_accent, fill=GOLD_LIGHT)

        # Cross animation
        if scene_t > 0.6:
            cross_t = (scene_t - 0.6) / 0.4
            cross_size = int(cross_t * 120)
            draw_filled_cross(draw, W//2, 650, cross_size, GOLD)

        # Page count badge
        if scene_t > 0.8:
            font_pages = get_font(30, bold=True)
            text_centered(draw, 800, "20 Pages  |  Instant Download", font_pages, fill=PURPLE_LIGHT)

    # --- SCENE 2: What's Inside (3-6 sec) ---
    elif t < 0.5:
        scene_t = (t - 0.25) / 0.25
        draw.rectangle([0, 0, W, H], fill=WHITE)

        # Header
        draw.rectangle([0, 0, W, 160], fill=PURPLE_DARK)
        font_header = get_font(48, bold=True)
        text_centered(draw, 45, "What's Inside", font_header, fill=WHITE)
        font_sub = get_font(28)
        text_centered(draw, 110, "20 Pages of Activities", font_sub, fill=GOLD_LIGHT)

        items = [
            "40-Day Countdown Calendar",
            "Daily Devotional Journal",
            "4 Coloring Pages",
            "20 Kindness Cards",
            "Scripture Verse Cards",
            "Holy Week Activities",
            "Lenten Promise Pages",
            "Easter Reflection"
        ]

        font_item = get_font(32, bold=True)
        start_y = 200
        item_h = 95

        for i, item in enumerate(items):
            # Stagger animation
            item_delay = i * 0.08
            if scene_t > item_delay:
                item_t = min(1.0, (scene_t - item_delay) * 3)
                slide_x = int((1 - ease_in_out(item_t)) * 300)

                y = start_y + i * item_h

                if i % 2 == 0:
                    draw.rectangle([0 + slide_x, y, W, y + item_h - 5],
                                  fill=PURPLE_VERY_LIGHT)

                # Cross icon
                draw_filled_cross(draw, 60 + slide_x, y + item_h//2, 22, PURPLE_MED)

                draw.text((95 + slide_x, y + 25), item, font=font_item, fill=PURPLE_DARK)

    # --- SCENE 3: Features scroll (6-9 sec) ---
    elif t < 0.75:
        scene_t = (t - 0.5) / 0.25
        draw.rectangle([0, 0, W, H], fill=CREAM)

        # Decorative border
        draw.rectangle([20, 20, W-20, H-20], outline=PURPLE_MED, width=3)

        font_header = get_font(44, bold=True)
        text_centered(draw, 50, "Why Families Love It", font_header, fill=PURPLE_DARK)
        draw.rectangle([200, 110, W-200, 114], fill=GOLD)

        features = [
            ("Easy to Print", "Just print & go!"),
            ("Scripture-Based", "Faith-centered activities"),
            ("Ages 4-12", "Kids & families"),
            ("Reusable", "Print unlimited copies"),
            ("20 Full Pages", "Packed with content"),
            ("Instant Download", "Start immediately!"),
        ]

        font_feat = get_font(34, bold=True)
        font_desc = get_font(26)

        for i, (title, desc) in enumerate(features):
            feat_delay = i * 0.1
            if scene_t > feat_delay:
                feat_t = min(1.0, (scene_t - feat_delay) * 2.5)
                scale = ease_in_out(feat_t)

                y = 150 + i * 140

                # Animated circle
                cx = 80
                cy = y + 40
                radius = int(scale * 30)
                draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], fill=PURPLE_MED)
                if radius > 15:
                    draw_filled_cross(draw, cx, cy, radius - 5, WHITE)

                if scale > 0.5:
                    draw.text((130, y + 10), title, font=font_feat, fill=PURPLE_DARK)
                    draw.text((130, y + 50), desc, font=font_desc, fill=GRAY)

    # --- SCENE 4: CTA (9-12 sec) ---
    else:
        scene_t = (t - 0.75) / 0.25
        draw.rectangle([0, 0, W, H], fill=PURPLE_DARK)

        # Animated gold lines
        for i in range(5):
            line_y = 100 + i * 200
            line_alpha = min(1.0, scene_t * 3)
            x_extent = int(ease_in_out(min(1.0, scene_t * 2)) * W/2)
            draw.line([(W//2 - x_extent, line_y), (W//2 + x_extent, line_y)],
                     fill=GOLD, width=1)

        # Large cross
        cross_size = int(ease_in_out(min(1.0, scene_t * 2)) * 200)
        draw_filled_cross(draw, W//2, 300, cross_size, GOLD)

        # Text
        if scene_t > 0.2:
            font_cta = get_font(58, bold=True)
            text_centered(draw, 450, "40 Days of Lent", font_cta, fill=WHITE)
            text_centered(draw, 530, "Activity Bundle", font_cta, fill=WHITE)

        if scene_t > 0.4:
            font_sub = get_font(38)
            text_centered(draw, 640, "20 Pages  |  Instant Download", font_sub, fill=GOLD_LIGHT)

        if scene_t > 0.6:
            # Pulsing CTA button
            pulse = 0.95 + 0.05 * math.sin(scene_t * 20)
            btn_w = int(600 * pulse)
            btn_h = int(80 * pulse)
            bx = (W - btn_w) // 2
            by = 760
            draw.rounded_rectangle([bx, by, bx+btn_w, by+btn_h], radius=20, fill=GOLD)
            font_btn = get_font(36, bold=True)
            text_centered(draw, by + 18, "Add to Cart Now!", font_btn, fill=PURPLE_DARK)

        if scene_t > 0.7:
            font_sm = get_font(28)
            text_centered(draw, 880, "Printable PDF  |  8.5\" x 11\"", font_sm, fill=PURPLE_LIGHT)
            text_centered(draw, 930, "Shelzy's Designs", font_sm, fill=GOLD_LIGHT)

    return img

def main():
    print(f"Creating {TOTAL_FRAMES} frames at {FPS}fps ({DURATION}s)...")

    # Generate all frames
    for i in range(TOTAL_FRAMES):
        frame = create_frame(i)
        frame.save(os.path.join(FRAMES_DIR, f"frame_{i:04d}.png"))
        if i % 30 == 0:
            print(f"  Frame {i}/{TOTAL_FRAMES}")

    print("All frames created. Assembling video with ffmpeg...")

    # Assemble with ffmpeg
    output_path = os.path.join(OUTPUT_DIR, "etsy_listing_video.mp4")
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(FRAMES_DIR, "frame_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "23",
        "-an",  # No audio (Etsy strips it anyway)
        output_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size = os.path.getsize(output_path)
        print(f"Video created: {output_path}")
        print(f"File size: {size / 1024 / 1024:.1f} MB")
    else:
        print(f"ffmpeg error: {result.stderr[-500:]}")

if __name__ == "__main__":
    main()
