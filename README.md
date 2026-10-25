# SmartSlot — Concurrent Booking & Resource Platform
> **"Book smarter. Never double-book."**

SmartSlot is a production-style, concurrency-safe resource booking and waitlist management platform. It solves the critical distributed systems challenge of **preventing double bookings when multiple users attempt to reserve the same resource and time slot simultaneously**.

Built as a full-stack JavaScript application with zero TypeScript complexity, using Node.js, Express, MongoDB (Mongoose), React, Vite, and Tailwind CSS.

---

## ⚡ Quick Start (Currently Running & Live)

The application is already running in your local workspace:

- **Frontend Application**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Server**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 1-Click Demo Accounts:
| Role | Email | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@example.com` | `admin123` | Create & manage facilities, view global stats |
| **Standard User** | `user@example.com` | `user123` | Discover slots, reserve, cancel, join waitlists |

*(Both accounts can also be auto-filled via the 1-click buttons on the Login page)*

---

## 🛠️ Architecture & Engineering Depth

### Concurrency Protection: Atomic Document-Level Reservation
In conventional tutorial implementations, checking availability and inserting a booking are separate operations (`read-then-write`), causing catastrophic race conditions under load.

SmartSlot implements a multi-layer defense-in-depth architecture:
1. **Atomic State Claim**:
   ```javascript
   const slot = await Slot.findOneAndUpdate(
     { _id: slotId, available: true },
     { $set: { available: false, bookedBy: userId } },
     { new: true }
   );
   if (!slot) return res.status(409).json({ message: 'Slot already booked' });
   ```
2. **Compound Partial Unique Index**:
   ```javascript
   bookingSchema.index(
     { resourceId: 1, startAt: 1, status: 1 },
     { unique: true, partialFilterExpression: { status: 'confirmed' } }
   );
   ```
3. **Automatic Waitlist FIFO Promotion**:
   When an active booking is cancelled, the slot is freed and atomically assigned to the earliest queued waitlist candidate without double reservation.

---

## 🧪 Automated Test Verification

SmartSlot includes a comprehensive automated test suite testing concurrency under load:
```bash
cd backend && npm test
```

### Verified Test Suites:
- `tests/concurrency.test.js`:
  - **10 concurrent requests to book the exact same slot -> Exactly 1 succeeds (201), 9 receive 409 Conflict**
  - **Cancellation atomically frees slot and permits subsequent booking**
  - **Waitlist promotion automatically allocates freed slot to earliest queued user**
- `tests/auth.test.js`:
  - User registration, duplicate email rejection (409), password hashing, JWT generation, protected route guards
- `tests/resource.test.js`:
  - Resource cataloging, non-admin modification rejection (403), admin resource creation (201), deterministic slot generation

**Test Results: 14/14 tests passing (100% pass rate).**

---

## 📁 Repository Structure
```
smartslot/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection handler
│   │   ├── controllers/          # Business logic (auth, booking, slot, resource, waitlist, admin)
│   │   ├── middleware/           # JWT auth, RBAC, centralized error handling
│   │   ├── models/               # Mongoose schemas (User, Resource, Slot, Booking, Waitlist)
│   │   ├── routes/               # Express REST routes (/api/v1/*)
│   │   ├── seed.js               # Safe deterministic demo data generator
│   │   ├── app.js                # Express app configuration & security middleware
│   │   └── server.js             # Server entry point
│   ├── tests/                    # Jest + Supertest suites
│   ├── .env                      # Local environment configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/api.js            # Axios client with interceptors
│   │   ├── context/AuthContext.jsx # React Auth provider & state
│   │   ├── components/common/    # Navbar, modals, badges
│   │   ├── pages/                # Landing, Login, Register, Resources, ResourceDetail, MyBookings, AdminDashboard, Profile
│   │   ├── App.jsx               # Protected client-side routing
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Tailwind CSS styles
│   ├── vite.config.js            # Vite build & development proxy configuration
│   ├── tailwind.config.cjs       # Tailwind theme & tokens
│   ├── postcss.config.cjs        # PostCSS configuration
│   └── package.json
├── docs/
│   ├── architecture.md           # System design & component diagrams
│   ├── api.md                    # Complete REST API documentation
│   ├── concurrency.md            # Race condition analysis & mathematical guarantees
│   ├── testing.md                # Automated test execution report
│   └── deployment.md             # Docker Compose & production deployment guide
├── package.json                  # Root monorepo scripts
└── README.md
```

---

## 🚀 Running Commands Manually

### Seed Demo Data:
```bash
npm run seed
```

### Run Tests:
```bash
npm test
```

### Run Development Servers:
```bash
# In backend:
cd backend && npm run dev

# In frontend:
cd frontend && npm run dev
```

---

## 🎓 Academic End-Term Submission Details

- **Project Name**: SmartSlot
- **Problem Statement**: High-contention resource scheduling platforms suffer from double bookings caused by non-atomic application logic. SmartSlot provides a deterministic, database-backed concurrency engine that eliminates race conditions and automates queue management.
- **Tech Stack**: Node.js, Express.js, MongoDB, Mongoose, React, Vite, Tailwind CSS, Jest, Supertest.
- **Key Engineering Achievements**:
  - Zero double bookings guaranteed via atomic conditional updates and partial compound unique indexes.
  - Automated waitlist FIFO promotion engine upon booking cancellation.
  - Role-based authorization on both client and server layers.
  - 10-client concurrent load test passing with 100% deterministic conflict handling.
