# Gmail OAuth2 Setup Guide

## Overview

The Gmail integration enables the Executive Life OS to:
- Fetch email threads and metadata
- Identify recruiter emails
- Track messages needing responses
- Auto-generate todos for recruiter followups

This is a **manual setup** process using Google Cloud Console. The setup is one-time and takes ~10 minutes.

---

## Prerequisites

- Active Gmail account
- Access to Google Cloud Console (https://console.cloud.google.com)
- Localhost server running on `127.0.0.1:3000`

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Name it: `executive-life-os` (or similar)
5. Click **CREATE**
6. Wait for project creation to complete

---

## Step 2: Enable Gmail API

1. In the Google Cloud Console, search for **Gmail API** in the search bar
2. Click on the Gmail API result
3. Click **ENABLE**
4. Wait for it to finish enabling

---

## Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar, click **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Choose **OAuth client ID**
4. If prompted about consent screen, click **CONFIGURE CONSENT SCREEN**

### Configure Consent Screen (if needed):

1. Choose **External** user type
2. Click **CREATE**
3. Fill in the form:
   - **App name**: `Executive Life OS`
   - **User support email**: Your Gmail address
   - **Developer contact**: Your Gmail address
4. Click **SAVE AND CONTINUE** on each page
5. On the summary, click **BACK TO DASHBOARD**

### Create OAuth Client ID:

1. Back on **Credentials** page, click **+ CREATE CREDENTIALS** again
2. Choose **OAuth client ID**
3. Select **Desktop application** as the application type
4. Name it: `life-os-desktop`
5. Click **CREATE**
6. In the dialog that appears, click **COPY** for both:
   - **Client ID**
   - **Client Secret**
7. Save these somewhere safe (you'll paste them into `.env` next)

---

## Step 4: Get Refresh Token

The refresh token requires a manual OAuth flow. Follow this process:

1. In your `.env` file, add (using your copied values):
   ```env
   GMAIL_CLIENT_ID=<your-client-id>
   GMAIL_CLIENT_SECRET=<your-client-secret>
   GMAIL_REDIRECT_URI=http://localhost:3000/auth/gmail/callback
   ```

2. Restart the server:
   ```bash
   npm start
   ```

3. Open a browser and navigate to:
   ```
   http://127.0.0.1:3000/auth/gmail
   ```

4. You'll be redirected to Google's login. Sign in with your Gmail account.

5. Grant permission when prompted ("Executive Life OS wants to access your Gmail")

6. You'll be redirected back to `localhost:3000` with an authorization code

7. The server will exchange this for a refresh token and save it to `.env`

8. In your `.env`, you should now see:
   ```env
   GMAIL_REFRESH_TOKEN=<your-refresh-token>
   ```

---

## Step 5: Verify Configuration

Restart the server and check the logs:

```bash
npm start
```

In the console output, you should see:
```
✓ Gmail service configured and ready
```

---

## Testing Gmail Sync

Once configured, Gmail data will sync automatically at 6:15 AM (via cron job).

To manually trigger a sync:

```bash
curl http://127.0.0.1:3000/api/sync?service=gmail
```

Expected response:
```json
{
  "success": true,
  "recordsProcessed": 42,
  "note": "Gmail threads synced"
}
```

---

## Troubleshooting

### "Gmail service not configured"
- Check that `GMAIL_REFRESH_TOKEN` is set in `.env`
- Restart the server after adding it

### "Invalid refresh token"
- The token may have expired (after 6 months of non-use)
- Delete `GMAIL_REFRESH_TOKEN` from `.env` and repeat Step 4

### "Client authentication failed"
- Verify `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` are correct
- Check they have no extra spaces

### Rate Limiting
- Gmail API has a quota of 250 requests per minute
- Daily limit: 10M requests per day
- The service is designed to respect these limits

---

## How It Works

Once configured:

1. **Sync Job** (6:15 AM daily):
   - Uses refresh token to get access token
   - Fetches threads from Gmail API
   - Parses sender email to identify recruiters
   - Checks for unread/flagged status
   - Stores in `gmail_threads` table

2. **Auto-Todos**:
   - Recruiter emails tagged as `needs_response=1` automatically create todos
   - Todo priority: 2 (high)
   - Source: `auto`

3. **Dashboard Display**:
   - Shows unread recruiter count
   - Lists threads requiring response
   - Contributes to "Inbox Load" score in executive scoring

---

## Revoking Access

To remove Gmail access:

1. Visit: https://myaccount.google.com/permissions
2. Find "Executive Life OS"
3. Click it and select **Remove Access**
4. Delete `GMAIL_REFRESH_TOKEN` from your `.env`
5. Restart the server

---

## Privacy Notes

- Tokens are stored in `.env` (not in git — already in .gitignore)
- Gmail data is stored locally in SQLite (not sent to any server)
- Sync is read-only (Life OS doesn't send/compose emails)
- You can revoke access anytime

---

## Implementation Status

**Currently**: Stub implementation
- ✓ Configuration checking
- ✓ Sync state tracking
- ⏳ Full OAuth flow (awaiting token setup)
- ⏳ Thread fetching
- ⏳ Recruiter identification
- ⏳ Response tracking

Once `GMAIL_REFRESH_TOKEN` is set, uncomment the fetch logic in `services/gmailService.js` to enable full functionality.
