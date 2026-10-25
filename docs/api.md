# SmartSlot V3 REST API Reference

All endpoints are versioned under `/api/v1`.

## Health Check
- `GET /api/health` — Public server status

## Authentication (`/api/v1/auth`)
- `POST /register` — Register individual or property owner account
- `POST /login` — Authenticate and receive JWT
- `GET /me` — Fetch authenticated profile

## Multi-Tenant Organizations (`/api/v1/organizations`)
- `POST /` — Create organization workspace (Private)
- `GET /me` — List organizations owned or joined by authenticated user (Private)
- `GET /:id` — Get organization details & members (Private)
- `POST /:id/members` — Invite or update member role (`manager`, `booking_manager`, `viewer`) (Owner/Manager)

## Properties (`/api/v1/properties`)
- `GET /public` — Public search and discovery of published properties
- `GET /:id` — Get property details, floors, and resources (Public if published, Private if draft)
- `POST /` — Create property via wizard or draft (Private)
- `GET /mine/all` — List properties owned/managed by requester (Private)
- `PATCH /:id` — Update property metadata, amenities, policies (Owner/Manager)
- `POST /:id/publish` — Publish property to live public directory (Owner/Manager)
- `POST /:id/unpublish` — Revert property to draft status (Owner/Manager)
- `GET /:id/analytics` — Real metrics: bookings count, cancellation rate, utilization (Owner/Viewer)
- `GET /:id/bookings` — Filterable reservations for this facility (Owner/Viewer)
- `GET /:id/audit-logs` — Immutable audit trail of facility actions (Owner/Viewer)

## Building Floors & Sections (`/api/v1/properties/:id/sections`)
- `POST /:id/sections` — Add floor or wing (Owner/Manager)
- `GET /:id/sections` — List floors and assigned resources (Public/Private)
- `PATCH /sections/:sectionId` — Rename or update floor (Owner/Manager)
- `DELETE /sections/:sectionId` — Archive floor and unassign rooms (Owner/Manager)

## Property Resources & Rooms (`/api/v1/properties/:id/resources`)
- `POST /:id/resources` — Add room to property and optional floor with pricing model (Owner/Manager)
- `GET /:id/resources` — List bookable rooms in property (Public/Private)

## Scheduled Maintenance (`/api/v1/properties/:propertyId/resources/:resourceId/maintenance`)
- `POST /` — Schedule maintenance downtime; warns on conflicting bookings (Owner/Manager)
- `GET /` — List maintenance periods for room (Public/Private)
- `DELETE /maintenance/:id` — Cancel maintenance block (Owner/Manager)

## AI Co-Pilot Engine (`/api/v1/ai`)
- `POST /property-draft` — Natural language structured property extraction with deterministic fallback (Private)
- `POST /recommendations` — Transparent algorithmic resource matching and ranking (Public/Private)

## Concurrency Booking Engine (`/api/v1/bookings`)
- `POST /` — Atomically claim slot (`available: true -> false`); returns 409 on contention
- `GET /me` — Current user's bookings
- `POST /:id/cancel` — Atomically releases slot and triggers automatic waitlist promotion
