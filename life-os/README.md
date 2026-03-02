# Executive Life OS 3.0

Local-only executive life operating system. Node.js backend, SQLite database, automated scoring, and data-driven dashboard.

## Quick Start

```bash
cd life-os
npm install
cp .env.example .env    # Edit with your tokens
npm run init-db          # Create SQLite database
npm run migrate-finance  # Import transaction data
npm start                # Start server on 127.0.0.1:3000
```

Open http://127.0.0.1:3000/dashboard/ in your browser.

## Architecture

```
Express (localhost:3000) → SQLite (WAL mode) → JSON files → Dashboard (fetch)
                         ↑
              Cron jobs sync external data every morning
```

### Data Flow
1. **Cron jobs** run at scheduled times (6:00-7:00 AM daily)
2. **Services** sync data from APIs (Oura, Gmail) and local sources (iMessage, desktop)
3. **Scoring engine** calculates 6-domain executive score (0-100)
4. **Brief generator** produces JSON files in `public/data/`
5. **Dashboard** consumes JSON via `fetch()` — zero embedded data

## Features

| Domain | Description |
|--------|-------------|
| **Executive Score** | 6-domain weighted composite (Financial 30%, Career 25%, Health 15%, Inbox 10%, Relationships 10%, System 10%) |
| **Finance** | Burn rate, runway, anomaly detection, shared expense tracking |
| **Career** | Dual-axis job scoring (priority + interview probability), 4-tier pipeline |
| **Health** | Oura Ring integration (sleep, readiness, activity) |
| **Messages** | iMessage thread monitoring, unanswered alerts |
| **Todos** | Auto-generated from 5 trigger types with deduplication |

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `HOST` | Bind address (default: 127.0.0.1) |
| `DASHBOARD_PASSWORD` | Optional password gate |

### Optional Integrations

| Variable | Description | Setup Guide |
|----------|-------------|-------------|
| `OURA_ACCESS_TOKEN` | Oura Ring v2 API token | [Oura Developer Portal](https://cloud.ouraring.com/personal-access-tokens) |
| `GMAIL_*` | Gmail OAuth credentials | See `docs/GMAIL_SETUP.md` |
| `IMESSAGE_DB_PATH` | Path to chat.db | Requires Full Disk Access in System Settings → Privacy |

## Cron Schedule

| Time | Job | Description |
|------|-----|-------------|
| 6:00 AM | Health Sync | Pull Oura Ring data |
| 6:15 AM | Gmail Sync | Sync inbox threads |
| 6:30 AM | iMessage Sync | Parse message threads |
| 6:45 AM | Finance Check | Run anomaly detection |
| 7:00 AM | Executive Brief | Generate scores + brief |
| Every 4h | Job Pipeline | Refresh pipeline analytics |
| 2:00 AM | Backup | Database + data files backup |

## API Endpoints

### Finance
- `GET /api/finance/transactions?owner=michelle&category=Food`
- `POST /api/finance/transactions`
- `GET /api/finance/burn-rate?months=3`
- `GET /api/finance/runway`
- `GET /api/finance/categories`
- `GET /api/finance/shared-summary`
- `GET /api/finance/budget`

### Career
- `GET /api/jobs?tier=1&status=active`
- `POST /api/jobs`
- `GET /api/jobs/analytics`
- `PATCH /api/jobs/:id/status`

### Score
- `GET /api/score/latest`
- `GET /api/score/history?days=30`

### Todos
- `GET /api/todos?status=pending`
- `PATCH /api/todos/:id`
- `POST /api/todos/generate`

### Sync
- `GET /api/sync/status`
- `POST /api/sync/trigger`

## Scripts

```bash
npm start              # Start production server
npm run dev            # Start with --watch (auto-restart)
npm run init-db        # Initialize database schema
npm run migrate-finance # Import finance data from HTML
npm run backup         # Manual backup
npm test               # Run test suite
```

## Security

- Server binds to `127.0.0.1` only — not accessible from network
- Optional password gate via `DASHBOARD_PASSWORD`
- SQL injection protected (named parameters only)
- Input validation on all POST routes
- Rate limiting on API endpoints
- No external dependencies for dashboard (self-contained HTML)

## File Structure

```
life-os/
├── server.js              # Express server + cron init
├── config/
│   ├── database.js        # SQLite singleton (WAL mode)
│   └── logger.js          # Winston with file rotation
├── database/
│   └── init.sql           # 14-table schema
├── services/              # Business logic layer
│   ├── financeService.js
│   ├── scoringService.js
│   ├── jobScoringService.js
│   ├── anomalyService.js
│   ├── todoAutomationService.js
│   ├── ouraService.js
│   ├── gmailService.js
│   ├── imessageService.js
│   ├── jobService.js
│   ├── contactsService.js
│   └── fileWatcherService.js
├── routes/                # Express API routes
├── jobs/                  # Cron job implementations
│   ├── scheduler.js
│   ├── generateExecutiveBrief.js
│   ├── generateDashboardData.js
│   └── backupJob.js
├── scripts/               # One-time setup scripts
├── public/
│   ├── dashboard/index.html  # Unified dashboard (69KB)
│   └── data/*.json           # Generated data files
├── utils/
│   └── retry.js           # Exponential backoff utility
├── test/
├── docs/
│   └── GMAIL_SETUP.md
└── backups/
```
