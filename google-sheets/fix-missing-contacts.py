#!/usr/bin/env python3
"""
Fix missing wedding contacts — adds the 10 entries skipped due to apostrophes.
Adds them to the existing spreadsheet (reads spreadsheet_id from config.json).
"""

import json
import re
import sys
from pathlib import Path

try:
    import gspread
    from google.oauth2.credentials import Credentials
except ImportError:
    print("Missing dependencies. Run: pip install gspread google-auth")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
CONFIG_FILE = SCRIPT_DIR / "config.json"
TOKEN_FILE = SCRIPT_DIR / "token.json"
DASHBOARD_HTML = PROJECT_ROOT / "dashboard.html"


def extract_all_contacts():
    """Parse wedding contacts WITHOUT the broken apostrophe replacement."""
    html = DASHBOARD_HTML.read_text(encoding='utf-8')
    match = re.search(r'let giftData\s*=\s*\[(.*?)\];', html, re.DOTALL)
    if not match:
        print("ERROR: Could not find giftData in dashboard.html")
        return []

    raw = match.group(1).strip()
    contacts = []
    skipped = []

    for obj_match in re.finditer(r'\{[^}]+\}', raw):
        obj_str = obj_match.group(0)
        try:
            # Try as-is first (data uses double quotes already)
            contact = json.loads(obj_str)
            contacts.append(contact)
        except json.JSONDecodeError:
            try:
                # Only fix trailing commas, don't touch apostrophes
                cleaned = re.sub(r',\s*}', '}', obj_str)
                contact = json.loads(cleaned)
                contacts.append(contact)
            except json.JSONDecodeError as e:
                skipped.append((obj_str[:80], str(e)[:60]))

    print(f"  Parsed {len(contacts)} contacts total")
    if skipped:
        print(f"  Still skipping {len(skipped)} entries:")
        for s, e in skipped:
            print(f"    {s}  →  {e}")
    return contacts


def get_sheet():
    config = json.loads(CONFIG_FILE.read_text())
    creds = Credentials.from_authorized_user_file(str(TOKEN_FILE))
    gc = gspread.authorize(creds)
    return gc.open_by_key(config['spreadsheet_id'])


def parse_address(addr):
    city, state, zip_code, street = '', '', '', addr
    if addr:
        parts = [p.strip() for p in addr.split(',')]
        if len(parts) >= 3:
            state_zip = parts[-1].strip().split()
            if len(state_zip) >= 2:
                state = state_zip[0]
                zip_code = ' '.join(state_zip[1:])
                city = parts[-2].strip()
                street = parts[0]
    return street, city, state, zip_code


def main():
    print("=" * 50)
    print("  Fix Missing Wedding Contacts")
    print("=" * 50)

    print("\n1. Parsing contacts with fixed logic...")
    all_contacts = extract_all_contacts()

    print("\n2. Connecting to Google Sheet...")
    sh = get_sheet()
    ws = sh.worksheet("Contacts & Wedding")

    # Get existing names to avoid duplicates
    existing = ws.get_all_values()
    existing_names = set()
    if len(existing) > 1:
        for row in existing[1:]:
            if row and row[0]:
                existing_names.add(row[0].strip().lower())

    print(f"   Sheet has {len(existing_names)} existing contacts")

    # Find the missing ones
    new_rows = []
    for c in all_contacts:
        name = c.get('name', '').strip()
        if not name:
            continue
        if name.lower() in existing_names:
            continue  # Already in sheet

        street, city, state, zip_code = parse_address(c.get('address', ''))
        ty_text = c.get('ty', '')
        ty_status = "Written" if ty_text else ("Not Started" if c.get('gift') else "")

        new_rows.append([
            name,
            c.get('relation', '').title(),
            street,
            city,
            state,
            zip_code,
            '', '', '',  # Phone, Email, Birthday
            c.get('gift', ''),
            c.get('value', 0),
            ty_text[:100] if ty_text else '',
            ty_status,
            '', 'Yes', ''
        ])

    if not new_rows:
        print("\nNo missing contacts found — sheet is already complete!")
        return

    print(f"\n3. Adding {len(new_rows)} missing contacts:")
    for row in new_rows:
        print(f"   + {row[0]}")

    start_row = len(existing) + 1
    ws.update(range_name=f'A{start_row}', values=new_rows)
    print(f"\nDone! Added {len(new_rows)} contacts to row {start_row}+")


if __name__ == '__main__':
    main()
