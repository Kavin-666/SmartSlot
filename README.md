# SmartSlot — Concurrent Booking & Resource Platform

> **"Book smarter. Never double‑book."**

SmartSlot is a full‑stack JavaScript application that provides a **production‑grade, concurrency‑safe booking system** with wait‑list promotion, role‑based access, and a polished UI built with React, Vite, and Tailwind CSS.

---

## 📚 Table of Contents
- [Demo](#demo)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Academic End‑Term Submission](#academic-end‑term-submission)
- [License](#license)

---

## 🎮 Demo
- **Frontend (Vercel):** `https://<your‑frontend>.vercel.app`
- **Backend (Render):** `https://<your‑backend>.onrender.com`
- **Health Check:** `https://<your‑backend>.onrender.com/api/health`

> The demo accounts are pre‑seeded:
>
> | Role | Email | Password |
> >|---|---|---|
> >| Administrator | `admin@example.com` | `admin123` |
> >| Standard User | `user@example.com` | `user123` |

---

## ✨ Features
- **Atomic booking** using MongoDB conditional updates → guarantees *zero double bookings* even under high concurrency.
- **Partial unique index** on `(resourceId, startAt, status)` to enforce uniqueness at the DB level.
- **Wait‑list FIFO promotion** – automatically assigns a freed slot to the earliest wait‑list entry.
- **Role‑based authentication** (admin vs. standard user) with JWT.
- **Comprehensive test suite** (Jest + Supertest) covering concurrency, auth, resource management.
- **Responsive UI** built with React 18, Vite, Tailwind, and Framer Motion.
- **Dark‑mode support** via `ThemeContext` and Tailwind theming.

---

## 🏗️ Architecture Overview
```mermaid
flowchart TD
    subgraph Frontend[Frontend (Vite + React)]
        FE[React SPA] -->|API Calls| BE[Backend API]
    end
    subgraph Backend[Backend (Node.js + Express)]
        BE -->|Mongoose| DB[MongoDB Atlas]
    end
    FE -->|Static assets| CDN[Vercel Edge]
    BE -->|Health endpoint| HC[/api/health]
```

- **Frontend** makes HTTP requests to the backend. In production the base URL is supplied via the `VITE_API_BASE_URL` environment variable.
- **Backend** runs on Render, reads `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_ORIGIN` from its environment.
- **MongoDB Atlas** stores all data; the connection string is never committed to source control.

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Backend** | Node.js 24, Express 4, Mongoose 8, JWT, CORS, Helmet |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide‑React |
| **Database** | MongoDB Atlas (managed) |
| **Testing** | Jest 29, Supertest |
| **Deployment** | Render (backend), Vercel (frontend) |

---

## 💻 Local Development
```bash
# Clone the repo (already done)
# Install root dependencies (optional) and workspace deps
cd smartslot
# Backend
tcd backend && npm install && cp .env.example .env   # edit .env with your local MongoDB URI
npm run dev   # starts the API on PORT 5000

# Frontend
tcd ../frontend && npm install && cp .env.example .env   # set VITE_API_BASE_URL to http://localhost:5000/api/v1
npm run dev   # starts Vite dev server on http://localhost:5173
```

Run the test suite:
```bash
cd backend && npm test
```
All tests should pass (14/14).

---

## 🚀 Production Deployment
### Backend (Render)
1. **Create a Web Service**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
2. **Add Environment Variables** (Settings → Environment):
   - `MONGODB_URI` – the Atlas connection string you created.
   - `JWT_SECRET` – a strong random string (`openssl rand -hex 32`).
   - `FRONTEND_ORIGIN` – the final Vercel URL (e.g., `https://smartslot-frontend.vercel.app`).
3. Deploy – Render will expose the service on a generated domain. Verify the health endpoint (`/api/health`).

### Frontend (Vercel)
1. **Import the GitHub repo** (`Kavin-666/SmartSlot`).
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Environment Variable:** `VITE_API_BASE_URL` → the Render backend URL (`https://<backend>.onrender.com/api/v1`).
5. Deploy – Vercel provides a live HTTPS URL.

After the frontend URL is known, **update `FRONTEND_ORIGIN`** in Render and redeploy the backend to enable CORS.

---

## ⚙️ Environment Variables
### Backend (`backend/.env.example`)
```dotenv
MONGODB_URI=mongodb://localhost:27017/smartslot
PORT=5000
JWT_SECRET=your_jwt_secret_here
FRONTEND_ORIGIN=http://localhost:5173
```
Replace the placeholders with the real values in your production environment (Render). Do **not** commit the real `.env` file.

### Frontend (`frontend/.env.example`)
```dotenv
VITE_API_BASE_URL=/api/v1   # relative for local dev, override in Vercel with full backend URL
```

---

## 🎓 Academic End‑Term Submission Details
- **Project Name:** SmartSlot
- **Problem Statement:** High‑contention scheduling systems suffer from double bookings due to non‑atomic application logic. SmartSlot eliminates this by using atomic MongoDB updates and a wait‑list promotion algorithm.
- **GitHub Repository:** https://github.com/Kavin-666/SmartSlot
- **Live Frontend URL:** *to be filled after Vercel deploy*
- **Live Backend Health URL:** *to be filled after Render deploy*
- **Demo Video:** Record a 3‑5 min walkthrough (login → book a slot → cancel → wait‑list promotion) and host it on YouTube (unlisted) or Google Drive; provide the shareable link.
- **Tech Stack:** Node.js, Express, MongoDB, Mongoose, React, Vite, Tailwind CSS, Jest, Supertest.
- **Key Features:** Concurrency‑safe booking, wait‑list promotion, role‑based JWT auth, comprehensive automated tests.

---

## 📄 License
MIT © 2026 Kavin

---

*This README will be updated automatically with the live deployment URLs once the services are up.*
