# CampMondo 🏕️

A full-stack web-based Summer Camp Management System built for COE 416 – Software Engineering at the Lebanese American University.

CampMondo centralizes camper registration, attendance tracking, payment management, incident reporting, and parent–staff communication through a role-based platform serving three user roles: **Parent**, **Staff**, and **Admin**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend | Python 3 + Flask |
| Database | MySQL / MariaDB |
| Auth | Flask-JWT-Extended + bcrypt |
| Email | Flask-Mail + Gmail SMTP |
| PDF Export | FPDF2 |

---

## Project Structure

```
campmondo/
├── backend/          # Flask REST API
│   ├── run.py        # Entry point
│   ├── requirements.txt
│   ├── .env.example  # Copy this to .env and fill in your values
│   └── ...
├── frontend/         # React + Vite app
│   ├── package.json
│   └── ...
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL or MariaDB running locally

---

### 1. Database Setup

Create the database:

```sql
CREATE DATABASE campmondo;
```

Then run the schema file to create all tables:

```bash
mysql -u root -p campmondo < backend/schema.sql
```

---

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Set up your environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values — see the [Environment Variables](#environment-variables) section below for what each one means.

Run the backend:

```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the following:

```dotenv
# ── Database ────────────────────────────────────────────────
DATABASE_URL=mysql+pymysql://USER:PASSWORD@localhost:3306/campmondo
DB_USER=                    # your MySQL username
DB_PASSWORD=                # your MySQL password
DB_HOST=localhost
DB_NAME=campmondo

# ── JWT ─────────────────────────────────────────────────────
SECRET_KEY=                 # any random secret string
JWT_SECRET_KEY=             # any random secret string (used to sign tokens)
JWT_EXPIRES_MINUTES=30      # how long tokens stay valid

# ── Email (Gmail SMTP) ───────────────────────────────────────
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=              # your Gmail address
MAIL_PASSWORD=              # your Gmail App Password (not your Gmail login password)
MAIL_DEFAULT_SENDER=        # same as MAIL_USERNAME
MAIL_SUPPRESS_SEND=False    # set to True during development to skip sending emails

# ── Frontend ─────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173   # used in password-reset email links
```

> **Gmail App Password:** Go to your Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail" and paste it as `MAIL_PASSWORD`. This is not your regular Gmail password.

> **Development tip:** Set `MAIL_SUPPRESS_SEND=True` to skip actual email sending during development. Email content will be printed to the console instead.

---


## Features

### Admin
- Create and manage camp sessions with activity programs
- Assign campers to groups and staff to groups
- View and filter payment dashboard (by session, status, date range)
- Override payment status with mandatory justification note
- Generate attendance, financial, and incident reports
- Export any report as a branded PDF
- Post system-wide or targeted announcements

### Staff
- View campers assigned to their group
- Record daily check-in and check-out with timestamps
- View medical alerts and emergency contacts
- Submit daily activity logs and incident reports
- Post announcements to their group's parents

### Parent
- Register camper profiles with emergency contacts
- Browse and enroll in available sessions
- Select activity programs during enrollment
- Upload medical and consent documents
- Submit payments and view transaction history
- Receive announcements from admin and staff

### Auth
- JWT-based stateless authentication
- Account lockout after 5 failed attempts (15-minute cooldown)
- Password reset via time-limited email link
- Forced password change on first login (for staff accounts)
- Role-based access control on every route


Lebanese American University — ECE Department — COE 416 Software Engineering — Spring 2026
