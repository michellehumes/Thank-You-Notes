#!/usr/bin/env python3
"""
40 Days of Lent Activity Bundle for Kids & Families
Digital Download Product for Etsy
"""

from fpdf import FPDF
from PIL import Image, ImageDraw, ImageFont
import os
import math

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Color palette - soft, warm, spiritual tones
PURPLE_DARK = (88, 44, 131)      # Deep Lenten purple
PURPLE_MED = (128, 90, 170)      # Medium purple
PURPLE_LIGHT = (200, 180, 220)   # Light purple
GOLD = (196, 164, 80)            # Gold accent
CREAM = (252, 248, 240)          # Warm cream background
WHITE = (255, 255, 255)
BLACK = (40, 40, 40)
GRAY = (120, 120, 120)
LIGHT_GRAY = (200, 200, 200)
SOFT_PINK = (230, 200, 210)

class LentBundlePDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'Letter')
        self.set_auto_page_break(auto=False)

    def draw_decorative_border(self, style="simple"):
        """Draw a decorative border around the page"""
        w, h = self.w, self.h
        margin = 8

        if style == "simple":
            self.set_draw_color(*PURPLE_MED)
            self.set_line_width(0.8)
            self.rect(margin, margin, w - 2*margin, h - 2*margin)
            # Inner line
            self.set_line_width(0.3)
            self.rect(margin + 2, margin + 2, w - 2*margin - 4, h - 2*margin - 4)

        elif style == "cross_corners":
            self.set_draw_color(*PURPLE_DARK)
            self.set_line_width(0.5)
            self.rect(margin, margin, w - 2*margin, h - 2*margin)
            # Draw small crosses in corners
            cross_size = 4
            for cx, cy in [(margin+6, margin+6), (w-margin-6, margin+6),
                           (margin+6, h-margin-6), (w-margin-6, h-margin-6)]:
                self.line(cx - cross_size/2, cy, cx + cross_size/2, cy)
                self.line(cx, cy - cross_size, cx, cy + cross_size)

        elif style == "dots":
            self.set_draw_color(*PURPLE_LIGHT)
            self.set_line_width(0.3)
            self.rect(margin, margin, w - 2*margin, h - 2*margin)
            # Dotted inner border
            step = 3
            inner = margin + 3
            for x in range(int(inner), int(w - inner), step):
                self.circle(x, inner, 0.3, style='F')
                self.circle(x, h - inner, 0.3, style='F')
            for y in range(int(inner), int(h - inner), step):
                self.circle(inner, y, 0.3, style='F')
                self.circle(w - inner, y, 0.3, style='F')

    def draw_cross(self, x, y, size, fill=True):
        """Draw a simple cross"""
        arm_w = size * 0.35
        if fill:
            self.set_fill_color(*PURPLE_DARK)
            # Vertical beam
            self.rect(x - arm_w/2, y - size/2, arm_w, size, 'F')
            # Horizontal beam (higher up)
            cross_y = y - size * 0.15
            self.rect(x - size*0.4, cross_y - arm_w/2, size*0.8, arm_w, 'F')
        else:
            self.set_draw_color(*PURPLE_DARK)
            self.set_line_width(0.5)
            self.line(x, y - size/2, x, y + size/2)
            cross_y = y - size * 0.15
            self.line(x - size*0.4, cross_y, x + size*0.4, cross_y)

    def draw_dove(self, x, y, size):
        """Draw a simple dove shape"""
        self.set_draw_color(*PURPLE_MED)
        self.set_line_width(0.4)
        # Body (oval)
        self.ellipse(x - size*0.3, y - size*0.15, size*0.6, size*0.3)
        # Wing (arc)
        self.line(x, y - size*0.1, x + size*0.3, y - size*0.4)
        self.line(x + size*0.3, y - size*0.4, x + size*0.15, y - size*0.05)
        # Tail
        self.line(x - size*0.3, y, x - size*0.5, y - size*0.15)
        self.line(x - size*0.3, y, x - size*0.5, y + size*0.1)

    def page_cover(self):
        """Create the cover page"""
        self.add_page()
        w, h = self.w, self.h

        # Purple header block
        self.set_fill_color(*PURPLE_DARK)
        self.rect(0, 0, w, 95, 'F')

        # Decorative gold line
        self.set_draw_color(*GOLD)
        self.set_line_width(1.5)
        self.line(30, 93, w-30, 93)
        self.set_line_width(0.5)
        self.line(30, 96, w-30, 96)

        # Title
        self.set_text_color(*WHITE)
        self.set_font('Helvetica', 'B', 36)
        self.set_y(18)
        self.cell(0, 16, '40 Days of Lent', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_font('Helvetica', '', 20)
        self.cell(0, 10, 'Activity Bundle', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_text_color(*GOLD)
        self.set_font('Helvetica', 'I', 14)
        self.set_y(58)
        self.cell(0, 8, 'For Kids & Families', align='C', new_x="LMARGIN", new_y="NEXT")

        # Small crosses decoration
        self.set_text_color(*WHITE)
        self.set_font('Helvetica', '', 10)
        self.set_y(75)
        self.cell(0, 6, '+  +  +  +  +  +  +  +  +', align='C', new_x="LMARGIN", new_y="NEXT")

        # Content description section
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 13)
        self.set_y(110)
        self.cell(0, 8, "What's Inside:", align='C', new_x="LMARGIN", new_y="NEXT")

        items = [
            "40-Day Lent Countdown Calendar & Tracker",
            "Daily Devotional Journal Pages",
            "Stations of the Cross Coloring Pages",
            "Acts of Kindness Challenge Cards",
            "Lenten Promise & Prayer Pages",
            "Scripture Memory Verse Cards",
            "Holy Week Activity Pages",
            "Easter Reflection Pages"
        ]

        self.set_font('Helvetica', '', 11)
        self.set_text_color(*BLACK)
        for item in items:
            self.set_x(55)
            self.set_fill_color(*PURPLE_MED)
            self.circle(self.get_x() - 5, self.get_y() + 3.5, 1.2, style='F')
            self.cell(0, 7.5, item, new_x="LMARGIN", new_y="NEXT")

        # Footer
        self.set_draw_color(*PURPLE_LIGHT)
        self.set_line_width(0.5)
        self.line(30, h - 35, w - 30, h - 35)

        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 9)
        self.set_y(h - 30)
        self.cell(0, 5, 'Printable PDF  |  8.5" x 11" Letter Size  |  US & A4 Friendly', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', '', 8)
        self.cell(0, 5, "Shelzy's Designs", align='C')

    def page_how_to_use(self):
        """How to use this bundle"""
        self.add_page()
        self.draw_decorative_border("cross_corners")

        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 22)
        self.set_y(18)
        self.cell(0, 12, 'How to Use This Bundle', align='C', new_x="LMARGIN", new_y="NEXT")

        # Decorative line
        self.set_draw_color(*GOLD)
        self.set_line_width(0.8)
        self.line(70, 32, self.w - 70, 32)

        sections = [
            ("Print at Home", "Print on standard 8.5\" x 11\" letter paper. We recommend cardstock for coloring pages and activity cards. Print all pages or just the ones you need!"),
            ("Start on Ash Wednesday", "Begin your 40-day journey on Ash Wednesday. Use the countdown calendar to track each day of Lent leading up to Easter Sunday."),
            ("Daily Devotion", "Each day, complete one devotional journal page. Read the Scripture verse, reflect on the question, and write or draw your response."),
            ("Coloring & Activities", "Use the coloring pages and activity sheets throughout Lent. The Stations of the Cross pages are perfect for Holy Week."),
            ("Acts of Kindness", "Cut out the kindness cards and complete one act each day. Track your progress on the kindness tracker page."),
            ("Family Time", "This bundle works great for family devotions, Sunday School, homeschool, or individual quiet time with God.")
        ]

        self.set_y(40)
        for i, (title, desc) in enumerate(sections):
            # Number circle
            self.set_fill_color(*PURPLE_DARK)
            cx = 22
            cy = self.get_y() + 8
            self.circle(cx, cy, 5, style='F')
            self.set_text_color(*WHITE)
            self.set_font('Helvetica', 'B', 11)
            self.text(cx - 2.5 if i < 9 else cx - 4, cy + 3, str(i+1))

            # Title
            self.set_text_color(*PURPLE_DARK)
            self.set_font('Helvetica', 'B', 12)
            self.set_x(32)
            self.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")

            # Description
            self.set_text_color(*BLACK)
            self.set_font('Helvetica', '', 9.5)
            self.set_x(32)
            self.multi_cell(self.w - 45, 5, desc)
            self.ln(5)

        # Footer tip
        self.set_y(self.h - 30)
        self.set_fill_color(*PURPLE_LIGHT)
        self.rect(15, self.get_y(), self.w - 30, 15, 'F')
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'I', 9)
        self.set_xy(20, self.get_y() + 2)
        self.multi_cell(self.w - 40, 5, "Tip: Laminate the countdown calendar and use dry-erase markers so you can reuse it each year!")

    def page_countdown_calendar(self):
        """40-Day Lent Countdown Calendar"""
        self.add_page()
        self.draw_decorative_border("simple")

        # Title
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 20)
        self.set_y(14)
        self.cell(0, 10, '40 Days of Lent', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', '', 14)
        self.set_text_color(*PURPLE_MED)
        self.cell(0, 7, 'Countdown Calendar', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 9)
        self.cell(0, 6, 'Color in or check off each day as you journey through Lent!', align='C', new_x="LMARGIN", new_y="NEXT")

        # Grid of 40 days (8 columns x 5 rows)
        cols = 8
        rows = 5
        start_x = 16
        start_y = 44
        cell_w = (self.w - 32) / cols
        cell_h = 38

        day = 1
        for row in range(rows):
            for col in range(cols):
                if day > 40:
                    break
                x = start_x + col * cell_w
                y = start_y + row * cell_h

                # Cell border
                self.set_draw_color(*PURPLE_LIGHT)
                self.set_line_width(0.3)
                self.rect(x, y, cell_w, cell_h)

                # Day number
                self.set_text_color(*PURPLE_DARK)
                self.set_font('Helvetica', 'B', 11)
                self.text(x + 2, y + 6, f'Day {day}')

                # Small cross to color in
                cross_x = x + cell_w/2
                cross_y = y + 20
                self.draw_cross(cross_x, cross_y, 12, fill=False)

                # Checkbox
                self.set_draw_color(*PURPLE_LIGHT)
                self.rect(x + cell_w - 7, y + cell_h - 7, 4, 4)

                day += 1

        # Footer
        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 8)
        self.set_y(self.h - 18)
        self.cell(0, 5, 'Ash Wednesday to Easter Sunday  |  Color each cross as you complete each day', align='C')

    def page_devotional_journal(self, day_num, verse, theme, reflection_prompt):
        """Daily devotional journal page"""
        self.add_page()
        self.draw_decorative_border("dots")

        # Header
        self.set_fill_color(*PURPLE_DARK)
        self.rect(12, 12, self.w - 24, 22, 'F')

        self.set_text_color(*WHITE)
        self.set_font('Helvetica', 'B', 16)
        self.set_xy(15, 15)
        self.cell(0, 8, f'Day {day_num}', new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', '', 10)
        self.set_x(15)
        self.cell(0, 6, theme)

        # Scripture verse box
        self.set_y(42)
        self.set_fill_color(245, 240, 250)
        self.rect(15, 40, self.w - 30, 25, 'F')
        self.set_draw_color(*PURPLE_LIGHT)
        self.set_line_width(0.3)
        self.rect(15, 40, self.w - 30, 25)

        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 9)
        self.set_xy(20, 42)
        self.cell(0, 5, "Today's Scripture:")
        self.set_font('Helvetica', 'I', 10)
        self.set_xy(20, 49)
        self.multi_cell(self.w - 45, 5, verse)

        # Reflection question
        self.set_y(72)
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 7, "  Reflect:", new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*BLACK)
        self.set_x(18)
        self.multi_cell(self.w - 36, 5.5, reflection_prompt)

        # Writing lines
        self.ln(3)
        line_y = self.get_y() + 2
        self.set_draw_color(*PURPLE_LIGHT)
        self.set_line_width(0.2)
        num_lines = 8
        for i in range(num_lines):
            y = line_y + i * 9
            if y < self.h - 80:
                self.line(18, y, self.w - 18, y)

        # Prayer section
        prayer_y = min(line_y + num_lines * 9 + 5, self.h - 75)
        self.set_y(prayer_y)
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 7, "  My Prayer Today:", new_x="LMARGIN", new_y="NEXT")

        # Prayer lines
        self.set_draw_color(*PURPLE_LIGHT)
        for i in range(5):
            y = self.get_y() + 3 + i * 9
            if y < self.h - 30:
                self.line(18, y, self.w - 18, y)

        # Bottom section - Today I'm Grateful For
        self.set_y(self.h - 35)
        self.set_draw_color(*GOLD)
        self.set_line_width(0.5)
        self.line(18, self.get_y(), self.w - 18, self.get_y())
        self.ln(3)
        self.set_text_color(*GOLD)
        self.set_font('Helvetica', 'B', 10)
        self.cell(0, 6, "  Today I'm Grateful For:", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*PURPLE_LIGHT)
        self.line(18, self.get_y() + 5, self.w - 18, self.get_y() + 5)
        self.line(18, self.get_y() + 14, self.w - 18, self.get_y() + 14)

    def page_coloring_page(self, title, description, symbol="cross"):
        """Coloring page with outlined designs"""
        self.add_page()
        self.draw_decorative_border("simple")

        # Title
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 18)
        self.set_y(16)
        self.cell(0, 10, title, align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 9)
        self.cell(0, 5, description, align='C', new_x="LMARGIN", new_y="NEXT")

        # Large drawing/coloring area
        area_y = 38
        area_h = self.h - 55
        self.set_draw_color(*PURPLE_LIGHT)
        self.set_line_width(0.3)
        self.rect(15, area_y, self.w - 30, area_h)

        center_x = self.w / 2
        center_y = area_y + area_h / 2

        if symbol == "cross":
            # Large ornate cross outline
            self.set_draw_color(*PURPLE_MED)
            self.set_line_width(0.8)

            # Main cross shape
            arm_w = 18
            v_h = 80
            h_w = 60
            # Vertical beam
            self.rect(center_x - arm_w/2, center_y - v_h/2, arm_w, v_h)
            # Horizontal beam
            cross_top = center_y - v_h * 0.15
            self.rect(center_x - h_w/2, cross_top - arm_w/2, h_w, arm_w)

            # Inner decorative lines
            self.set_line_width(0.3)
            inner_off = 3
            self.rect(center_x - arm_w/2 + inner_off, center_y - v_h/2 + inner_off,
                      arm_w - 2*inner_off, v_h - 2*inner_off)
            self.rect(center_x - h_w/2 + inner_off, cross_top - arm_w/2 + inner_off,
                      h_w - 2*inner_off, arm_w - 2*inner_off)

            # Decorative circles at ends
            for cx, cy in [(center_x, center_y - v_h/2 - 5), (center_x, center_y + v_h/2 + 5),
                           (center_x - h_w/2 - 5, cross_top), (center_x + h_w/2 + 5, cross_top)]:
                self.circle(cx, cy, 4)

            # Heart in center
            self.set_draw_color(*PURPLE_MED)
            self.circle(center_x, center_y - 3, 5)

        elif symbol == "dove":
            # Large dove outline with olive branch
            self.set_draw_color(*PURPLE_MED)
            self.set_line_width(0.8)
            # Body
            self.ellipse(center_x - 30, center_y - 15, 60, 30)
            # Head
            self.circle(center_x + 20, center_y - 18, 12)
            # Wing (large arc)
            self.set_line_width(0.6)
            self.line(center_x - 10, center_y - 5, center_x + 10, center_y - 40)
            self.line(center_x + 10, center_y - 40, center_x + 30, center_y - 15)
            # Tail feathers
            for angle_offset in [-10, 0, 10]:
                self.line(center_x - 30, center_y, center_x - 50, center_y + angle_offset - 5)
            # Eye
            self.circle(center_x + 23, center_y - 20, 2)
            # Olive branch
            self.line(center_x + 30, center_y - 12, center_x + 50, center_y - 20)
            for i in range(3):
                lx = center_x + 35 + i * 5
                ly = center_y - 14 - i * 2.5
                self.ellipse(lx, ly - 3, 4, 6)

        elif symbol == "candle":
            # Large candle with flame
            self.set_draw_color(*PURPLE_MED)
            self.set_line_width(0.8)
            # Candle body
            self.rect(center_x - 12, center_y - 20, 24, 60)
            # Candle base
            self.rect(center_x - 18, center_y + 40, 36, 10)
            # Flame (teardrop shape)
            self.ellipse(center_x - 6, center_y - 40, 12, 20)
            # Dripping wax
            self.set_line_width(0.5)
            for dx in [-6, 0, 8]:
                self.line(center_x + dx, center_y - 20, center_x + dx + 2, center_y - 12)
            # Inner flame
            self.ellipse(center_x - 3, center_y - 36, 6, 12)

        elif symbol == "praying_hands":
            # Simplified praying hands
            self.set_draw_color(*PURPLE_MED)
            self.set_line_width(0.8)
            # Left hand
            self.ellipse(center_x - 18, center_y - 30, 16, 50)
            # Right hand
            self.ellipse(center_x + 2, center_y - 30, 16, 50)
            # Fingers
            self.set_line_width(0.4)
            for i in range(4):
                y_off = center_y - 25 + i * 8
                self.line(center_x - 2, y_off, center_x + 2, y_off)
            # Light rays
            self.set_line_width(0.3)
            for angle in range(-60, 61, 15):
                rad = math.radians(angle)
                self.line(center_x, center_y - 35,
                         center_x + 35 * math.sin(rad), center_y - 35 - 35 * math.cos(rad))

        # Bottom instruction
        self.set_y(self.h - 18)
        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 5, "Color this page and reflect on God's love during Lent", align='C')

    def page_kindness_cards(self):
        """Acts of Kindness challenge cards"""
        self.add_page()
        self.draw_decorative_border("cross_corners")

        # Title
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 20)
        self.set_y(14)
        self.cell(0, 10, 'Lenten Acts of Kindness', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', 'I', 10)
        self.set_text_color(*PURPLE_MED)
        self.cell(0, 6, 'Cut out these cards and complete one act each day!', align='C', new_x="LMARGIN", new_y="NEXT")

        kindness_acts = [
            "Write a thank you note to someone",
            "Help with chores without being asked",
            "Pray for someone who is sick",
            "Share your toys or books",
            "Say something kind to a friend",
            "Help make dinner for your family",
            "Draw a picture for someone who is lonely",
            "Pick up trash at a park",
            "Give someone a hug",
            "Donate canned food to a food bank",
            "Write a letter to a grandparent",
            "Let someone go first",
            "Compliment three people today",
            "Help a younger child",
            "Pray for people around the world",
            "Make a card for a neighbor",
            "Share your snack with a friend",
            "Hold the door open for others",
            "Forgive someone who hurt your feelings",
            "Read a Bible story to someone"
        ]

        cols = 4
        rows = 5
        start_x = 14
        start_y = 36
        card_w = (self.w - 28) / cols
        card_h = (self.h - 52) / rows

        idx = 0
        for row in range(rows):
            for col in range(cols):
                if idx >= len(kindness_acts):
                    break
                x = start_x + col * card_w
                y = start_y + row * card_h

                # Card background with rounded feel
                self.set_draw_color(*PURPLE_MED)
                self.set_line_width(0.4)
                # Dashed border effect
                self.set_dash_pattern(dash=2, gap=1)
                self.rect(x + 1, y + 1, card_w - 2, card_h - 2)
                self.set_dash_pattern(dash=0, gap=0)

                # Small cross at top
                self.draw_cross(x + card_w/2, y + 8, 6, fill=False)

                # Number
                self.set_text_color(*GOLD)
                self.set_font('Helvetica', 'B', 8)
                self.text(x + 3, y + 6, f'#{idx + 1}')

                # Text
                self.set_text_color(*BLACK)
                self.set_font('Helvetica', '', 7.5)
                self.set_xy(x + 4, y + 15)
                self.multi_cell(card_w - 8, 4, kindness_acts[idx], align='C')

                # Checkbox
                self.set_draw_color(*PURPLE_LIGHT)
                check_y = y + card_h - 9
                self.rect(x + card_w/2 - 2.5, check_y, 5, 5)
                self.set_font('Helvetica', '', 5)
                self.set_text_color(*GRAY)
                self.text(x + card_w/2 - 5, check_y + 8, 'Done!')

                idx += 1

    def page_kindness_tracker(self):
        """40-day kindness tracker"""
        self.add_page()
        self.draw_decorative_border("simple")

        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 20)
        self.set_y(14)
        self.cell(0, 10, 'My Kindness Tracker', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*PURPLE_MED)
        self.set_font('Helvetica', 'I', 10)
        self.cell(0, 6, 'Color in a heart for each act of kindness you complete!', align='C', new_x="LMARGIN", new_y="NEXT")

        # 40 hearts in a grid (8x5)
        cols = 8
        rows = 5
        start_x = 18
        start_y = 40
        cell_w = (self.w - 36) / cols
        cell_h = (self.h - 75) / rows

        self.set_draw_color(*PURPLE_MED)
        self.set_line_width(0.5)

        day = 1
        for row in range(rows):
            for col in range(cols):
                if day > 40:
                    break
                cx = start_x + col * cell_w + cell_w/2
                cy = start_y + row * cell_h + cell_h/2

                # Heart shape (two circles + triangle)
                r = 6
                # Left circle
                self.circle(cx - r*0.5, cy - r*0.3, r*0.6)
                # Right circle
                self.circle(cx + r*0.5, cy - r*0.3, r*0.6)
                # Lines to bottom point
                self.line(cx - r*1.1, cy, cx, cy + r*1.2)
                self.line(cx + r*1.1, cy, cx, cy + r*1.2)

                # Day number below
                self.set_text_color(*PURPLE_DARK)
                self.set_font('Helvetica', '', 7)
                day_text = str(day)
                self.text(cx - len(day_text) * 1.5, cy + r*1.2 + 6, f'Day {day}')

                day += 1

        # Note at bottom
        self.set_y(self.h - 22)
        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 5, '"Be kind to one another, tenderhearted, forgiving one another" - Ephesians 4:32', align='C')

    def page_lenten_promises(self):
        """Lenten Promises page"""
        self.add_page()
        self.draw_decorative_border("cross_corners")

        # Title
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 22)
        self.set_y(16)
        self.cell(0, 10, 'My Lenten Promises', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_draw_color(*GOLD)
        self.set_line_width(0.8)
        self.line(65, 28, self.w - 65, 28)

        # Section 1: What I Will Give Up
        self.set_y(36)
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 14)
        self.cell(0, 8, '  What I Will Give Up for Lent:', new_x="LMARGIN", new_y="NEXT")

        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(*GRAY)
        self.set_x(20)
        self.cell(0, 5, '(Fasting from something helps us focus on God)', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        self.set_draw_color(*PURPLE_LIGHT)
        self.set_line_width(0.2)
        for i in range(4):
            y = self.get_y() + i * 12
            self.line(20, y, self.w - 20, y)
            self.set_text_color(*PURPLE_LIGHT)
            self.set_font('Helvetica', '', 8)
            self.text(21, y - 1, f'{i+1}.')

        # Section 2: What I Will Do More Of
        self.set_y(100)
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 14)
        self.cell(0, 8, '  What I Will Do More Of:', new_x="LMARGIN", new_y="NEXT")

        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(*GRAY)
        self.set_x(20)
        self.cell(0, 5, '(Prayer, giving, serving others)', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        for i in range(4):
            y = self.get_y() + i * 12
            self.line(20, y, self.w - 20, y)
            self.set_text_color(*PURPLE_LIGHT)
            self.set_font('Helvetica', '', 8)
            self.text(21, y - 1, f'{i+1}.')

        # Section 3: My Prayer Intention
        self.set_y(170)
        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 14)
        self.cell(0, 8, '  My Special Prayer Intention:', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        # Prayer box
        self.set_fill_color(245, 240, 250)
        self.rect(18, self.get_y(), self.w - 36, 40, 'FD')
        self.set_draw_color(*PURPLE_LIGHT)
        for i in range(4):
            y = self.get_y() + 5 + i * 9
            self.line(22, y, self.w - 22, y)

        # Signature line
        self.set_y(self.h - 35)
        self.set_draw_color(*PURPLE_MED)
        self.set_line_width(0.4)
        self.line(20, self.get_y(), self.w/2 - 10, self.get_y())
        self.line(self.w/2 + 10, self.get_y(), self.w - 20, self.get_y())
        self.set_text_color(*GRAY)
        self.set_font('Helvetica', 'I', 8)
        self.text(22, self.get_y() + 5, 'Signed')
        self.text(self.w/2 + 12, self.get_y() + 5, 'Date')

    def page_scripture_cards(self):
        """Scripture Memory Verse Cards"""
        self.add_page()
        self.draw_decorative_border("simple")

        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 18)
        self.set_y(14)
        self.cell(0, 10, 'Scripture Memory Verse Cards', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(*GRAY)
        self.cell(0, 5, 'Cut out and memorize one verse each week of Lent!', align='C', new_x="LMARGIN", new_y="NEXT")

        verses = [
            ("Joel 2:13", "Return to the Lord your God, for He is gracious\nand compassionate, slow to anger\nand abounding in love."),
            ("Psalm 51:10", "Create in me a pure heart, O God,\nand renew a steadfast spirit within me."),
            ("Isaiah 58:6", "Is not this the kind of fasting I have chosen:\nto loose the chains of injustice\nand set the oppressed free?"),
            ("Matthew 6:6", "When you pray, go into your room,\nclose the door and pray to your Father,\nwho sees what is done in secret."),
            ("James 4:8", "Come near to God and\nHe will come near to you."),
            ("Philippians 4:13", "I can do all things through Christ\nwho strengthens me."),
        ]

        cols = 2
        rows = 3
        start_x = 15
        start_y = 34
        card_w = (self.w - 30) / cols
        card_h = (self.h - 52) / rows

        idx = 0
        for row in range(rows):
            for col in range(cols):
                if idx >= len(verses):
                    break
                x = start_x + col * card_w
                y = start_y + row * card_h

                # Card border with dashed lines for cutting
                self.set_draw_color(*PURPLE_MED)
                self.set_line_width(0.4)
                self.set_dash_pattern(dash=2, gap=1.5)
                self.rect(x + 2, y + 2, card_w - 4, card_h - 4)
                self.set_dash_pattern(dash=0, gap=0)

                # Inner solid border
                self.set_line_width(0.3)
                self.rect(x + 5, y + 5, card_w - 10, card_h - 10)

                # Small cross at top center
                self.draw_cross(x + card_w/2, y + 14, 8, fill=False)

                # Reference
                ref, text = verses[idx]
                self.set_text_color(*GOLD)
                self.set_font('Helvetica', 'B', 10)
                self.set_xy(x + 8, y + 22)
                self.cell(card_w - 16, 6, ref, align='C', new_x="LMARGIN", new_y="NEXT")

                # Verse text
                self.set_text_color(*PURPLE_DARK)
                self.set_font('Helvetica', 'I', 9)
                self.set_xy(x + 10, y + 32)
                self.multi_cell(card_w - 20, 5, text, align='C')

                # Week label
                self.set_text_color(*GRAY)
                self.set_font('Helvetica', '', 7)
                self.text(x + card_w/2 - 8, y + card_h - 10, f'Week {idx + 1} of Lent')

                idx += 1

    def page_holy_week(self):
        """Holy Week daily activity page"""
        self.add_page()
        self.draw_decorative_border("cross_corners")

        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', 'B', 22)
        self.set_y(14)
        self.cell(0, 10, 'Holy Week Journey', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_draw_color(*GOLD)
        self.set_line_width(0.8)
        self.line(60, 27, self.w - 60, 27)

        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(*GRAY)
        self.cell(0, 7, 'Follow Jesus through the most important week in history', align='C', new_x="LMARGIN", new_y="NEXT")

        days = [
            ("Palm Sunday", "Jesus enters Jerusalem on a donkey while people wave palm branches and shout 'Hosanna!'", "Draw palm branches and write 'Hosanna!'"),
            ("Monday", "Jesus teaches in the temple and drives out the money changers.", "What does Jesus teach us about prayer?"),
            ("Tuesday", "Jesus tells parables and answers questions from the religious leaders.", "Draw or write about your favorite parable."),
            ("Wednesday", "A woman anoints Jesus with expensive perfume as an act of love.", "How can you show love to Jesus today?"),
            ("Holy Thursday", "Jesus washes His disciples' feet and shares the Last Supper.", "Draw the bread and cup. What does communion mean?"),
            ("Good Friday", "Jesus carries His cross and dies for our sins.", "Write a prayer thanking Jesus for His sacrifice."),
            ("Holy Saturday", "A day of waiting and hope. Jesus' friends are sad but God has a plan.", "What are you waiting and hoping for?"),
            ("Easter Sunday!", "Jesus is RISEN! The tomb is empty! He conquered death!", "Draw the empty tomb. He is Risen!")
        ]

        start_y = 38
        row_h = (self.h - 52) / len(days)

        for i, (day, event, activity) in enumerate(days):
            y = start_y + i * row_h

            # Alternating background
            if i % 2 == 0:
                self.set_fill_color(248, 244, 252)
                self.rect(12, y, self.w - 24, row_h, 'F')

            # Day name
            self.set_text_color(*PURPLE_DARK)
            self.set_font('Helvetica', 'B', 9)
            self.set_xy(15, y + 1)
            self.cell(35, 5, day)

            # Event
            self.set_text_color(*BLACK)
            self.set_font('Helvetica', '', 7.5)
            self.set_xy(50, y + 1)
            self.multi_cell(70, 3.5, event)

            # Activity
            self.set_text_color(*PURPLE_MED)
            self.set_font('Helvetica', 'I', 7.5)
            self.set_xy(125, y + 1)
            self.multi_cell(self.w - 140, 3.5, activity)

            # Separator line
            if i < len(days) - 1:
                self.set_draw_color(*PURPLE_LIGHT)
                self.set_line_width(0.15)
                self.line(14, y + row_h, self.w - 14, y + row_h)

    def page_easter_reflection(self):
        """Easter Reflection / completion page"""
        self.add_page()
        self.draw_decorative_border("cross_corners")

        # Title
        self.set_fill_color(*PURPLE_DARK)
        self.rect(0, 0, self.w, 55, 'F')

        self.set_text_color(*GOLD)
        self.set_font('Helvetica', 'B', 28)
        self.set_y(12)
        self.cell(0, 14, 'He Is Risen!', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_text_color(*WHITE)
        self.set_font('Helvetica', '', 14)
        self.cell(0, 8, 'Easter Reflection', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_font('Helvetica', 'I', 10)
        self.set_y(40)
        self.cell(0, 6, '+  +  +  +  +  +  +  +  +', align='C')

        # Reflection prompts with writing space
        prompts = [
            "What is the most important thing I learned during Lent?",
            "How did I grow closer to God in these 40 days?",
            "What act of kindness made me feel the happiest?",
            "What was the hardest part of my Lenten journey?",
            "How will I carry what I learned into the rest of the year?"
        ]

        self.set_y(65)
        for i, prompt in enumerate(prompts):
            self.set_text_color(*PURPLE_DARK)
            self.set_font('Helvetica', 'B', 10)
            self.set_x(18)
            self.cell(0, 6, f'{i+1}. {prompt}', new_x="LMARGIN", new_y="NEXT")

            # Writing lines
            self.set_draw_color(*PURPLE_LIGHT)
            self.set_line_width(0.2)
            for j in range(2):
                y = self.get_y() + 3 + j * 8
                self.line(22, y, self.w - 22, y)
            self.set_y(self.get_y() + 22)

        # Completion certificate
        self.set_y(self.h - 50)
        self.set_draw_color(*GOLD)
        self.set_line_width(1)
        self.rect(25, self.get_y(), self.w - 50, 35)
        self.set_line_width(0.3)
        self.rect(27, self.get_y() + 2, self.w - 54, 31)

        self.set_text_color(*GOLD)
        self.set_font('Helvetica', 'B', 12)
        self.set_y(self.get_y() + 5)
        self.cell(0, 6, 'I Completed My 40 Days of Lent!', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_text_color(*PURPLE_DARK)
        self.set_font('Helvetica', '', 9)
        self.cell(0, 5, 'Name: _________________________    Date: ____________', align='C')


def create_lent_bundle():
    pdf = LentBundlePDF()

    # Page 1: Cover
    pdf.page_cover()

    # Page 2: How to Use
    pdf.page_how_to_use()

    # Page 3: 40-Day Countdown Calendar
    pdf.page_countdown_calendar()

    # Pages 4-10: Sample Devotional Journal Pages (7 pages for Week 1)
    devotionals = [
        (1, '"Yet even now," declares the Lord, "return to me with all your heart." - Joel 2:12',
         "Returning to God", "What does it mean to return to God with all your heart? Think about one thing you can change this Lent to be closer to God."),
        (2, '"Create in me a pure heart, O God, and renew a steadfast spirit within me." - Psalm 51:10',
         "A Clean Heart", "Ask God to help you have a clean heart today. What is one thing you want God to help you change?"),
        (3, '"Is not this the kind of fasting I have chosen: to loose the chains of injustice?" - Isaiah 58:6',
         "True Fasting", "Fasting isn't just about food. What habit can you give up to focus more on helping others?"),
        (4, '"When you pray, go into your room and pray to your Father, who is unseen." - Matthew 6:6',
         "Secret Prayer", "Find a quiet spot today to talk to God. What would you like to tell Him?"),
        (5, '"Come near to God and He will come near to you." - James 4:8',
         "Drawing Near", "How can you spend extra time with God today? Write about a time you felt close to Him."),
        (6, '"Bear one another\'s burdens, and so fulfill the law of Christ." - Galatians 6:2',
         "Helping Others", "Who needs your help today? Write about how you can be a helper and light for someone."),
        (7, '"The Lord is my shepherd; I shall not want." - Psalm 23:1',
         "God Provides", "God takes care of us like a shepherd cares for sheep. What are you thankful for today?"),
    ]

    for day_num, verse, theme, prompt in devotionals:
        pdf.page_devotional_journal(day_num, verse, theme, prompt)

    # Pages 11-14: Coloring Pages
    coloring_pages = [
        ("The Cross of Christ", "Color this cross and remember Jesus' love for you", "cross"),
        ("The Dove of Peace", "The dove represents the Holy Spirit and God's peace", "dove"),
        ("Light of the World", "Jesus said 'I am the Light of the World'", "candle"),
        ("Hands in Prayer", "Draw the light around the praying hands", "praying_hands"),
    ]
    for title, desc, symbol in coloring_pages:
        pdf.page_coloring_page(title, desc, symbol)

    # Page 15: Acts of Kindness Cards
    pdf.page_kindness_cards()

    # Page 16: Kindness Tracker
    pdf.page_kindness_tracker()

    # Page 17: Lenten Promises
    pdf.page_lenten_promises()

    # Page 18: Scripture Memory Verse Cards
    pdf.page_scripture_cards()

    # Page 19: Holy Week Journey
    pdf.page_holy_week()

    # Page 20: Easter Reflection
    pdf.page_easter_reflection()

    output_path = os.path.join(OUTPUT_DIR, "40_Days_of_Lent_Activity_Bundle.pdf")
    pdf.output(output_path)
    print(f"PDF created: {output_path}")
    print(f"Total pages: {pdf.page}")
    return output_path


if __name__ == "__main__":
    create_lent_bundle()
