# CampMondo merged project

This project uses `CampMondo-main-.zip` as the base project and applies the updated staff dashboard files from `CampMondo-staff-dashboard-final.zip`.

## What was merged/fixed

- Updated staff frontend pages:
  - `frontend/src/pages/staff/StaffDashboard.jsx`
  - `frontend/src/pages/staff/Attendance.jsx`
  - `frontend/src/pages/staff/IncidentReport.jsx`
  - `frontend/src/pages/staff/ActivityLog.jsx`
- Preserved the main project parent pages, including `frontend/src/pages/parents/Sessions.jsx`.
- Preserved the main project parent/admin backend routes instead of overwriting them with older staff ZIP versions.
- Added staff backend compatibility endpoints used by the new staff dashboard:
  - `/api/staff/dashboard-stats`
  - `/api/staff/recent-activity`
  - `/api/staff/currently-inside`
  - `/api/staff/checkin`
  - `/api/staff/checkout`
  - `/api/staff/activity-log`
- Kept staff routes JWT-protected instead of using the staff ZIP's unsafe unauthenticated routes.
- Replaced staff frontend raw `fetch()` calls with the existing Axios client so the JWT token is sent automatically.
- Fixed the route mismatch between `/staff/activity` and `/staff/activity-log`.
- Added `frontend/src/components/Navbar.jsx` alias so imports work on case-sensitive systems.
- Added frontend dependencies required by the staff dashboard: `xlsx` and `file-saver`.
- Cleaned generated/secrets folders from the final ZIP: `.env`, `node_modules`, `dist`, `__pycache__`, and `.pyc` files.
- Added `backend/.env.example`.

## Verified

- Backend Python syntax compiles successfully with `python -m compileall`.
- Flask app factory imports successfully after installing backend requirements.
- Frontend production build succeeds with `npm run build`.

## Run locally

Backend:

```bash
cd backend
python -m pip install -r requirements.txt
copy .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
python run.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

You still need a valid MySQL database/user matching your `backend/.env`. If MySQL credentials are wrong, the code is fine but the backend will still fail at database connection time.
