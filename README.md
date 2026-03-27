# 📚 Pustak Tracker — Library Management System

A full-stack library management system with a **web-based librarian dashboard** and a **Flutter mobile app** for library users.

## 📂 Project Structure

```
├── backend/        Flask backend (serves both web UI and mobile API)
├── frontend/       Librarian web UI (HTML/CSS/JS, served by Flask)
├── mobile_app/     Flutter app for library users (Android)
└── README.md
```

## 🚀 Quick Start

### Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The backend runs on **port 5000** and serves:
- Librarian web interface at `https://localhost:5000`
- Mobile API at `https://localhost:5000/api/`

### Mobile App (Flutter)

```bash
cd mobile_app
flutter pub get
flutter run
```

> Update `lib/core/config/api_config.dart` with your machine's IP address.

## 🗄️ Database

Uses **MySQL** — database `pustak_tracker` on `localhost`.

Configure credentials in `backend/.env`:
```
DATABASE_URL=mysql+mysqlconnector://root:password@localhost/pustak_tracker
```

## 👤 Default Credentials

| Role | Email | Password |
|---|---|---|
| Librarian | librarian@pustak.com | admin123 |
| User | john@example.com | password123 |
