#!/usr/bin/env python3
"""
iMessage Sync Script — Finds unreplied messages and pushes to Google Sheet.

Reads from macOS iMessage database (~/Library/Messages/chat.db)
and updates the "Messages to Reply" tab in the Life Dashboard.

Prerequisites:
    pip install gspread google-auth

Setup:
    1. Grant Full Disk Access to Terminal/iTerm:
       System Settings > Privacy & Security > Full Disk Access > add Terminal
    2. Run migrate-data.py first (creates the sheet + config.json)
    3. Run this script: python3 sync-imessage.py

Schedule (optional):
    crontab -e
    Add: 0 8 * * * /usr/bin/python3 /path/to/sync-imessage.py
"""

import sqlite3
import json
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime, timedelta

try:
    import gspread
    from google.oauth2.credentials import Credentials
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install gspread google-auth")
    sys.exit(1)

# ─── Configuration ───────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "config.json"
TOKEN_FILE = SCRIPT_DIR / "token.json"
IMESSAGE_DB = Path.home() / "Library" / "Messages" / "chat.db"
DAYS_BACK = 7  # Look at messages from the last 7 days
TAB_NAME = "Messages to Reply"


# ─── iMessage Database ───────────────────────────────────────────────────────

def get_unreplied_messages():
    """
    Query the iMessage database for conversations where the last message
    was received (not sent by you) in the last N days.
    """
    if not IMESSAGE_DB.exists():
        print(f"ERROR: iMessage database not found at {IMESSAGE_DB}")
        print("Make sure you're running this on a Mac with Messages app.")
        return []

    try:
        conn = sqlite3.connect(str(IMESSAGE_DB))
        cursor = conn.cursor()

        # macOS stores dates as "Apple Cocoa Core Data" timestamp
        # (seconds since 2001-01-01, stored in nanoseconds since ~macOS 10.13)
        # We need to convert from Unix epoch to Apple epoch
        apple_epoch_offset = 978307200  # seconds between 1970-01-01 and 2001-01-01
        cutoff_unix = (datetime.now() - timedelta(days=DAYS_BACK)).timestamp()
        cutoff_apple_ns = int((cutoff_unix - apple_epoch_offset) * 1_000_000_000)

        query = """
        SELECT
            h.id AS phone_or_email,
            h.uncanonicalized_id,
            m.text,
            m.date,
            m.is_from_me,
            m.date AS msg_date
        FROM message m
        JOIN handle h ON m.handle_id = h.ROWID
        WHERE m.date > ?
        ORDER BY h.id, m.date DESC
        """

        cursor.execute(query, (cutoff_apple_ns,))
        rows = cursor.fetchall()
        conn.close()

        # Group by conversation (phone/email) and find unreplied ones
        conversations = {}
        for phone, uncanonicalized, text, date, is_from_me, msg_date in rows:
            if phone not in conversations:
                conversations[phone] = {
                    'phone': phone,
                    'uncanonicalized': uncanonicalized or phone,
                    'latest_text': text,
                    'latest_date': date,
                    'latest_is_from_me': is_from_me,
                    'messages': []
                }
            conversations[phone]['messages'].append({
                'text': text,
                'date': date,
                'is_from_me': is_from_me
            })

        # Filter: only conversations where the most recent message is FROM someone else
        unreplied = []
        for phone, conv in conversations.items():
            # Find the most recent message
            most_recent = conv['messages'][0]  # Already sorted DESC
            if most_recent['is_from_me'] == 0 and most_recent['text']:
                # Convert Apple timestamp to readable date
                apple_ts = most_recent['date']
                if apple_ts > 1_000_000_000_000:  # Nanoseconds
                    unix_ts = (apple_ts / 1_000_000_000) + apple_epoch_offset
                else:  # Seconds
                    unix_ts = apple_ts + apple_epoch_offset
                msg_date = datetime.fromtimestamp(unix_ts)

                # Try to resolve contact name
                contact_name = resolve_contact_name(phone)

                unreplied.append({
                    'date': msg_date.strftime('%m/%d/%Y'),
                    'from': contact_name,
                    'phone': phone,
                    'preview': (most_recent['text'] or '')[:200],
                    'status': 'Need to Reply',
                })

        print(f"  Found {len(unreplied)} unreplied conversations (last {DAYS_BACK} days)")
        return unreplied

    except sqlite3.OperationalError as e:
        if 'unable to open database file' in str(e) or 'not authorized' in str(e):
            print(f"ERROR: Cannot access iMessage database.")
            print("Grant Full Disk Access to Terminal:")
            print("  System Settings > Privacy & Security > Full Disk Access > add Terminal")
        else:
            print(f"ERROR: SQLite error: {e}")
        return []


def resolve_contact_name(phone_or_email):
    """Try to resolve a phone number/email to a contact name using AppleScript."""
    try:
        script = f'''
        tell application "Contacts"
            set matchedPeople to (every person whose value of phones contains "{phone_or_email}")
            if (count of matchedPeople) > 0 then
                return name of item 1 of matchedPeople
            else
                set matchedPeople to (every person whose value of emails contains "{phone_or_email}")
                if (count of matchedPeople) > 0 then
                    return name of item 1 of matchedPeople
                end if
            end if
            return "{phone_or_email}"
        end tell
        '''
        result = subprocess.run(
            ['osascript', '-e', script],
            capture_output=True, text=True, timeout=5
        )
        name = result.stdout.strip()
        return name if name else phone_or_email
    except (subprocess.TimeoutExpired, Exception):
        return phone_or_email


# ─── Google Sheets ───────────────────────────────────────────────────────────

def get_sheet():
    """Connect to the Life Dashboard Google Sheet."""
    if not CONFIG_FILE.exists():
        print(f"ERROR: {CONFIG_FILE} not found. Run migrate-data.py first.")
        sys.exit(1)

    if not TOKEN_FILE.exists():
        print(f"ERROR: {TOKEN_FILE} not found. Run migrate-data.py first.")
        sys.exit(1)

    config = json.loads(CONFIG_FILE.read_text())
    creds = Credentials.from_authorized_user_file(str(TOKEN_FILE))
    gc = gspread.authorize(creds)

    return gc.open_by_key(config['spreadsheet_id'])


def sync_to_sheet(messages):
    """Push unreplied messages to the Google Sheet."""
    sh = get_sheet()
    ws = sh.worksheet(TAB_NAME)

    # Clear existing data (keep header)
    last_row = len(ws.get_all_values())
    if last_row > 1:
        ws.batch_clear([f'A2:G{last_row}'])

    if not messages:
        print("  No unreplied messages to sync.")
        return

    # Remove placeholder row if present
    cell_e2 = ws.acell('E2').value
    if cell_e2 and 'Need to Reply' in str(cell_e2) and 'Replied' in str(cell_e2):
        ws.delete_rows(2)

    rows = []
    for msg in messages:
        rows.append([
            msg['date'],
            msg['from'],
            msg['phone'],
            msg['preview'],
            msg['status'],
            '',  # Replied date
            ''   # Notes
        ])

    if rows:
        ws.update(range_name='A2', values=rows)

    print(f"  Synced {len(rows)} unreplied messages to sheet")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  iMessage Sync → Google Sheets")
    print("=" * 50)

    print("\n1. Reading iMessage database...")
    messages = get_unreplied_messages()

    if messages:
        print("\n2. Syncing to Google Sheet...")
        sync_to_sheet(messages)
    else:
        print("\n  No unreplied messages found (or unable to access database)")

    print("\nDone!")


if __name__ == '__main__':
    main()
