# Grievance Redressal & Maintenance Tracker — Backend

Flask + SQLite backend for the Campus Grievance Tracker (Track 3, Problem #3).

## Setup

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Server runs at: `http://localhost:5000`
Health check: `GET http://localhost:5000/api/health`

## Environment Variables

Copy `.env.example` to `.env` and adjust values if needed. A working `.env` with
dev defaults is already included for hackathon convenience — change the secrets
before any real deployment.

## Roles & Blocks

There are three roles now:

- **student** — raises grievances, picks one of four **blocks** when submitting:
  `Health`, `Maintenance`, `Academic`, `Personal`.
- **admin** — manages exactly one block. Chosen at registration (`department`
  field), and can only update the status of issues assigned to them.
- **superadmin** — sees every query across every block and is the *only* role
  that can assign a query to a specific admin. There should be exactly one
  (or a small number). **Super Admin accounts cannot be created through
  `/register`** — they're seeded automatically on server startup (see
  `_ensure_default_superadmin()` in `app.py`, or run `seed_superadmin.py`
  directly). Configure the seeded credentials via `SUPERADMIN_NAME`,
  `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` in `.env`.

Default Super Admin (from `.env.example`): `superadmin@fixora.edu` / `ChangeMe@123`
— change this immediately for anything beyond local demo use.

## API Overview

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/register` | Register a **student** or **admin** (admin must include `department`, one of the 4 blocks). `superadmin` is rejected here. |
| POST | `/api/login` | Login, returns JWT access_token |

### Issues (require `Authorization: Bearer <token>` header)
| Method | Route | Description |
|---|---|---|
| POST | `/api/issues` | Create issue (JSON or multipart with `attachment`). `category` = the block: `Health`/`Maintenance`/`Academic`/`Personal`. |
| GET | `/api/issues` | List issues (own for student, all for admin/superadmin). Filters: `?status=` `?category=` |
| GET | `/api/issues/<id>` | Issue detail + status log history |
| PUT | `/api/issues/<id>/status` | Update status (superadmin, or the assigned admin only) |

### Super Admin only
| Method | Route | Description |
|---|---|---|
| PUT | `/api/issues/<id>/assign` | Assign a query to a specific admin (`{"assigned_to": <admin_user_id>}`) |
| GET | `/api/admins` | List every admin account, grouped by block, with open-issue counts |
| POST | `/api/admins` | Create a new admin account directly for a given block |

### Admin & Super Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/issues/escalated` | List all overdue/escalated issues |
| GET | `/api/staff` | List all admin/superadmin users (optional `?department=Health` filter) |
| GET | `/api/stats` | Dashboard counts (status + category/block breakdown) |
| GET | `/api/blocks` | List the 4 valid blocks (any authenticated user) |

## Sample: Register + Login

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aman","email":"aman@vitbhopal.ac.in","password":"test123","role":"student"}'

curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aman@vitbhopal.ac.in","password":"test123"}'
```

Copy the `access_token` from the login response and use it as:
`Authorization: Bearer <access_token>` in subsequent requests.

## Sample: Create an Issue

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Fan not working","description":"Hostel A room 204 fan broken","category":"Maintenance"}'
```

## SLA / Auto-Escalation

Every `GET /api/issues`, `/api/issues/<id>`, `/api/issues/escalated`, and
`/api/stats` call automatically scans for overdue issues and flips their status
to `escalated`. `SLA_HOURS` (default 24) controls the deadline window, set per
issue at creation time.

## Folder Structure

```
backend/
├── app.py
├── config.py
├── seed_superadmin.py   # (re)create/reset the Super Admin account manually
├── models/        # User, Issue, StatusLog
├── routes/        # auth, issues, admin blueprints
├── utils/         # auth decorator, file upload, SLA checker
├── static/uploads/
└── database/app.db (auto-created on first run)
```
