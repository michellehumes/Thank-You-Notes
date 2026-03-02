# Gmail Integration Setup

This guide walks through configuring Gmail API access for the Executive Life OS dashboard. Once set up, the system will sync your inbox to surface unread counts, recruiter emails, and messages needing a response.

---

## Prerequisites

- A Google account (personal or Workspace)
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page and select **New Project**
3. Name it something like `Life OS Dashboard`
4. Click **Create**
5. Make sure the new project is selected in the dropdown

## Step 2: Enable the Gmail API

1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for **Gmail API**
3. Click on it and press **Enable**

## Step 3: Configure the OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** as the user type (unless you have a Workspace org), then click **Create**
3. Fill in the required fields:
   - **App name**: Life OS Dashboard
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/gmail.readonly`
6. Click **Save and Continue**
7. On the **Test users** page, click **Add Users** and enter your Gmail address
8. Click **Save and Continue**, then **Back to Dashboard**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Set **Application type** to **Web application**
4. Name it `Life OS Local`
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/gmail/callback
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret** — you will need both

## Step 5: Obtain a Refresh Token

The easiest way to get an initial refresh token is via the Google OAuth Playground.

### Option A: OAuth Playground

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (top right) and check **Use your own OAuth credentials**
3. Enter your **Client ID** and **Client Secret**
4. In the left panel under **Step 1**, find **Gmail API v1** and select:
   - `https://www.googleapis.com/auth/gmail.readonly`
5. Click **Authorize APIs** and sign in with your Google account
6. On the consent screen, click **Continue**
7. In **Step 2**, click **Exchange authorization code for tokens**
8. Copy the **Refresh token** from the response

### Option B: One-Time Script

If you prefer a local script, you can run a simple Node.js OAuth flow. The server already has a callback route stub at `/auth/gmail/callback` that will be implemented in a future phase.

## Step 6: Add Credentials to .env

Open your `.env` file in the `life-os` directory and add:

```env
GMAIL_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret-here
GMAIL_REFRESH_TOKEN=your-refresh-token-here
```

Make sure `.env` is in your `.gitignore` (it should be already).

## Step 7: Test the Integration

Start the server and trigger a sync:

```bash
cd life-os
npm start
```

Then in another terminal:

```bash
curl http://127.0.0.1:3000/api/sync
```

Or use the **Sync Now** button on the dashboard.

You should see a log line like:

```
[INFO] Gmail sync: X threads updated
```

If credentials are missing, you will see:

```
[WARN] Gmail not configured — see docs/GMAIL_SETUP.md
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Gmail not configured` warning | Ensure all three env vars are set in `.env` |
| `invalid_grant` error | Your refresh token expired. Repeat Step 5 to get a new one |
| `access_denied` error | Make sure your email is added as a test user in Step 3 |
| No recruiter emails detected | The classifier looks for patterns like `@greenhouse.io`, `@lever.co`, `talent@`, `recruiting@`. More patterns will be added over time |

---

## Security Notes

- The refresh token grants read-only access to your Gmail. It cannot send, delete, or modify emails.
- Credentials are stored only in your local `.env` file and are never committed to version control.
- The OAuth consent screen is in "Testing" mode, so only test users you explicitly add can authorize.
