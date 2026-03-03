#!/usr/bin/env python3
"""
Michelle's Life Dashboard — Data Migration Script
Creates a Google Sheet with 8 tabs and imports existing data from:
- dashboard.html (100+ wedding contacts)
- transactions CSV (950+ financial transactions)

Prerequisites:
    pip install gspread google-auth google-auth-oauthlib

Setup:
    1. Go to https://console.cloud.google.com/
    2. Create a project (or use existing)
    3. Enable Google Sheets API and Google Drive API
    4. Create OAuth 2.0 credentials (Desktop app)
    5. Download credentials.json to this directory
    6. Run this script — it will open a browser for auth on first run
"""

import json
import re
import csv
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    import gspread
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install gspread google-auth google-auth-oauthlib")
    sys.exit(1)

# ─── Configuration ───────────────────────────────────────────────────────────

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]
SPREADSHEET_NAME = "Michelle's Life Dashboard"
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
CREDENTIALS_FILE = SCRIPT_DIR / "credentials.json"
TOKEN_FILE = SCRIPT_DIR / "token.json"

# Source data paths
DASHBOARD_HTML = PROJECT_ROOT / "dashboard.html"
TRANSACTIONS_CSV = PROJECT_ROOT / "SHELZYS LIFE PORTAL" / "Finances" / "Gray vs. Michelle 2.24.26" / "transactions (11).csv"


# ─── Google Auth ─────────────────────────────────────────────────────────────

def get_google_client():
    """Authenticate and return a gspread client."""
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_FILE.exists():
                print(f"\nERROR: credentials.json not found at {CREDENTIALS_FILE}")
                print("Download it from Google Cloud Console (OAuth 2.0 Desktop credentials)")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)

        TOKEN_FILE.write_text(creds.to_json())

    return gspread.authorize(creds)


# ─── Data Extraction ─────────────────────────────────────────────────────────

def extract_wedding_contacts():
    """Parse wedding guest data from dashboard.html JavaScript array."""
    if not DASHBOARD_HTML.exists():
        print(f"WARNING: {DASHBOARD_HTML} not found, skipping contact migration")
        return []

    html = DASHBOARD_HTML.read_text(encoding='utf-8')

    # Extract the giftData array from JavaScript
    match = re.search(r'let giftData\s*=\s*\[(.*?)\];', html, re.DOTALL)
    if not match:
        print("WARNING: Could not find giftData in dashboard.html")
        return []

    raw = match.group(1).strip()

    # Parse each JSON object in the array
    contacts = []
    for obj_match in re.finditer(r'\{[^}]+\}', raw):
        try:
            obj_str = obj_match.group(0)
            # Fix potential issues: single quotes, trailing commas
            obj_str = obj_str.replace("'", '"')
            contact = json.loads(obj_str)
            contacts.append(contact)
        except json.JSONDecodeError:
            # Try with more aggressive cleanup
            try:
                cleaned = re.sub(r',\s*}', '}', obj_str)
                contact = json.loads(cleaned)
                contacts.append(contact)
            except json.JSONDecodeError as e:
                print(f"  Skipping malformed entry: {str(e)[:60]}")

    print(f"  Extracted {len(contacts)} wedding contacts")
    return contacts


