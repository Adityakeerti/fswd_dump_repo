# 📚 Pustak Tracker — Library Management System

A full-featured library management system built with **Flask**, featuring a web dashboard for librarians and a mobile-friendly barcode scanner.

---

## Project Structure

```
02_LIBRARIAN_SYSTEM/
├── run.py                      # Application entry point
├── .env                        # Environment variables (git-ignored)
├── .env.example                # Template for .env
├── requirements.txt            # Python dependencies
│
├── app/                        # Flask application package
│   ├── __init__.py             # Application factory
│   ├── config.py               # Configuration classes
│   ├── extensions.py           # Extension instances (db, jwt, csrf …)
│   ├── models.py               # SQLAlchemy models
│   ├── forms.py                # WTForms definitions
│   ├── utils.py                # Backward-compat re-exports
│   ├── seed.py                 # CLI commands & sample data
│   │
│   ├── services/               # Business logic layer
│   │   ├── book_service.py     # Issue / return books
│   │   ├── fine_service.py     # Overdue fine calculations
│   │   └── stats_service.py    # Dashboard statistics
│   │
│   └── routes/                 # HTTP route handlers
│       ├── auth.py             # Login / logout (web)
│       ├── books.py            # Book CRUD (web)
│       ├── users.py            # User CRUD (web)
│       ├── transactions.py     # Transactions & dashboard (web)
│       ├── categories.py       # Categories (web)
│       ├── scanner.py          # Barcode scanner (web)
│       ├── db_viewer.py        # Database viewer
│       │
│       └── api/                # REST API subpackage
│           ├── __init__.py     # Blueprint, schemas, serializers
│           ├── auth.py         # Auth endpoints
│           ├── books.py        # Book CRUD + reserve
│           ├── users.py        # User CRUD
│           ├── transactions.py # Issue / return / overdue
│           ├── categories.py   # Category CRUD
│           ├── scanner.py      # Mobile scanner integration
│           ├── notifications.py# User notifications
│           ├── fines.py        # Fine management
│           └── dashboard.py    # Dashboard stats
│
├── frontend/                   # Templates & static assets
│   ├── index.html              # Base template
│   ├── assets/                 # CSS, JS, images
│   └── pages/                  # Page templates
│
├── scripts/                    # Standalone utility scripts
│   ├── barcode_generator.py    # Generate barcode images
│   ├── get_ids.py              # Print book/user IDs
│   ├── view_database.py        # CLI database viewer
│   └── mobile_server_https.py  # Standalone HTTPS scanner server
│
├── cert.pem / key.pem          # SSL certificates (git-ignored)
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Initialize the database

```bash
flask init-db
```

### 4. Run the server

```bash
python run.py
```

The server will start on `https://0.0.0.0:5000` (if SSL certs are present) or HTTP otherwise.

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `flask init-db` | Seed the database with sample data |
| `flask calculate-fines` | Recalculate overdue fines and send reminders |
| `flask create-admin` | Create a new librarian account |

---

## Default Credentials

| Field | Value |
|-------|-------|
| Email | `librarian@pustak.com` |
| Password | `admin123` |

---

## Key Features

- 📖 Book management (CRUD, search, barcode scanning)
- 👥 User management (register, activate/deactivate, roles)
- 🔄 Transaction tracking (issue, return, overdue fines)
- 📊 Dashboard with real-time statistics
- 📱 Mobile barcode scanner support
- 🔐 JWT-based API authentication for mobile apps
- 📬 Notification system (overdue reminders, reservations)

---

## API Documentation

All API endpoints are prefixed with `/api`. Authentication uses JWT tokens obtained via:

- **Librarian login:** `POST /api/auth/login`
- **User login:** `POST /api/user/login`

---

## Technologies

- **Backend:** Flask, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended
- **Database:** MySQL (configurable via `DATABASE_URL`)
- **Frontend:** HTML/CSS/JS with Bootstrap
- **Mobile:** Barcode scanner via browser camera API
