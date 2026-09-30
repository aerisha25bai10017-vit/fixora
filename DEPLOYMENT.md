# 🚀 Deploying FIXora to Render

This repository is pre-configured for deployment on [Render](https://render.com).

You can deploy FIXora using **Option 1 (1-Click Blueprint - Fastest)** or **Option 2 (Manual Web Service)**. Both options run the entire full-stack app (React frontend + Flask API) inside **one single Render Web Service**, so you stay completely within Render's free tier.

---

## 📁 Repository Structure for Deployment

```text
Fixora/
├── .gitignore                   # Ignores venv, node_modules, temp files, secrets, build artifacts
├── build.sh                     # Production build script (builds React & installs Flask deps)
├── render.yaml                  # Render Blueprint configuration for 1-click deployment
├── Procfile                     # Process file declaring web command for Render/Heroku
├── runtime.txt                  # Python runtime version declaration (Python 3.11.9)
├── DEPLOYMENT.md                # This deployment guide
├── README.md
│
├── backend/
│   ├── app.py                  # Flask entrypoint (serves API & React SPA fallback)
│   ├── config.py               # Handles SQLite & PostgreSQL URL normalization
│   ├── requirements.txt        # Python dependencies (includes gunicorn & psycopg2-binary)
│   ├── Procfile                # Backend-specific Procfile
│   ├── runtime.txt             # Python runtime
│   ├── database/               # SQLite DB & static JSON data (e.g., faculty_cabins.json)
│   ├── models/                 # SQLAlchemy models (User, Issue, StatusLog)
│   ├── routes/                 # Flask Blueprints (auth, issue, admin, academic)
│   ├── static/uploads/         # Uploaded complaint attachments
│   └── utils/                  # Helper utilities (SLA checker, file uploads)
│
└── frontend/
    ├── package.json            # React + Vite dependencies & build scripts
    ├── vite.config.js          # Vite config with local proxy to :5000
    ├── public/
    │   └── _redirects          # SPA client routing fallback rule for Render
    └── src/
        ├── api/
        │   └── axiosInstance.js# Auto-detects unified API or external VITE_API_URL
        ├── components/         # Reusable UI components
        ├── pages/              # Role dashboards (Student, Admin, Super Admin, Auth)
        └── ...
```

---

## ⚡ Option 1: 1-Click Deployment with Render Blueprint (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure project for Render deployment"
   git push origin main
   ```

2. **Open Render Dashboard**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** at the top right and select **Blueprint**.
   - Connect your GitHub repository (`Fixora`).

3. **Deploy**:
   - Render reads `render.yaml` automatically.
   - It will pre-fill all settings, secrets, and environment variables.
   - Click **Apply**.
   - Render will build the React frontend, set up the Flask backend with Gunicorn, and give you a live URL (`https://fixora-app.onrender.com`).

---

## 🛠 Option 2: Manual Web Service Deployment

If you prefer to configure the service manually on Render:

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:

| Setting | Value |
|---|---|
| **Name** | `fixora` (or your choice) |
| **Language / Runtime** | `Python` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn --chdir backend app:app` |
| **Plan** | Free |

4. Scroll down to **Environment Variables** and add:

| Key | Suggested Value | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Ensures Python 3.11 environment |
| `SECRET_KEY` | *(Click "Generate" or random 32+ char string)* | Flask session secret |
| `JWT_SECRET_KEY` | *(Click "Generate" or random 32+ char string)* | JWT signing secret |
| `SLA_HOURS` | `24` | Overdue issue auto-escalation window |
| `SUPERADMIN_NAME` | `Super Admin` | Initial Super Admin account name |
| `SUPERADMIN_EMAIL` | `superadmin@fixora.edu` | Login email for Super Admin |
| `SUPERADMIN_PASSWORD` | `FixoraAdmin@2026` *(or your custom password)* | Initial Super Admin password |

5. Click **Create Web Service**.

---

## 🗄️ Optional: Connecting a PostgreSQL Database

By default, Fixora uses an embedded SQLite database (`database/app.db`) that initializes automatically on first boot.

On Render's Free Tier, SQLite files reset when the instance restarts (ephemeral disk). If you want persistent database storage:

### Using Render PostgreSQL:
1. In Render Dashboard, click **New +** → **PostgreSQL**.
2. Give it a name (e.g. `fixora-db`) and select the **Free** plan.
3. Once created, copy the **Internal Database URL** (e.g. `postgres://user:pass@dpg-xxx:5432/fixora`).
4. In your Fixora Web Service settings, add the environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: *(paste the copied PostgreSQL URL)*
5. The backend will automatically connect to Postgres on next deploy (the code in `backend/config.py` automatically normalizes `postgres://` to `postgresql://` and uses `psycopg2-binary`).

---

## 🔑 Default Super Admin Login Credentials

Once deployed, visit your Render URL:
- **Email**: `superadmin@fixora.edu` (or the value set in `SUPERADMIN_EMAIL`)
- **Password**: `FixoraAdmin@2026` (or the value set in `SUPERADMIN_PASSWORD`)

From the Super Admin Dashboard, you can create department admins for **Health**, **Maintenance**, **Academic**, and **Personal** blocks, and assign incoming complaints.

---

## 🧪 Health Check & Verification

Once deployed, you can verify your service status:
- Frontend: `https://<your-render-subdomain>.onrender.com/`
- API Health Check: `https://<your-render-subdomain>.onrender.com/api/health`

Expected response from `/api/health`:
```json
{
  "message": "Grievance Tracker API is running",
  "status": "ok"
}
```

---

## ❓ Frequently Asked Questions (FAQ)

### 1. Why does the app take 30–50 seconds to open on first visit?
Render's Free Tier spins down services after 15 minutes of inactivity to save resources. When someone visits the site, Render wakes up the service (cold start). Subsequent requests will be fast.

### 2. How do page refreshes on subroutes work?
Flask's fallback handler in `app.py` catches all non-API paths and serves `index.html`. In addition, `frontend/public/_redirects` is included for compatibility if deploying as a standalone static site.

### 3. Can I test the build script locally?
Yes! On Linux/Mac or Git Bash on Windows:
```bash
bash build.sh
```
Or run the steps manually:
```bash
cd frontend && npm install && npm run build && cd ..
python -m pip install -r backend/requirements.txt
```
To run the server locally using the production Gunicorn setup:
```bash
gunicorn --chdir backend app:app
```
(On Windows local dev without gunicorn, simply run `python backend/app.py`).
