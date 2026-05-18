# NGINE Modern — NCotton OS Prototype

A modern, browser-based operating system for cotton brokers and trading agents. This prototype covers the full desk-to-settlement workflow — from sale confirmations through delivery, invoicing, commission billing, and payment allocation — with a polished design system and live theme customisation built in.

---

## Overview

NCotton OS is a single-page application (SPA) that runs entirely in the browser with no build step required. It is designed to reflect real-world cotton trading workflows used in the Indian cotton exchange, and serves as a functional prototype and design reference for a full-stack platform.

**Open `NCotton.html` in any modern browser to run it.**

---

## Project Structure

```
NGINE-Modern-Prototype/
│
├── NCotton.html                  # Entry point — loads all scripts via CDN & local paths
├── app.jsx                       # App shell: routing, sidebar, topbar, command dispatcher
├── styles.css                    # Design system — CSS custom properties, layout, components
│
├── lib/                          # Shared utilities and UI primitives
│   ├── ui.jsx                    # Core UI components: Field, Input, DatePicker, Badge, Sparkline
│   ├── icons.jsx                 # Inline SVG icon library (~40 icons)
│   ├── data.jsx                  # Sample/demo data fixtures
│   ├── cmdk.jsx                  # Cmd+K command palette
│   ├── avatars.jsx               # User avatar picker
│   ├── table-filters.jsx         # Table controls: sort, filter, column visibility
│   └── tweaks-panel.jsx          # Live theme / density / font customiser
│
└── screens/                      # Feature modules (one file per screen)
    ├── dashboard.jsx             # Analytics dashboard with KPIs and charts
    ├── sale-confirmation.jsx     # Cotton trade entry form
    ├── delivery-invoices.jsx     # Delivery records and invoice management
    ├── payment.jsx               # Payment recording and allocation
    ├── commission.jsx            # Commission invoice generation
    ├── commission-receipts.jsx   # Commission payment tracking
    ├── sub-broker-ledger.jsx     # Sub-broker accounting and settlements
    ├── masters.jsx               # Party master data (buyers, sellers, stations, varieties)
    ├── buyer.jsx                 # Individual buyer form
    ├── delivery.jsx              # Delivery entry form
    ├── cr-dr-notes.jsx           # Credit / Debit notes
    ├── allowances.jsx            # Trade allowances and discounts
    ├── millweight.jsx            # Millweight verification and tracking
    ├── gst-receipt.jsx           # GST certificate receipts
    ├── charity-cheque.jsx        # Charity cheque processing
    ├── advance-payment.jsx       # Advance payment management
    └── company-settings.jsx      # Multi-company workspace configuration
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18.3.1 (via CDN) |
| JSX Compilation | Babel Standalone (in-browser) |
| Styling | Custom CSS with CSS Custom Properties |
| Icons | Hand-drawn inline SVG (no icon font) |
| Data Persistence | `localStorage` (no backend) |
| Dev Server | VS Code Live Server (port 5501) |
| Build Step | None |

The app uses no bundler, no npm install, and no compilation pipeline. React and Babel are loaded from CDN. All screen modules are loaded as `<script type="text/babel">` tags in `NCotton.html`.

---

## Features

### Sales Workflow

| Screen | Purpose |
|---|---|
| Sale Confirmation | Create and manage cotton purchase orders — bales, candy rate, buyer/seller, variety, station |
| Delivery & Invoices | Record shipments, generate invoices, track net weights and transit status |
| Payments | Allocate buyer and seller payments against invoices with balance tracking |
| CR/DR Notes | Issue credit and debit notes against existing invoices |
| Advance Payments | Manage pre-delivery advances |
| Allowances | Record trade allowances and discounts per confirmation |
| Millweight | Log and verify mill-processed weights post-delivery |
| GST Receipts | Generate GST-compliant receipt certificates |
| Charity Cheque | Process charitable donations tied to trade transactions |

### Commission Workflow

| Screen | Purpose |
|---|---|
| Commission Invoices | Bill broker commissions separately to buyers and sellers |
| Commission Receipts | Track collection of commission payments |
| Sub-broker Ledger | Manage sub-broker commissions and end-of-period settlements |

### Masters & Configuration

| Screen | Purpose |
|---|---|
| Masters | Manage buyers, sellers, stations, cotton varieties, and payment terms |
| Buyer Form | Add or edit individual buyer records with GST, KYC, and commission rate |
| Company Settings | Create and switch between multiple company workspaces (multi-tenant) |

### Dashboard

- KPI cards: confirmation count, open/closed/invoiced pipeline, outstanding amounts
- Visual deal pipeline with stage colour coding
- Commission summary (donut-style breakdown: collected / partial / unpaid)
- Top buyer AR aging table
- Recent confirmations quick-access table
- Activity feed
- 60-day candy-rate price sparkline
- Seasonal arrivals and inventory sparkbars

---

## User Experience

### Command Palette (Cmd+K)
Quick navigation to any screen and quick-add actions: new confirmation, delivery, payment, or buyer. Activated with `Ctrl+K` / `Cmd+K`.

### Tweaks Panel
Live customisation without reloading:
- **Theme:** Light / Dark
- **Accent colour:** Graphite, Indigo, Emerald, Amber, Rose
- **Density:** Comfortable (36px rows) / Compact (30px rows)
- **Font:** Inter, SF Pro, IBM Plex Sans
- **Sidebar:** Expand / Collapse

### Multi-company Workspace
Switch between company workspaces from the sidebar. Each company has its own GST number, PAN, address, and fiscal year configuration.

### Table Controls
Every data table supports column visibility toggles, multi-column sorting, and inline filters.

---

## Design System

All design tokens are defined as CSS custom properties in `styles.css` and are toggled via `data-*` attributes on the root element.

### Colour Tokens

```
--color-text-1    Primary text
--color-text-2    Secondary text
--color-text-3    Tertiary / placeholder text
--color-text-4    Disabled text
--color-surface   Page background
--color-border    Default border
--color-positive  Success / credit
--color-negative  Error / debit
--color-warn      Warning
--color-info      Informational
```

### Elevation

```
--shadow-sm   Subtle card lift
--shadow-md   Modal and dropdown depth
--shadow-lg   Overlay / command palette
```

### Border Radius

```
--radius-sm   4px
--radius-md   8px
--radius-lg   12px
```

### Typography

- **Primary:** Inter (UI text and labels)
- **Monospace:** JetBrains Mono (numeric data, codes)
- **Alternates:** SF Pro Display, IBM Plex Sans (switchable via Tweaks panel)

---

## Data Model

All data is stored in `localStorage` under the following keys:

| Key | Contents |
|---|---|
| `ngine_confirmations` | Sale confirmation records |
| `ngine_deliveries` | Delivery and shipment records |
| `ngine_invoices` | Sales invoices |
| `ngine_commissions` | Commission invoice records |
| `ngine_companies` | Company workspace configurations |

Sample and demo fixtures are defined in `lib/data.jsx` and pre-populate the app on first load.

---

## Architecture Notes

### No Build Step
React and Babel are loaded from CDN. `NCotton.html` includes all screen scripts as `type="text/babel"`. This makes the prototype instantly runnable without any toolchain setup — open the file and it works.

### Global Module Pattern
Shared libraries (`window.UI`, `window.NCData`, `window.TableFilters`, `window.Icons`) are attached to `window` so that screen modules loaded in separate `<script>` tags can consume them without imports.

### Routing
All routing is handled in `app.jsx` via a `route.name` switch. Navigation is dispatched through `handleCmd()`, which also handles quick-add actions from the command palette.

### Persistence
`useTweaks` hook manages theme, density, font, avatar, and active company in `localStorage`. Screen-level data is read and written directly via `localStorage` within each screen component.

### Error Boundary
An `ErrorBoundary` component wraps the app shell and renders a styled fallback UI if a screen throws during render.

---

## Getting Started

1. Clone or download this repository.
2. Open `NCotton.html` in a modern browser (Chrome, Edge, or Firefox).
3. The app loads with demo data pre-populated.

For live-reload during development, install the **Live Server** extension in VS Code and click **Go Live** — the app will be served on `http://localhost:5501`.

