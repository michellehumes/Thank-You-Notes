# Michelle's Life Dashboard — Setup Guide

A Google Sheets-powered life dashboard with automated data from Gmail, Google Calendar, Google Contacts, iMessage, and Apple Reminders.

## What You Get

| Tab | Data Source | Auto-Sync |
|-----|------------|-----------|
| **Dashboard** | Summary of all tabs | Formulas |
| **Finances** | Your 950+ transactions | Migrated from CSV |
| **Job Search** | Gmail scan | Apps Script (daily) |
| **Contacts & Wedding** | 119 wedding guests + Google Contacts | Apps Script |
| **Calendar & Birthdays** | Google Calendar | Apps Script (weekly) |
| **Inbox & Email** | Gmail | Apps Script (daily) |
| **To-Do & Reminders** | Apple Reminders | Mac script |
| **Messages to Reply** | iMessage | Mac script |

---

## Setup (Step by Step)

### Step 1: Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
   - Application type: **Desktop app**
   - Name: "Life Dashboard"
5. Click **Download JSON** and save as `credentials.json` in this `google-sheets/` directory

### Step 2: Install Python Dependencies

```bash
pip install gspread google-auth google-auth-oauthlib
```

### Step 3: Run the Migration Script

```bash
cd google-sheets
python3 migrate-data.py
```

This will:
- Open a browser window for Google auth (first time only)
- Create the Google Sheet with all 8 tabs
- Import your 119 wedding contacts
- Import your 950+ financial transactions
- Print the spreadsheet URL

### Step 4: Install Apps Script

1. Open the spreadsheet in Google Sheets
2. Go to **Extensions > Apps Script**
3. Delete any existing code in `Code.gs`
4. Copy-paste the entire contents of `life-dashboard-setup.gs`
5. Click **Save** (floppy disk icon)
6. Close Apps Script editor
7. **Refresh the Google Sheet** — you'll see a "Life Dashboard" menu appear

### Step 5: Authorize Apps Script

1. Click **Life Dashboard > Refresh All**
2. Google will ask you to authorize — click through the prompts:
   - "This app isn't verified" → Advanced → Go to Life Dashboard
   - Grant access to Gmail, Calendar, Contacts
3. Wait 30-60 seconds for data to populate

### Step 6: Enable People API (for Contacts)

1. In the Apps Script editor, click **Services** (+ icon on the left)
2. Search for **People API** and click **Add**
3. Run "Sync Contacts" again

### Step 7: Set Up Auto-Refresh

Click **Life Dashboard > Set Up Auto-Refresh (Daily)** to enable:
- Inbox refresh: Every day at 8 AM
- Job search scan: Every day at 9 AM
- Calendar sync: Every Monday at 8 AM

---

## Mac Scripts (iMessage & Reminders)

### iMessage Sync

```bash
python3 sync-imessage.py
```

**First time:** macOS will ask for permission to access Messages database.
- Go to **System Settings > Privacy & Security > Full Disk Access**
- Add **Terminal** (or iTerm2)

### Apple Reminders Sync

```bash
python3 sync-reminders.py
```

**First time:** macOS will ask for permission to control Reminders app. Click "OK".

### Schedule Automatic Sync (Optional)

Run both scripts daily at 8 AM:

```bash
crontab -e
```

Add these lines:
```
0 8 * * * /usr/bin/python3 /path/to/google-sheets/sync-imessage.py
5 8 * * * /usr/bin/python3 /path/to/google-sheets/sync-reminders.py
```

---

## File Reference

| File | Purpose |
|------|---------|
| `migrate-data.py` | Creates the Google Sheet and imports existing data |
| `life-dashboard-setup.gs` | Apps Script code (paste into Google Sheets) |
| `sync-imessage.py` | Mac script to sync unreplied iMessages |
| `sync-reminders.py` | Mac script to sync Apple Reminders |
| `credentials.json` | Your Google Cloud OAuth credentials (you create this) |
| `token.json` | Auto-generated auth token (after first run) |
| `config.json` | Auto-generated spreadsheet ID (after migration) |

---

## Troubleshooting

**"credentials.json not found"**
→ Download OAuth credentials from Google Cloud Console (Step 1)

**"unable to open database file" (iMessage)**
→ Grant Full Disk Access to Terminal in System Settings

**Apps Script: "People API not enabled"**
→ Add People API in Apps Script editor under Services

**"This app isn't verified" warning**
→ This is normal for personal scripts. Click Advanced → Go to Life Dashboard

**Contacts not syncing**
→ Make sure People API service is added in Apps Script editor