def extract_transactions():
    """Read transactions from CSV file."""
    if not TRANSACTIONS_CSV.exists():
        print(f"WARNING: {TRANSACTIONS_CSV} not found, skipping transaction migration")
        return [], []

    rows = []
    with open(TRANSACTIONS_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        for row in reader:
            rows.append(row)

    print(f"  Extracted {len(rows)} transactions")
    return headers, rows


# ─── Sheet Creation ──────────────────────────────────────────────────────────

def create_dashboard(gc):
    """Create the main spreadsheet with all 8 tabs."""
    print(f"\nCreating spreadsheet: {SPREADSHEET_NAME}")
    sh = gc.create(SPREADSHEET_NAME)
    print(f"  Created: {sh.url}")

    # Rename default sheet to Dashboard
    ws = sh.sheet1
    ws.update_title("Dashboard")

    # Create remaining tabs
    tab_names = [
        "Finances",
        "Job Search",
        "Contacts & Wedding",
        "Calendar & Birthdays",
        "Inbox & Email",
        "To-Do & Reminders",
        "Messages to Reply"
    ]

    for name in tab_names:
        sh.add_worksheet(title=name, rows=1000, cols=20)
        print(f"  Created tab: {name}")

    return sh


def setup_dashboard_tab(sh):
    """Set up the Dashboard summary tab."""
    ws = sh.worksheet("Dashboard")

    header_rows = [
        ["MICHELLE'S LIFE DASHBOARD", "", "", "", "", "Last Updated:", datetime.now().strftime("%B %d, %Y %I:%M %p")],
        [],
        ["AREA", "STATUS", "COUNT", "NOTES"],
        ["Finances", "=COUNTA('Finances'!A:A)-1 & \" transactions\"", "", "See Finances tab"],
        ["Job Search", "=COUNTA('Job Search'!A:A)-1 & \" entries\"", "", "See Job Search tab"],
        ["Contacts", "=COUNTA('Contacts & Wedding'!A:A)-1 & \" people\"", "", "See Contacts & Wedding tab"],
        ["Calendar", "=COUNTA('Calendar & Birthdays'!A:A)-1 & \" events\"", "", "See Calendar & Birthdays tab"],
        ["Inbox", "=COUNTA('Inbox & Email'!A:A)-1 & \" emails\"", "", "See Inbox & Email tab"],
        ["To-Do", "=COUNTA('To-Do & Reminders'!A:A)-1 & \" tasks\"", "", "See To-Do & Reminders tab"],
        ["Messages", "=COUNTA('Messages to Reply'!A:A)-1 & \" messages\"", "", "See Messages to Reply tab"],
        [],
        ["QUICK STATS"],
        ["Total Gift Value", "=SUM('Contacts & Wedding'!K:K)", "", "From wedding tracker"],
        ["Thank You Notes Sent", "=COUNTIF('Contacts & Wedding'!M:M,\"Sent\")", "", ""],
        ["Thank You Notes Pending", "=COUNTIF('Contacts & Wedding'!M:M,\"Not Started\")+COUNTIF('Contacts & Wedding'!M:M,\"\")", "", ""],
        [],
        ["FINANCE SUMMARY"],
        ["Total Spending (All)", "=SUMPRODUCT(('Finances'!C2:C1000>0)*'Finances'!C2:C1000)", "", "Positive amounts = spending"],
        ["Total Income", "=SUMPRODUCT(('Finances'!C2:C1000<0)*'Finances'!C2:C1000)*-1", "", "Negative amounts = income"],
    ]

    ws.update(range_name='A1', values=header_rows)

    # Bold header formatting
    ws.format('A1', {'textFormat': {'bold': True, 'fontSize': 16}})
    ws.format('A3:D3', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.95}})
    ws.format('A12', {'textFormat': {'bold': True, 'fontSize': 12}})
    ws.format('A17', {'textFormat': {'bold': True, 'fontSize': 12}})

    print("  Set up Dashboard tab")