No npm, no install, no build.

---

## File Reference

| File | Size | Role |
|---|---|---|
| [NCotton.html](NCotton.html) | Entry | HTML shell, CDN imports, script loader |
| [app.jsx](app.jsx) | 31 KB | Routing, sidebar, topbar, command dispatcher |
| [styles.css](styles.css) | 26 KB | Full design system |
| [lib/ui.jsx](lib/ui.jsx) | — | Field, Input, DatePicker, Sparkline, Badge |
| [lib/icons.jsx](lib/icons.jsx) | — | Inline SVG icon set |
| [lib/data.jsx](lib/data.jsx) | — | Demo data fixtures |
| [lib/cmdk.jsx](lib/cmdk.jsx) | — | Command palette |
| [lib/avatars.jsx](lib/avatars.jsx) | — | Avatar picker |
| [lib/table-filters.jsx](lib/table-filters.jsx) | — | Table sort/filter/columns hook |
| [lib/tweaks-panel.jsx](lib/tweaks-panel.jsx) | — | Live theme customiser |
| [screens/dashboard.jsx](screens/dashboard.jsx) | 36 KB | Analytics dashboard |
| [screens/sale-confirmation.jsx](screens/sale-confirmation.jsx) | 34 KB | Sale entry form |
| [screens/delivery-invoices.jsx](screens/delivery-invoices.jsx) | 83 KB | Delivery and invoice management |
| [screens/payment.jsx](screens/payment.jsx) | 55 KB | Payment recording and allocation |
| [screens/commission.jsx](screens/commission.jsx) | 52 KB | Commission invoicing |
| [screens/commission-receipts.jsx](screens/commission-receipts.jsx) | 31 KB | Commission receipt tracking |
| [screens/sub-broker-ledger.jsx](screens/sub-broker-ledger.jsx) | 35 KB | Sub-broker ledger |
| [screens/masters.jsx](screens/masters.jsx) | 44 KB | Party master data |
| [screens/buyer.jsx](screens/buyer.jsx) | 25 KB | Buyer form |
| [screens/delivery.jsx](screens/delivery.jsx) | 18 KB | Delivery form |
| [screens/cr-dr-notes.jsx](screens/cr-dr-notes.jsx) | 33 KB | Credit / Debit notes |
| [screens/allowances.jsx](screens/allowances.jsx) | 33 KB | Allowances management |
| [screens/millweight.jsx](screens/millweight.jsx) | 30 KB | Millweight tracking |
| [screens/gst-receipt.jsx](screens/gst-receipt.jsx) | 29 KB | GST receipt certificates |
| [screens/charity-cheque.jsx](screens/charity-cheque.jsx) | 24 KB | Charity cheque processing |
| [screens/advance-payment.jsx](screens/advance-payment.jsx) | 20 KB | Advance payment management |
| [screens/company-settings.jsx](screens/company-settings.jsx) | 16 KB | Company workspace CRUD |

---

## Status

This is a **functional prototype** with realistic sample data. All GST numbers, PAN numbers, and contact details in the demo fixtures are fictitious and for testing only.

- Desktop-first layout (minimum 1280px recommended)
- No backend — all data lives in `localStorage`
- Single initial commit; under active development
