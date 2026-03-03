#!/usr/bin/env python3
"""
Apple Reminders Sync Script — Pushes incomplete reminders to Google Sheet.

Uses AppleScript to read from Apple Reminders app and updates the
"To-Do & Reminders" tab in the Life Dashboard.

Prerequisites:
    pip install gspread google-auth

Setup:
    1. Run migrate-data.py first (creates the sheet + config.json)
    2. Run this script: python3 sync-reminders.py
    3. Grant access when macOS asks to control Reminders app

Schedule (optional):
    crontab -e
    Add: 0 8 * * * /usr/bin/python3 /path/to/sync-reminders.py
"""

import json
import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime

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
TAB_NAME = "To-Do & Reminders"


# ─── Apple Reminders ─────────────────────────────────────────────────────────

def activate_reminders():
    """Launch and activate Reminders so it's ready for AppleScript queries."""
    print("  Activating Reminders app...")
    subprocess.run(
        ['osascript', '-e', 'tell application "Reminders" to activate'],
        capture_output=True, text=True, timeout=10
    )
    time.sleep(2)  # Give app a moment to fully load


def get_reminders():
    """Read incomplete reminders from Apple Reminders using AppleScript."""

    # Make sure Reminders is running before we query it
    activate_reminders()

    script = '''
    set output to ""
    tell application "Reminders"
        set allLists to every list
        repeat with aList in allLists
            set listName to name of aList
            set incompleteReminders to (every reminder of aList whose completed is false)
            repeat with aReminder in incompleteReminders
                set reminderName to name of aReminder

                -- Get body/notes safely (body can be missing value)
                set reminderBody to ""
                try
                    set rb to body of aReminder
                    if rb is not missing value then set reminderBody to rb
                end try

                -- Get due date if exists
                set dueStr to "none"
                try
                    set dueDate to due date of aReminder
                    if dueDate is not missing value then
                        set dueStr to (month of dueDate as integer) & "/" & (day of dueDate) & "/" & (year of dueDate)
                    end if
                end try

                -- Get priority
                set priNum to priority of aReminder
                if priNum is 0 then
                    set priStr to "None"
                else if priNum ≤ 4 then
                    set priStr to "High"
                else if priNum ≤ 6 then
                    set priStr to "Medium"
                else
                    set priStr to "Low"
                end if

                -- Get creation date
                set createStr to "none"
                try
                    set createDate to creation date of aReminder
                    if createDate is not missing value then
                        set createStr to (month of createDate as integer) & "/" & (day of createDate) & "/" & (year of createDate)
                    end if
                end try

                -- Build delimited row
                set output to output & reminderName & "|||" & dueStr & "|||" & priStr & "|||" & listName & "|||" & createStr & "|||" & reminderBody & "\\n"
            end repeat
        end repeat
    end tell
    return output
    '''

    try:
        result = subprocess.run(
            ['osascript', '-e', script],
            capture_output=True, text=True, timeout=90  # Up from 30s
        )

        if result.returncode != 0:
            print(f"  AppleScript error: {result.stderr}")
            return []

        output = result.stdout.strip()
        if not output:
            print("  No incomplete reminders found")
            return []

        reminders = []
        for line in output.split('\\n'):
            line = line.strip()
            if not line:
                continue

            parts = line.split('|||')
            if len(parts) < 5:
                continue

            task = parts[0].strip()
            due_date = parts[1].strip() if parts[1].strip() != 'none' else ''
            priority = parts[2].strip()
            list_name = parts[3].strip()
            created = parts[4].strip() if parts[4].strip() != 'none' else ''
            notes = parts[5].strip() if len(parts) > 5 else ''

            # Clean up "missing value" strings from AppleScript
            if notes == 'missing value':
                notes = ''

            reminders.append({
                'task': task,
                'due_date': due_date,
                'priority': priority if priority != 'None' else '',
                'list': list_name,
                'status': 'Pending',
                'source': 'Apple Reminders',
                'created': created,
                'notes': notes
            })

        print(f"  Found {len(reminders)} incomplete reminders")
        return reminders

    except subprocess.TimeoutExpired:
        print("  ERROR: AppleScript timed out after 90s.")
        print("  Try opening the Reminders app manually first, then re-run this script.")
        return []
    except Exception as e:
        print(f"  ERROR: {e}")
        return []


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


def sync_to_sheet(reminders):
    """Push reminders to the Google Sheet, preserving manual entries."""
    sh = get_sheet()
    ws = sh.worksheet(TAB_NAME)

    # Get existing data to preserve manual entries
    existing = ws.get_all_values()
    manual_rows = []

    if len(existing) > 1:
        for row in existing[1:]:  # Skip header
            source = row[5] if len(row) > 5 else ''
            if source != 'Apple Reminders':
                manual_rows.append(row)

    # Clear all data rows
    last_row = len(existing)
    if last_row > 1:
        ws.batch_clear([f'A2:H{last_row + 10}'])

    # Remove placeholder row if present
    if len(existing) > 1:
        cell_e2 = existing[1][4] if len(existing[1]) > 4 else ''
        if 'Pending' in str(cell_e2) and 'Done' in str(cell_e2):
            pass  # Already clearing everything above

    # Build rows: Apple Reminders first, then manual entries
    all_rows = []

    for r in reminders:
        all_rows.append([
            r['task'],
            r['due_date'],
            r['priority'],
            r['list'],
            r['status'],
            r['source'],
            r['created'],
            r['notes']
        ])

    # Re-add manual entries
    for row in manual_rows:
        while len(row) < 8:
            row.append('')
        all_rows.append(row[:8])

    if all_rows:
        ws.update(range_name='A2', values=all_rows)

    print(f"  Synced {len(reminders)} reminders + preserved {len(manual_rows)} manual entries")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  Apple Reminders Sync → Google Sheets")
    print("=" * 50)

    print("\n1. Reading Apple Reminders...")
    reminders = get_reminders()

    print("\n2. Syncing to Google Sheet...")
    sync_to_sheet(reminders)

    print("\nDone!")


if __name__ == '__main__':
    main()
