# SmartSlot V3 Multi-Tenant System Architecture

## 1. Architectural Overview & Tenant Isolation
SmartSlot V3 introduces an enterprise multi-tenant software architecture designed for property owners, commercial co-working hubs, research centers, and educational campuses.

```
+-------------------------------------------------------------------------+
|                        Client Layer (React + Vite)                      |
|  - Public Discovery (/properties, /resources)                           |
|  - 5-Step Property Wizard (/owner/properties/new)                       |
|  - Facility Workspace (/owner/properties/:id/manage)                    |
|  - AI Assistant Co-Pilot (Natural Language Structuring & Matching)      |
+------------------------------------+------------------------------------+
                                     | REST (JWT Bearer Auth)
                                     v
+------------------------------------+------------------------------------+
|                       API Gateway & Security Layer                      |
|  - Helmet, Rate Limiter, CORS                                           |
|  - Tenant Authorization Middleware (requireOrgAccess, requireProperty)  |
+------------------------------------+------------------------------------+
                                     |
    +-------------------+------------+------------+--------------------+
    |                   |                         |                    |
    v                   v                         v                    v
+-----------+   +---------------+         +---------------+    +---------------+
| Multi-    |   | Physical      |         | Atomic Slot   |    | AI Co-Pilot   |
| Tenant    |   | Hierarchy     |         | Concurrency   |    | Engine        |
| Module    |   | Module        |         | Engine        |    | (Drafts &     |
| (Org,     |   | (Floors,      |         | (Single-Write |    | Explainable   |
| Members)  |   | Maintenance)  |         | Locks, 409s)  |    | Matching)     |
+-----+-----+   +-------+-------+         +-------+-------+    +-------+-------+
      |                 |                         |                    |
      +-----------------+------------+------------+--------------------+
                                     |
                                     v
+------------------------------------+------------------------------------+
|                    MongoDB Multi-Tenant Persistence                     |
|  - Organization (owner, members, roles: owner, manager, viewer)         |
|  - Property (draft, published, archived; location; operating schedule)  |
|  - PropertySection (Floors 1..N, wings, levels)                         |
|  - Resource (propertyId, sectionId, pricing, capacity, buffer)          |
|  - Slot (discrete 30m slots, atomic available flag)                     |
|  - Booking (partial compound unique index, property snapshot)           |
|  - MaintenanceBlock (temporary closures, disables slots)                |
|  - AuditLog (immutable administrative audit trail)                      |
+-------------------------------------------------------------------------+
```

## 2. Multi-Tenant Authorization Model
- **Platform Administrator** (`user.role === 'admin'`): Global emergency administrative oversight.
- **Organization Owner** (`org.ownerId`): Full lifecycle control of organizations, billing, and member invites.
- **Property Manager** (`org.members.role === 'manager'`): Add/edit properties, manage floors, create bookable spaces, schedule maintenance.
- **Booking Manager** (`org.members.role === 'booking_manager'`): Approve or cancel reservations.
- **Viewer** (`org.members.role === 'viewer'`): Read-only view of bookings and analytics.
- **Tenant Isolation Enforcement**: Every mutation is scoped by `requirePropertyAccess` or `requireOrgAccess`. Cross-tenant IDOR attacks are rejected with HTTP 403 Forbidden.

## 3. Physical Building Hierarchy (Property -> Floor -> Resource)
Physical properties are mapped into hierarchical sections:
1. **Property**: Holds commercial identity, physical address, timezone, default operating hours, and cancellation policy.
2. **PropertySection / Floor**: Represents physical levels (Floor 1, Floor 2, Penthouse, East Wing).
3. **Resource / Room**: Belongs to a property and floor section, with tailored pricing models (`free`, `fixed_slot`, `hourly`), capacity, and amenities.
4. **MaintenanceBlock**: Temporarily takes resources offline; booking engine detects overlaps and returns 409 Conflict.
