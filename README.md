# QuantView AI — Intelligent Stock Analytics Platform

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Machine Learning](https://img.shields.io/badge/Machine%20Learning-XGBoost%20%2B%20SHAP-orange)](https://xgboost.readthedocs.io)
[![Database](https://img.shields.io/badge/Database-SQLite%203-003B57?logo=sqlite)](https://sqlite.org)
[![Theme](https://img.shields.io/badge/Theme-Dark%20%26%20Light-6366f1)](#)
[![Tests](https://img.shields.io/badge/Tests-144%20Passed%20(100%25)-22c55e?logo=pytest)](#-automated-testing-report)

**QuantView AI** is a modern, enterprise-grade quantitative stock research and machine learning platform engineered for equities across **Indian Markets (NSE/BSE in ₹ INR)** and **US Markets (NASDAQ/NYSE in $ USD)**.

It pairs rigorous statistical modeling—purged walk-forward cross-validation, explainable AI (SHAP), market regime classification, and institutional hysteresis benchmarking—with a modern, responsive financial technology SaaS interface.

---

## 🌐 Quick Start & Local Execution

### 1. Prerequisites
- Python 3.10+ (Python 3.10, 3.11, 3.12, or 3.14)
- Pip package manager

### 2. Install Dependencies
```bash
cd QuantView-AI
pip install -r backend/requirements.txt
```

### 3. Launch Application
```bash
python run.py
```

Open your web browser at:
- **Web Platform**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive OpenAPI Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔐 Pre-Seeded Default Accounts

QuantView AI includes pre-seeded accounts configured in its persistent SQLite store:

| Role | Username | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin@quantview.ai` | `Admin@123` | Full access to Admin Command Center, User Management, Audit Logs, and Analytics |
| **Standard User** | `trader` | `user@quantview.ai` | `User@123` | User Dashboard, Watchlist persistence, Stock Analysis, Profile & Settings |

*Note: You can also register new accounts directly from the web interface.*

---

## 🏗️ Architecture & Core System Highlights

```
QuantView-AI/
├── .env.example              # Production environment configuration template
├── README.md                 # Complete system documentation
├── run.py                    # Single-command launcher (uvicorn server & browser boot)
├── backend/                  # Fast, secure FastAPI backend
│   ├── main.py               # REST API endpoints, CORS, static SPA hosting
│   ├── database.py           # SQLite user store, PBKDF2 hashing, watchlists, audit trail
│   ├── auth.py               # HMAC-SHA256 signed JWT tokens, FastAPI RBAC dependencies
│   ├── market.py             # Multi-market ticker resolver (NSE/BSE/US), peer valuations
│   ├── engine.py             # 14-feature engineering, Wilder ATR, adaptive RSI, institutional intel
│   ├── models.py             # 3-fold purged walk-forward ML, XGBoost, PyTorch LSTM, SHAP
│   ├── backtest.py           # Walk-forward benchmark engine, hysteresis signals, 4 fee tiers
│   ├── quote_provider.py     # Multi-tier live quote provider with caching
│   ├── twelvedata.py         # Twelve Data fundamental and quote integration
│   ├── requirements.txt      # Python dependencies
│   ├── data/                 # SQLite database storage (quantview.db)
│   └── services/             # Background telemetry and valuation fallbacks
├── frontend/                 # Modular, responsive Single Page Application
│   ├── index.html            # Semantic HTML5 shell with Google Fonts
│   ├── favicon.svg           # High-resolution vector brand icon
│   ├── css/                  # Modular CSS design system
│   │   ├── variables.css     # Theme variables (Dark & Light themes)
│   │   ├── base.css          # Reset, typography, smooth scrolling, utilities
│   │   ├── layout.css        # Navbar, sidebar, main container, clean footer
│   │   ├── components.css    # Buttons, cards, badges, inputs, tables, toasts, ribbon
│   │   └── views.css         # Page-specific views (Landing, Auth, Dashboards, Analysis)
│   └── js/                   # Modern modular ES6 JavaScript architecture
│       ├── config.js         # Asset directory, glossary definitions, constants
│       ├── logos.js          # Vector SVG brand assets for stocks & ETFs
│       ├── api.js            # Unified HTTP API client with auth token injection
│       ├── auth.js           # Session state, login, register, role checks
│       ├── chart.js          # Canvas interactive crosshair stock chart engine
│       ├── router.js         # Single-Page Application hash router & route guards
│       ├── app.js            # Client bootstrapper & theme initializer
│       ├── components/       # Reusable UI components (Navbar, Sidebar, Footer, Toast)
│       └── views/            # Dedicated page controllers (Landing, Login, Register, Dashboards)
└── tests/                    # Automated testing suite (Unit, E2E, and Live HTTP tests)
```

---

## 🎨 Complete Frontend Redesign & Views

QuantView AI replaces the monolithic layout with a clean Single-Page Application (SPA):

### 1. Landing Page (`#landing`)
- **Hero Section**: Value proposition with gradient typography, live ticker ribbon, and dual call-to-actions.
- **6 Key Capabilities**: Purged Walk-Forward ML, SHAP Explainable AI, 6-Card Institutional Intelligence, Hysteresis Benchmarking, Market Regime Detection, Multi-Market Coverage.
- **How It Works**: Visual 3-step quantitative pipeline breakdown.
- **Live Preview Card**: Interactive intelligence snapshot for featured market leaders.
- **Clean Professional Footer**:
  - Brand description, Markets navigation, Platform links, Legal and regulatory disclaimers, and System status indicator.
  - **Zero Community section, Zero GitHub links, and Zero personal attribution links** as strictly required.

### 2. Login Page (`#login`)
- Glassmorphism authentication card.
- Email or Username input, password field with Show/Hide toggle.
- **Quick Demo Access Badges**: One-click fill for **Admin** (`admin` / `Admin@123`) and **Trader** (`trader` / `User@123`).
- Automatic role-based redirect (`admin` to Admin Dashboard, `user` to User Dashboard).

### 3. Registration Page (`#register`)
- Full name, username, RFC-compliant email, password with live strength meter, and password confirmation matching.
- Automatic session creation and celebratory welcome toast.

### 4. User Dashboard (`#dashboard`)
- Dynamic greeting with user role badge and active market session status.
- Live Market Overview ribbon for benchmark indices (`NIFTY 50`, `SENSEX`, `S&P 500`, `NASDAQ 100`).
- **Personal Watchlist Table**: Synchronized with backend SQLite database (`/api/user/watchlist`), with quick add and one-click remove.
- Active market movers grid and personal activity audit trail.

### 5. Stock Analysis Workbench (`#analysis`)
- Instant search bar with autocomplete suggestions for Indian & US equities and ETFs, plus quick chips (`RELIANCE`, `NVDA`, `AAPL`, `TCS`, `SPY`, `NIFTY 50`).
- **Real-Time Recommendation Verdict**: Genuine Buy/Sell/Hold verdict with ensemble probability, confidence score, and market regime diagnosis.
- **Interactive Groww-Style Canvas Chart**: Multi-timeframe selector (`1M`, `3M`, `6M`, `1Y`, `3Y`, `5Y`, `ALL`), interactive crosshairs, date and price tooltips, SMA 50 (amber) and SMA 200 (red) moving average overlays.
- **6-Card Institutional Intelligence Grid**: Analyst Consensus gauge, 12M Price Target with street high/low, Revenue Forecast, Trailing P/S Valuation, Trading Volume in shares, and Gross Profit Margin.
- **SHAP Explainable AI Waterfall**: Mathematically exact bullish (green) and bearish (red) marginal feature contributions from `shap.TreeExplainer`.
- **Strategy Benchmarking Table**: Side-by-side walk-forward strategy comparison (QuantView Hysteresis vs. Buy & Hold vs. SMA 50/200) across 4 fee tiers (0%, 0.05%, 0.10%, 0.20%).
- Verified live corporate news feed and SEC/exchange filings.

### 6. Admin Command Center (`#admin`)
- **Strict Role-Based Protection**: Normal users attempting to access `#admin` or `/api/admin/*` are rejected with HTTP 403 Forbidden.
- **System Statistics KPI Cards**: Total users, active accounts, total admins, total activities, database engine, server uptime, and cache hit metrics.
- **User Management Table**: Live tabular list of all registered users with administrative actions:
  - Toggle Active / Suspended status (`/api/admin/users/{id}/status`).
  - Upgrade or Downgrade Role between User and Admin (`/api/admin/users/{id}/role`).
  - Self-protection safeguards preventing admins from accidentally suspending or demoting their own accounts.
- **Platform Audit Trail**: Complete activity logs capturing user actions, timestamps, and IP addresses.

### 7. Profile & Settings (`#profile`)
- User summary card (ID, Username, Email, Role, Created Date, Last Login, Token Engine).
- **Appearance & Theme Selector**: Instant toggle between **Deep Space Dark** (default) and **Bright Financial Light** themes with `localStorage` persistence.
- **Cryptographic Password Change**: Current password verification and PBKDF2 hash update (`/api/auth/change-password`).
- Secure Sign Out button.

---

## 🛡️ Security & Authentication Architecture

1. **Password Hashing**:
   - `PBKDF2-HMAC-SHA256` with 100,000 iterations and a unique 16-byte cryptographically secure random hex salt per user.
   - Constant-time verification using `hmac.compare_digest` to prevent timing attacks.
2. **Cryptographic Access Tokens**:
   - URL-safe Base64 signed tokens using HMAC-SHA256 (`header.payload.signature`).
   - Configurable secret key via `QUANTVIEW_SECRET_KEY` environment variable.
   - 7-day token expiration lifetime.
3. **Role-Based Access Control (RBAC)**:
   - FastAPI dependencies: `get_current_user` and `require_admin`.
   - Admin-only endpoints (`/api/admin/users`, `/api/admin/stats`, `/api/admin/activities`) strictly reject non-admin users with HTTP 403 Forbidden.

---

## 🧪 Automated Testing Report

Every component was tested with automated test suites:

```bash
# 1. Core Mathematical & Quantitative Feature Tests
pytest tests/test_market.py tests/test_features.py tests/test_benchmark.py tests/test_leakage.py tests/test_transaction_costs.py tests/test_valuation_fallback.py -v
```
**Result**: **93 passed in 3.66s (100%)**

```bash
# 2. Comprehensive End-to-End System Tests
python tests/test_full_platform_e2e.py
```
**Result**: **34/34 passed (100%)**
- Database connectivity & schema integrity: PASSED
- Password PBKDF2 hashing & verification: PASSED
- User registration & duplicate email/username rejection: PASSED
- Admin access & Strict 403 Forbidden blocking on standard users: PASSED
- Admin account suspension & role update controls: PASSED
- Persistent Watchlist CRUD operations: PASSED
- Password change flow: PASSED
- Multi-market ticker resolution (NSE/BSE/US): PASSED
- Institutional Intelligence builder: PASSED
- SQLite audit logging: PASSED

```bash
# 3. Live HTTP Server & Frontend Verification
python tests/test_live_server_http.py
```
**Result**: **17/17 passed (100%)**
- SPA HTML served at `/`: PASSED
- Ashutosh Nayak / Community links completely absent: PASSED
- Design system CSS tokens (`/css/variables.css`): PASSED
- JavaScript bootstrapper (`/js/app.js`): PASSED
- Health check endpoint (`/api/health`): PASSED
- Market status endpoint (`/api/market-status`): PASSED
- Admin login & Bearer token authorization: PASSED
- Standard user login & Bearer token authorization: PASSED
- RBAC enforcement (Admin 200 vs Standard User 403 vs Unauthenticated 401): PASSED
- Personal Watchlist retrieval via HTTP: PASSED

**Total Executed Tests**: **144 Automated Tests — 100% Passing**

---

## 📋 Reused vs. Newly Implemented Functionality

| Component / Layer | Status | Implementation Details |
| :--- | :---: | :--- |
| **Purged Walk-Forward ML** | Preserved & Reused | 3-fold expanding cross-validation with 20-day purge embargo window (`models.py`) |
| **SHAP Explainability** | Preserved & Reused | `shap.TreeExplainer` exact mathematical feature decomposition (`models.py`) |
| **14 Quantitative Features** | Preserved & Reused | Volatility-adaptive RSI, Wilder ADX, MACD, Bollinger %B, moving averages (`engine.py`) |
| **Multi-Market Engine** | Preserved & Reused | Resolution for Indian equities (`.NS`/`.BO` in ₹) and US equities (`$` USD) (`market.py`) |
| **Multi-Tier Quotes** | Preserved & Reused | Resilient fallback across Yahoo Finance and Twelve Data API (`quote_provider.py`) |
| **Database & Auth Engine** | Preserved & Reused | SQLite 3 store, PBKDF2-HMAC-SHA256 password hashing, HMAC signed tokens (`database.py`, `auth.py`) |
| **Frontend Architecture** | **100% Newly Built** | Completely replaced 110 KB monolithic HTML with clean modular SPA (`frontend/`) |
| **Design System** | **100% Newly Built** | FinTech SaaS aesthetic: Deep navy, dark charcoal, electric blue, emerald green |
| **Theme System** | **100% Newly Built** | Dynamic theme switching between Dark (default) and Light themes |
| **Landing Page** | **100% Newly Built** | Hero, live ribbon, 6 capability cards, 3-step workflow, live preview |
| **Site Footer** | **100% Newly Built** | **Clean footer with legal & copyright; Community & personal links completely removed** |
| **Login & Register Views**| **100% Newly Built** | Dedicated card views, demo credentials badges, strength meter, validation |
| **User Dashboard** | **100% Newly Built** | Welcome header, live market ribbon, personal watchlist table, active movers, audit logs |
| **Stock Analysis Workbench**| **100% Newly Built** | Autocomplete search, Groww-style canvas chart, technical gauges, SHAP waterfall, 6-card grid |
| **Admin Command Center** | **100% Newly Built** | KPI metric cards, user management table (status/role toggles), full platform audit trail |
| **Profile & Settings** | **100% Newly Built** | Profile summary, theme selector, password change form, secure sign out |

---

## 📜 License & Disclaimers

QuantView AI is an educational and quantitative research platform. It does **not** provide financial or investment advice. Recommendations are forward-looking probabilistic research signals.

Licensed under the **MIT License**.
