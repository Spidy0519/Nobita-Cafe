<<<<<<< HEAD
# Nobita Cafe

Nobita Cafe is a full-stack food ordering app with:

- Customer pages (Landing, Menu, Cart)
- Admin dashboard for order operations and analytics
- Django backend APIs with Google Sheets as the order datastore

## Current Stack

Frontend:

- React + Vite
- Tailwind CSS
- Axios
- Zustand

Backend:

- Django 4.2
- Django REST Framework
- gspread + Google service account
- SQLite for Django internals

## Routes

Frontend routes:

- / -> Landing page
- /app -> Menu page
- /cart -> Checkout page
- /admin -> Admin dashboard

Backend API routes:

- /api/place-order/
- /api/orders/
- /api/update-status/
- /api/add-complaint/
- /api/generate-bill/<row_index>/
- /api/menu/categories/
- /api/menu/items/
- /api/menu/banners/
- /api/menu/upload-image/
- /api/menu/bulk-import/

## Local Setup

### 1) Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements/base.txt
python manage.py migrate
python manage.py runserver
```

Create backend/.env with at least:

```env
SECRET_KEY=change-me
DEBUG=True
DJANGO_ENV=dev
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

GOOGLE_SHEET_ID=your_google_sheet_id

# Preferred for deployment: full JSON in one env var
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# Optional local fallback (file path)
# GOOGLE_CREDENTIALS_FILE=backend/credentials.json
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Create frontend/.env:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_BASE_URL_PROD=https://nobita-cafe.onrender.com/api
```

## Deployment (Render + Vercel)

### Backend on Render

Service settings:

- Root directory: backend
- Build command: pip install -r requirements/prod.txt && python manage.py migrate
- Start command: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT

Required env vars on Render:

- SECRET_KEY
- DEBUG=False
- DJANGO_ENV=prod
- ALLOWED_HOSTS=nobita-cafe.onrender.com
- CORS_ALLOWED_ORIGINS=https://nobita-cafe.vercel.app
- GOOGLE_SHEET_ID
- GOOGLE_CREDENTIALS_JSON

### Frontend on Vercel

Project settings:

- Root directory: frontend
- Build command: npm run build
- Output directory: dist

Required env vars on Vercel:

- VITE_API_BASE_URL_PROD=https://nobita-cafe.onrender.com/api

## Security Update (Important)

Google service account credentials must never be committed.

What is now in place:

- backend/credentials.json is ignored
- backend/.env and frontend/.env are ignored
- backend/credentials.example.json is provided as a safe template
- Backend supports GOOGLE_CREDENTIALS_JSON so secrets can be stored in hosting env vars

If credentials were exposed earlier:

1. Revoke the old service-account key in Google Cloud immediately.
2. Create a new key.
3. Update GOOGLE_CREDENTIALS_JSON in Render.
4. Verify Google Sheet sharing permissions.

## Notes

- Admin dashboard uses order data from Google Sheets.
- Image uploads are served from Django media storage in current code.
- For production reliability, avoid storing secrets in files inside the repository.
=======
# ☕ Nobita Café — Full-Stack Ordering Platform

A premium, full-stack café ordering system featuring three distinct portals: a Customer App, an Admin Dashboard, and a Delivery Staff App. Built with modern web technologies including React (Vite), Tailwind CSS, Django REST Framework, and Django Channels (WebSockets) for real-time reactivity.

## ✨ Features

### 👤 Customer App (`/` & `/app`)
- **Dynamic Menu:** Categorized view with modern, glassmorphic UI, real-time search, and filtering.
- **OTP Authentication:** Secure, passwordless mobile-based login utilizing MSG91 (with console-logging fallback in Dev mode).
- **Cart & Checkout:** Persistent cart logic using Zustand, GPS location integration, and dynamic order summary.
- **Real-Time Live Tracking:** WebSocket-powered order timeline showing progress from "Placed" to "Delivered".
- **Payments:** Razorpay integration supporting UPI, Cards, and Cash-on-Delivery.

### 👑 Admin Dashboard (`/admin`)
- **Live Kanban Board:** Real-time visibility of all orders synced via WebSockets. Orders pop up automatically with sound notifications.
- **One-Click Updates:** Move orders through "Confirmed", "Preparing", and "Out for Delivery" states instantly.
- **Menu Management:** Easily toggle item availability, highlight specials, and manage prices.
- **Analytics:** Today and weekly summaries presented visually using Recharts (Revenue, Orders, Top Items).
- **Delivery Management:** Add, track, and assign delivery staff in real-time.

### 🛵 Delivery Staff Portal (`/delivery`)
- **Task Assignment:** Real-time push notification when a new order is assigned.
- **Order Lifecycle:** Update status to "Out for Delivery" and confirm "Delivered".
- **Customer Connect:** One-tap to call the customer or open exact coordinates in Google Maps.
- **Cash Management:** Mandatory "Cash Collected" constraint for COD orders before marking as Delivered.

---

## 🛠️ Technology Stack

**Frontend (React 18 + Vite)**
- **State Management:** Zustand (with persist middleware for Cart)
- **Styling:** Tailwind CSS (Vanilla CSS base, Glassmorphism, Custom Animations)
- **Routing:** React Router v6
- **API & Data:** Axios (with JWT Interceptors)
- **Real-Time:** Socket.io-client
- **Charts:** Recharts

**Backend (Django 4.2)**
- **API Framework:** Django REST Framework
- **Database:** PostgreSQL 15 (Development local fallback to SQLite)
- **Cache & Real-Time:** Redis + Django Channels (Daphne ASGI server)
- **Authentication:** JWT (`djangorestframework-simplejwt`) + MSG91 OTP
- **Payments:** Razorpay API + Webhooks
- **Media Storage:** Cloudinary

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Postgres (optional if using SQLite for dev)
- Redis Server (Required for WebSockets)

### 1️⃣ Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements/base.txt
   pip install -r requirements/dev.txt
   ```
4. Configure Environment Variables:
   Create a `.env` file in `backend/` and add:
   ```env
   DJANGO_SETTINGS_MODULE=config.settings.dev
   SECRET_KEY=your-super-secret-key
   DEBUG=True
   
   # Redis
   REDIS_URL=redis://localhost:6379/1
   
   # Optional configurations (Razorpay, Cloudinary, MSG91)
   ```
5. Apply Migrations & Create Superuser:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```
6. Start the ASGI Server (Daphne):
   ```bash
   daphne -p 8000 config.asgi:application
   # OR simply via manage.py for development
   python manage.py runserver
   ```
   *Note: Ensure your local Redis server is running on port 6379.*

### 2️⃣ Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in `frontend/` and add:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_WS_URL=ws://localhost:8000/ws
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```
4. Start the Vite Dev Server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`.

---

## ☁️ Deployment Guide

### Backend (Railway / Render / Heroku)
The backend is set up for production using Docker and Daphne.
1. Define env vars in the production environment (set `DJANGO_SETTINGS_MODULE=config.settings.prod`).
2. The provided `Dockerfile` will install dependencies, collect static files, and start Daphne on port 8000.
3. Use a managed Postgres Database and a managed Redis instance.

### Frontend (Vercel / Netlify)
1. Add the `frontend/` directory to your Git repo.
2. Connect Vercel to your repository.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Define the `VITE_API_BASE_URL` and `VITE_WS_URL` environment variables pointing to your deployed backend URL.

---

*Built with ❤️ for Nobita Café.*
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
