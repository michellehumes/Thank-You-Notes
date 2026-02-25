# Perkins Life Hub

Production-grade executive life dashboard for Michelle and Gray Perkins.

## Architecture

```
perkins-life-hub/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.jsx        # Sidebar + main layout
│   │   ├── KpiStrip.jsx      # Top KPI metrics strip
│   │   ├── AlertBanner.jsx   # Alert notifications
│   │   ├── StatusBadge.jsx   # Status indicators
│   │   ├── DataTable.jsx     # Sortable data table
│   │   └── Card.jsx          # Card container
│   ├── pages/            # Route pages
│   │   ├── DashboardPage.jsx     # Main overview
│   │   ├── CalendarPage.jsx      # Calendar with event management
│   │   ├── FinancePage.jsx       # Accounts, bills, charts
│   │   ├── HealthPage.jsx        # Health compliance tracker
│   │   ├── MaintenancePage.jsx   # Home/vehicle maintenance
│   │   ├── DocumentsPage.jsx     # Document vault (Drive-ready)
│   │   ├── BusinessPage.jsx      # Shelzy's Designs metrics
│   │   └── SettingsPage.jsx      # Integration management
│   ├── integrations/     # External API connectors
│   │   ├── googleAuth.js     # OAuth 2.0 token management
│   │   ├── googleCalendar.js # Calendar CRUD + auto-categorize
│   │   ├── googleDrive.js    # File listing + doc categorization
│   │   ├── gmail.js          # Email scanning + auto-detection
│   │   ├── plaid.js          # Banking data + tx categorization
│   │   └── etsy.js           # Shop orders, listings, metrics
│   ├── services/         # Core logic engines
│   │   ├── recurringEngine.js    # Cadence calculation + status
│   │   ├── forecastEngine.js     # Cash flow, retirement, what-if
│   │   ├── attributionEngine.js  # Payer attribution + fairness
│   │   └── complianceEngine.js   # Health/maintenance alerts
│   ├── hooks/            # React hooks
│   │   ├── useDataEngine.js      # Central data state manager
│   │   ├── useLocalStorage.js    # Persistent local storage
│   │   └── useIntegrations.js    # Integration status tracking
│   └── data/             # Configuration and sample data
│       ├── config.json       # App configuration
│       ├── cadenceRules.json # Health/maintenance cadence rules
│       ├── categories.json   # Category definitions
│       └── sampleData.json   # Realistic sample data
```

## Quick Start

```bash
cd perkins-life-hub
npm install
npm run dev
```

Open http://localhost:5173

## Integrations Setup

### 1. Google Calendar / Drive / Gmail

1. Go to console.cloud.google.com
2. Create a project, enable Calendar, Drive, and Gmail APIs
3. Create OAuth 2.0 credentials (Web application type)
4. Add `http://localhost:5173/auth/callback` as authorized redirect URI
5. Copy credentials to `.env`:

```
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
```

### 2. Plaid (Banking)

1. Sign up at dashboard.plaid.com
2. Get API credentials
3. Add to `.env`:

```
VITE_PLAID_CLIENT_ID=your_client_id
VITE_PLAID_SECRET=your_secret
VITE_PLAID_ENV=sandbox
```

Note: Production Plaid requires a backend server. The integration is architected for this.

### 3. Etsy (Shelzy's Designs)

1. Register at etsy.com/developers
2. Create an app and get API key
3. Add to `.env`:

```
VITE_ETSY_API_KEY=your_api_key
```

## Core Modules

| Module | Description |
|--------|-------------|
| Dashboard | KPI strip, alerts, upcoming events, financial snapshot |
| Calendar | Monthly view, event CRUD, auto-categorization, conflict detection |
| Finance | Net worth, savings rate, accounts, bills, cash flow charts |
| Health | Appointment compliance tracking with overdue detection |
| Maintenance | Recurring item tracker with vendor log and cost tracking |
| Documents | Google Drive-ready document vault with category indexing |
| Business | Etsy shop metrics, revenue charts, inventory tracking |
| Settings | Integration management and household configuration |

## Engines

| Engine | Purpose |
|--------|---------|
| Recurring Engine | Calculates next-due dates from configurable cadence rules |
| Forecast Engine | Cash flow projections, retirement modeling, pregnancy cost sim, what-if scenarios |
| Attribution Engine | Determines who paid for what with fairness scoring |
| Compliance Engine | Generates prioritized alerts for overdue health/maintenance items |

## Design System

- Font: Carlito (open-source Calibri metric-compatible equivalent)
- Base size: 14.67px (11pt)
- Background: White
- Palette: Neutral grayscale with muted blue for actionable states
- No neon, no visual clutter
- High-density executive layout

## Offline Mode

Works fully offline using localStorage. Sample data loads on first run. All integrations are optional and toggleable.

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- React Router 7
- Recharts (charts)
- Lucide React (icons)
- date-fns (date utilities)
