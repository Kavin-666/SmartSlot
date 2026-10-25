# SmartSlot Concurrency & Contention Engineering

## 1. Contention Scenarios
When a popular resource (e.g. Executive Boardroom, High Performance GPU Lab) opens for booking, hundreds of requests may target the same slot within milliseconds.

### Failure Modes of Naive Systems:
1. **Dirty Reads**: Two processes check `isSlotAvailable()` and both read `true`.
2. **Double Allocations**: Both processes write booking records. Two users show up to the same physical room.
3. **Deadlocks**: Distributed lock systems (e.g. misconfigured Redis distributed redlocks) failing without releasing locks.

## 2. SmartSlot's Defense-in-Depth Solution

### Layer 1: Atomic Document Predicate Update
```javascript
const slot = await Slot.findOneAndUpdate(
  { _id: slotId, available: true },
  { $set: { available: false, bookedBy: userId } },
  { new: true }
);
```
- MongoDB locks the individual document in memory.
- The condition `{ available: true }` is evaluated while holding the write lock.
- Exactly one concurrent execution will find `{ available: true }` and mutate it to `false`.
- All other concurrent updates evaluate to `null`.

### Layer 2: Partial Compound Unique Index
```javascript
bookingSchema.index(
  { resourceId: 1, startAt: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);
```
- Even if an application bug bypassed the slot check, MongoDB will reject any second `confirmed` booking for the same resource and timestamp with `E11000 duplicate key error`.

### Layer 3: Atomic Cancellation & Waitlist Promotion
When a booking is cancelled:
1. The active booking status is updated to `'cancelled'`.
2. The slot is freed (`available: true`).
3. The queue is queried for the earliest waitlisted user (`sort({ createdAt: 1 })`).
4. An atomic `findOneAndUpdate` claims the slot for the waitlist candidate.
5. If two cancellations or promotion workers run concurrently, the atomic slot update guarantees only one promotion wins.

## 3. Automated Test Verification Results
The test suite in `backend/tests/concurrency.test.js` exercises this behavior under real load:
- **10 concurrent requests** fired with `Promise.all` targeting the exact same slot ID.
- **Results**:
  - `successes.length` = `1` (HTTP 201)
  - `conflicts.length` = `9` (HTTP 409)
  - `Booking.find({ slotId, status: 'confirmed' })` = `1` document.