def setup_finances_tab(sh, headers, transactions):
    """Set up Finances tab with transaction data."""
    ws = sh.worksheet("Finances")

    # Use the CSV headers, mapping to cleaner names
    sheet_headers = ["Date", "Description", "Amount", "Status", "Category", "Parent Category",
                     "Excluded", "Tags", "Type", "Account", "Account Mask", "Note", "Recurring"]

    all_rows = [sheet_headers]
    for row in transactions:
        # Pad short rows
        while len(row) < len(sheet_headers):
            row.append("")
        all_rows.append(row[:len(sheet_headers)])

    # Write in batches (Google Sheets API has limits)
    batch_size = 500
    for i in range(0, len(all_rows), batch_size):
        batch = all_rows[i:i + batch_size]
        start_row = i + 1
        ws.update(range_name=f'A{start_row}', values=batch)
        print(f"  Wrote transactions batch {i // batch_size + 1} ({len(batch)} rows)")

    # Header formatting
    ws.format('A1:M1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.95}})
    ws.freeze(rows=1)

    print(f"  Set up Finances tab with {len(transactions)} transactions")


def setup_job_search_tab(sh):
    """Set up Job Search tab (populated by Apps Script from Gmail)."""
    ws = sh.worksheet("Job Search")

    headers = [["Date", "Company", "Role", "Source", "Status", "Contact", "Salary Range", "Notes", "Email Link"]]
    ws.update(range_name='A1', values=headers)

    # Data validation for Status column
    ws.format('A1:I1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.9, 'green': 0.95, 'blue': 0.9}})
    ws.freeze(rows=1)

    # Add a sample row showing format
    sample = [["", "", "", "Gmail / Manual", "Applied / Interview / Offer / Rejected / Ghosted", "", "", "Auto-populated by Apps Script 'Scan Job Emails' or enter manually", ""]]
    ws.update(range_name='A2', values=sample)
    ws.format('A2:I2', {'textFormat': {'italic': True, 'foregroundColor': {'red': 0.6, 'green': 0.6, 'blue': 0.6}}})

    print("  Set up Job Search tab")


def setup_contacts_tab(sh, contacts):
    """Set up Contacts & Wedding tab with migrated data."""
    ws = sh.worksheet("Contacts & Wedding")

    headers = ["Name", "Relation", "Address", "City", "State", "Zip", "Phone", "Email",
               "Birthday", "Gift Received", "Gift Value", "Thank You Note",
               "Thank You Status", "Christmas Card", "Wedding Invite Sent", "Notes"]

    all_rows = [headers]

    for c in contacts:
        # Parse address into components
        addr = c.get('address', '')
        city, state, zip_code = '', '', ''

        if addr:
            # Try to parse "Street, City, ST ZIP" format
            parts = [p.strip() for p in addr.split(',')]
            if len(parts) >= 3:
                street = ', '.join(parts[:-1])  # Everything before last part
                last_part = parts[-1].strip()
                # Last part is usually "State ZIP"
                state_zip = last_part.split()
                if len(state_zip) >= 2:
                    state = state_zip[0]
                    zip_code = ' '.join(state_zip[1:])
                    city = parts[-2].strip() if len(parts) >= 3 else ''
                    street = parts[0] if len(parts) >= 3 else addr
                else:
                    street = addr
            else:
                street = addr
        else:
            street = ''

        # Determine thank you status from 'ty' field
        ty_text = c.get('ty', '')
        if ty_text:
            ty_status = "Written"  # Has a thank you note drafted
        elif c.get('gift', ''):
            ty_status = "Not Started"  # Has a gift but no note
        else:
            ty_status = ""  # No gift, no note needed

        row = [
            c.get('name', ''),
            c.get('relation', '').title(),
            street if 'street' in dir() else addr,
            city,
            state,
            zip_code,
            '',  # Phone (not in current data)
            '',  # Email (not in current data)
            '',  # Birthday (not in current data)
            c.get('gift', ''),
            c.get('value', 0),
            ty_text[:100] if ty_text else '',  # Truncated thank you note text
            ty_status,
            '',  # Christmas card
            'Yes',  # Wedding invite sent (they're in the list)
            ''   # Notes
        ]
        all_rows.append(row)

    ws.update(range_name='A1', values=all_rows)

    # Formatting
    ws.format('A1:P1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.95, 'green': 0.9, 'blue': 0.95}})
    ws.freeze(rows=1)

    # Format Gift Value as currency
    ws.format(f'K2:K{len(all_rows)}', {'numberFormat': {'type': 'CURRENCY', 'pattern': '$#,##0.00'}})

    print(f"  Set up Contacts & Wedding tab with {len(contacts)} entries")


def setup_calendar_tab(sh):
    """Set up Calendar & Birthdays tab (populated by Apps Script)."""
    ws = sh.worksheet("Calendar & Birthdays")

    headers = [["Date", "Event", "Start Time", "End Time", "Location", "Type", "Calendar", "Notes"]]
    ws.update(range_name='A1', values=headers)

    ws.format('A1:H1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.95, 'green': 0.95, 'blue': 0.85}})
    ws.freeze(rows=1)

    sample = [["", "", "", "", "", "Event / Birthday / Anniversary", "", "Auto-populated by Apps Script 'Sync Calendar'"]]
    ws.update(range_name='A2', values=sample)
    ws.format('A2:H2', {'textFormat': {'italic': True, 'foregroundColor': {'red': 0.6, 'green': 0.6, 'blue': 0.6}}})

    print("  Set up Calendar & Birthdays tab")


def setup_inbox_tab(sh):
    """Set up Inbox & Email tab (populated by Apps Script from Gmail)."""
    ws = sh.worksheet("Inbox & Email")

    headers = [["Date", "From", "Subject", "Snippet", "Labels", "Starred", "Read", "Category", "Thread Link"]]
    ws.update(range_name='A1', values=headers)

    ws.format('A1:I1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.85, 'green': 0.92, 'blue': 0.97}})
    ws.freeze(rows=1)

    sample = [["", "", "", "", "", "Yes/No", "Yes/No", "Job / Finance / Personal / Other", "Auto-populated by Apps Script 'Refresh Inbox'"]]
    ws.update(range_name='A2', values=sample)
    ws.format('A2:I2', {'textFormat': {'italic': True, 'foregroundColor': {'red': 0.6, 'green': 0.6, 'blue': 0.6}}})

    print("  Set up Inbox & Email tab")


def setup_todo_tab(sh):
    """Set up To-Do & Reminders tab."""
    ws = sh.worksheet("To-Do & Reminders")

    headers = [["Task", "Due Date", "Priority", "List", "Status", "Source", "Created", "Notes"]]
    ws.update(range_name='A1', values=headers)

    ws.format('A1:H1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.9, 'green': 0.95, 'blue': 0.9}})
    ws.freeze(rows=1)

    sample = [["", "", "High / Medium / Low", "", "Pending / Done", "Manual / Apple Reminders", "", "Synced via Mac script or enter manually"]]
    ws.update(range_name='A2', values=sample)
    ws.format('A2:H2', {'textFormat': {'italic': True, 'foregroundColor': {'red': 0.6, 'green': 0.6, 'blue': 0.6}}})

    print("  Set up To-Do & Reminders tab")


def setup_messages_tab(sh):
    """Set up Messages to Reply tab."""
    ws = sh.worksheet("Messages to Reply")

    headers = [["Date", "From", "Phone", "Preview", "Status", "Replied Date", "Notes"]]
    ws.update(range_name='A1', values=headers)

    ws.format('A1:G1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.97, 'green': 0.9, 'blue': 0.85}})
    ws.freeze(rows=1)

    sample = [["", "", "", "", "Need to Reply / Replied / Ignore", "", "Synced via Mac script"]]
    ws.update(range_name='A2', values=sample)
    ws.format('A2:G2', {'textFormat': {'italic': True, 'foregroundColor': {'red': 0.6, 'green': 0.6, 'blue': 0.6}}})

    print("  Set up Messages to Reply tab")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Michelle's Life Dashboard — Migration Script")
    print("=" * 60)

    # Extract data from existing files
    print("\n1. Extracting existing data...")
    contacts = extract_wedding_contacts()
    tx_headers, transactions = extract_transactions()

    # Authenticate with Google
    print("\n2. Authenticating with Google...")
    gc = get_google_client()
    print("  Authenticated successfully")

    # Create the spreadsheet
    print("\n3. Creating spreadsheet and tabs...")
    sh = create_dashboard(gc)

    # Set up each tab
    print("\n4. Setting up tabs...")
    setup_dashboard_tab(sh)
    setup_finances_tab(sh, tx_headers, transactions)
    setup_job_search_tab(sh)
    setup_contacts_tab(sh, contacts)
    setup_calendar_tab(sh)
    setup_inbox_tab(sh)
    setup_todo_tab(sh)
    setup_messages_tab(sh)

    # Share with Michelle's account
    print("\n5. Done!")
    print(f"\n   Spreadsheet URL: {sh.url}")
    print(f"   Spreadsheet ID: {sh.id}")
    print(f"\n   Next steps:")
    print(f"   1. Open the spreadsheet in Google Sheets")
    print(f"   2. Go to Extensions > Apps Script")
    print(f"   3. Paste the contents of life-dashboard-setup.gs")
    print(f"   4. Save and authorize the script")
    print(f"   5. Use the 'Life Dashboard' menu to sync data")

    # Save the spreadsheet ID for other scripts
    config = {
        "spreadsheet_id": sh.id,
        "spreadsheet_url": sh.url,
        "created": datetime.now().isoformat()
    }
    config_path = SCRIPT_DIR / "config.json"
    config_path.write_text(json.dumps(config, indent=2))
    print(f"\n   Saved config to {config_path}")


if __name__ == '__main__':
    main()
