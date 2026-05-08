# Design Document: Sports Venue Booking System

## Overview

The Sports Venue Booking System is a full-stack web application that enables users to browse, view, and book sports venues (Football Turf, Cricket Ground, Badminton Court, Tennis Court) and provides admins with tools to manage venues, bookings, and users.

The system is split into two distinct modules:

- **User Module**: Registration, login, venue browsing, slot-based booking, profile and booking history.
- **Admin Module**: Secure admin login, dashboard statistics, venue CRUD with image upload, and booking management.

The architecture follows a classic client-server pattern: a React.js SPA communicates with a Node.js/Express.js REST API backed by MongoDB. JWT tokens carry identity and role claims, enabling stateless authentication for both user and admin flows.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
│                                                             │
│  React.js + Tailwind CSS + React Router + Axios             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  User Pages  │  │ Admin Pages  │  │  Shared Context  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS / REST (JSON)
                             │ Authorization: Bearer <JWT>
┌────────────────────────────▼────────────────────────────────┐
│                   Node.js / Express.js API                  │
│                                                             │
│  ┌────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐  │
│  │Auth Routes │ │Venue Routes │ │ Booking  │ │  Admin   │  │
│  │            │ │             │ │  Routes  │ │  Routes  │  │
│  └────────────┘ └─────────────┘ └──────────┘ └──────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  JWT Middleware  │  Error Handler  │  Multer (upload) │  │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────────┐
│                         MongoDB                             │
│                                                             │
│   Users Collection   Venues Collection   Bookings Collection│
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Stateless JWT auth**: Tokens carry `userId` and `role` claims. No server-side session storage is needed. The middleware verifies the token on every protected request.
- **Role-based access control**: A single `verifyToken` middleware extracts the JWT; a separate `requireAdmin` middleware checks the `role === "admin"` claim. This keeps auth logic composable.
- **Conflict prevention at the database layer**: Booking uniqueness is enforced via a compound unique index on `(venue, date, slot)` in MongoDB, supplemented by an application-level check that returns a 409 before the DB write.
- **Image storage**: Venue images are stored on the server filesystem via Multer and served as static files. This keeps the prototype self-contained without requiring a cloud storage service.
- **React Context for global state**: `AuthContext` holds the decoded JWT payload and token string. No external state library (Redux, Zustand) is introduced, keeping the dependency footprint small.

---

## Components and Interfaces

### Frontend Structure

```
src/
├── context/
│   └── AuthContext.jsx          # JWT token + user/admin state
├── routes/
│   ├── ProtectedRoute.jsx       # Redirects unauthenticated users
│   └── AdminRoute.jsx           # Redirects non-admin users
├── services/
│   ├── authService.js           # login, register API calls
│   ├── venueService.js          # venue CRUD API calls
│   ├── bookingService.js        # booking API calls
│   └── adminService.js          # admin dashboard/management calls
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AdminLoginPage.jsx
│   ├── HomePage.jsx             # Venue listing
│   ├── VenueDetailsPage.jsx     # Slot picker + booking
│   ├── ProfilePage.jsx          # User profile + booking history
│   ├── admin/
│   │   ├── DashboardPage.jsx
│   │   ├── VenueManagementPage.jsx
│   │   └── BookingManagementPage.jsx
└── components/
    ├── Navbar.jsx
    ├── VenueCard.jsx
    ├── SlotGrid.jsx
    ├── BookingConfirmModal.jsx
    ├── Toast.jsx
    ├── LoadingSpinner.jsx
    └── admin/
        ├── VenueForm.jsx
        └── BookingTable.jsx
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| `AuthContext` | Stores JWT token in `localStorage`, exposes `login()`, `logout()`, `user` (decoded payload) |
| `ProtectedRoute` | Wraps user pages; redirects to `/login` if no valid token |
| `AdminRoute` | Wraps admin pages; redirects to `/admin/login` if role ≠ "admin" |
| `HomePage` | Fetches all venues via `venueService`, renders `VenueCard` list with loading state |
| `VenueDetailsPage` | Fetches venue details + slots for selected date; handles booking flow |
| `SlotGrid` | Renders slot buttons with Available/Booked visual distinction |
| `BookingConfirmModal` | Confirmation popup before booking is finalized |
| `ProfilePage` | Fetches user profile + booking history; renders booking list |
| `DashboardPage` | Fetches and displays aggregate stats (users, venues, bookings) |
| `VenueManagementPage` | Lists venues; opens `VenueForm` for add/edit; handles delete with confirmation |
| `BookingManagementPage` | Lists all bookings; allows admin to cancel with confirmation |
| `VenueForm` | Controlled form for venue fields + image file input |
| `Toast` | Global toast notification rendered at app root level |

### Backend Structure

```
backend/
├── config/
│   └── db.js                    # Mongoose connection
├── middleware/
│   ├── verifyToken.js           # JWT verification
│   └── requireAdmin.js          # Role check (admin only)
├── models/
│   ├── User.js
│   ├── Venue.js
│   └── Booking.js
├── controllers/
│   ├── authController.js
│   ├── venueController.js
│   ├── bookingController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js
│   ├── venueRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
└── server.js                    # Express app entry point
```

### REST API Endpoints

#### Auth Routes (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | User login |
| POST | `/api/auth/admin/login` | Public | Admin login |

#### Venue Routes (`/api/venues`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/venues` | User JWT | List all venues |
| GET | `/api/venues/:id` | User JWT | Get venue details |
| POST | `/api/venues` | Admin JWT | Create venue (multipart/form-data) |
| PUT | `/api/venues/:id` | Admin JWT | Update venue |
| DELETE | `/api/venues/:id` | Admin JWT | Delete venue |

#### Booking Routes (`/api/bookings`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/bookings/slots/:venueId?date=YYYY-MM-DD` | User JWT | Get slot availability for venue+date |
| POST | `/api/bookings` | User JWT | Create booking |
| GET | `/api/bookings/my` | User JWT | Get current user's bookings |

#### Admin Routes (`/api/admin`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin JWT | Get aggregate stats |
| GET | `/api/admin/bookings` | Admin JWT | Get all bookings |
| PATCH | `/api/admin/bookings/:id/cancel` | Admin JWT | Cancel a booking |

#### Request / Response Shapes

**POST /api/auth/register**
```json
// Request
{ "name": "Alice", "mobile": "9876543210", "password": "secret123" }

// Response 201
{ "token": "<jwt>", "user": { "_id": "...", "name": "Alice", "role": "user" } }

// Response 409
{ "message": "Mobile number already registered" }
```

**POST /api/bookings**
```json
// Request
{ "venueId": "...", "date": "2025-08-10", "slot": "06:00-07:00" }

// Response 201
{ "booking": { "_id": "...", "status": "confirmed", ... } }

// Response 409
{ "message": "Slot already booked for this venue and date" }
```

**GET /api/bookings/slots/:venueId?date=2025-08-10**
```json
// Response 200
{
  "slots": [
    { "slot": "06:00-07:00", "status": "available" },
    { "slot": "07:00-08:00", "status": "booked" },
    ...
  ]
}
```

---

## Data Models

### User

```javascript
// models/User.js
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  mobile:   { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },          // bcrypt hash
  role:     { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });
```

**Indexes**: Unique index on `mobile`.

### Venue

```javascript
// models/Venue.js
const VenueSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  sportsType:  {
    type: String,
    required: true,
    enum: ["Football Turf", "Cricket Ground", "Badminton Court", "Tennis Court"]
  },
  location:    { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  imageUrl:    { type: String, default: "" },          // relative path served as static
  pricePerHour:{ type: Number, required: true, min: 0 },
  slots:       [{ type: String }]                      // e.g. ["06:00-07:00", "07:00-08:00", ...]
}, { timestamps: true });
```

### Booking

```javascript
// models/Booking.js
const BookingSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
  venue:  { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  date:   { type: String, required: true },            // "YYYY-MM-DD" string for simplicity
  slot:   { type: String, required: true },            // "06:00-07:00"
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" }
}, { timestamps: true });

// Compound unique index — prevents duplicate bookings at the DB layer
BookingSchema.index({ venue: 1, date: 1, slot: 1 }, { unique: true });
```

**Design note on `date` as string**: Storing date as `"YYYY-MM-DD"` avoids timezone conversion issues for a slot-based system where the date is always in local context. Queries filter by exact string equality, which is efficient with an index.

### Entity Relationship Diagram

```
User ──< Booking >── Venue
         │
         ├── date  (string "YYYY-MM-DD")
         ├── slot  (string "HH:MM-HH:MM")
         └── status ("confirmed" | "cancelled")
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password is never stored in plaintext

*For any* user registration with any password string, the value stored in the `password` field of the User document SHALL NOT equal the original plaintext password.

**Validates: Requirements 1.1**

---

### Property 2: Duplicate mobile registration is rejected

*For any* mobile number that already exists in the Users collection, a registration attempt with that same mobile number SHALL be rejected with a 409 status and the Users collection SHALL remain unchanged.

**Validates: Requirements 1.2**

---

### Property 3: JWT role claim matches assigned role

*For any* registered user, the JWT token returned on login SHALL contain a `role` claim that equals the role stored in the User document for that user.

**Validates: Requirements 1.3, 1.5, 6.1**

---

### Property 4: Invalid credentials are rejected

*For any* login attempt with a mobile number not present in the database, or with a password that does not match the stored bcrypt hash, the Auth_Service SHALL return a 401 status and SHALL NOT return a JWT token.

**Validates: Requirements 1.4**

---

### Property 5: Protected routes reject invalid tokens

*For any* request to a protected route that carries an absent, malformed, or expired JWT token, the middleware SHALL return a 401 status and SHALL NOT execute the route handler.

**Validates: Requirements 1.6, 1.7, 10.1**

---

### Property 6: Admin routes reject non-admin tokens

*For any* request to an admin-protected route that carries a JWT token with `role !== "admin"`, the middleware SHALL return a 403 status and SHALL NOT execute the route handler.

**Validates: Requirements 6.2, 6.3**

---

### Property 7: Slot availability reflects confirmed bookings

*For any* venue and date, the slot availability response SHALL mark a slot as "booked" if and only if a Booking document with `status === "confirmed"` exists for that venue, date, and slot combination.

**Validates: Requirements 3.2, 3.3**

---

### Property 8: Booking conflict prevention

*For any* attempt to create a booking for a venue, date, and slot where a confirmed booking already exists, the Booking_Service SHALL return a 409 status and SHALL NOT create a new Booking document.

**Validates: Requirements 4.3, 4.6**

---

### Property 9: Booking creation round-trip

*For any* valid booking request (authenticated user, existing venue, valid date, available slot), after a successful creation the Booking document SHALL be retrievable via the user's booking history with matching venue, date, slot, and `status === "confirmed"`.

**Validates: Requirements 4.1, 5.2**

---

### Property 10: Cancellation makes slot available again

*For any* confirmed booking that an admin cancels, the slot availability response for that venue and date SHALL subsequently mark that slot as "available".

**Validates: Requirements 9.2**

---

### Property 11: Venue required-field validation

*For any* venue creation or update request that omits one or more required fields (name, sportsType, location, pricePerHour), the Venue_Service SHALL return a 400 status and SHALL NOT create or modify a Venue document.

**Validates: Requirements 8.5, 10.2**

---

## Error Handling

### Backend Error Strategy

All controllers follow a consistent try/catch pattern. A centralized error-handling middleware in `server.js` catches unhandled errors and returns a 500 response.

```javascript
// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
};
```

**HTTP status code mapping**:

| Scenario | Status Code |
|---|---|
| Successful read | 200 |
| Successful creation | 201 |
| Missing / invalid fields | 400 |
| Missing / invalid JWT | 401 |
| Insufficient role | 403 |
| Resource not found | 404 |
| Duplicate (mobile, booking) | 409 |
| Unhandled server error | 500 |

### Booking Conflict Handling

The conflict check is two-layered:

1. **Application layer**: Before inserting, query for an existing confirmed booking with the same `(venue, date, slot)`. If found, return 409 immediately.
2. **Database layer**: The compound unique index on `Booking(venue, date, slot)` acts as a safety net against race conditions (e.g., two concurrent requests passing the application check simultaneously). MongoDB will throw a duplicate key error (code 11000), which the controller catches and converts to a 409 response.

```javascript
// bookingController.js — createBooking
const existing = await Booking.findOne({ venue: venueId, date, slot, status: "confirmed" });
if (existing) return res.status(409).json({ message: "Slot already booked for this venue and date" });

try {
  const booking = await Booking.create({ user: req.userId, venue: venueId, date, slot });
  res.status(201).json({ booking });
} catch (err) {
  if (err.code === 11000) return res.status(409).json({ message: "Slot already booked for this venue and date" });
  throw err;
}
```

### Frontend Error Handling

- All Axios calls are wrapped in try/catch blocks inside service functions.
- HTTP 4xx/5xx responses surface as toast notifications with the server's `message` field.
- Loading states are tracked with `useState` booleans; spinners are shown while requests are in flight.

---

## Testing Strategy

### Dual Testing Approach

The testing strategy combines **unit/integration tests** for specific behaviors and **property-based tests** for universal correctness guarantees.

### Property-Based Testing

The feature has clear pure-function logic (password hashing, JWT generation/validation, booking conflict detection, slot availability computation) that is well-suited to property-based testing.

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript/TypeScript PBT library).

**Configuration**: Each property test runs a minimum of **100 iterations**.

**Tag format**: `// Feature: sports-venue-booking, Property <N>: <property_text>`

Properties to implement as PBT tests:

| Property | Test Focus | fast-check Arbitraries |
|---|---|---|
| P1: Password never stored in plaintext | `bcrypt.hash(pw) !== pw` for any string | `fc.string()` |
| P2: Duplicate mobile rejected | Registration with existing mobile returns 409 | `fc.string({ minLength: 10, maxLength: 10 })` |
| P3: JWT role claim matches stored role | Decoded token role equals DB role | `fc.constantFrom("user", "admin")` |
| P4: Invalid credentials rejected | Wrong password or unknown mobile → 401 | `fc.string()`, `fc.emailAddress()` |
| P5: Protected routes reject invalid tokens | Malformed/expired JWT → 401 | `fc.string()`, `fc.constant("")` |
| P6: Admin routes reject non-admin tokens | User JWT on admin route → 403 | `fc.constantFrom("user")` |
| P7: Slot availability reflects bookings | Slot marked booked iff confirmed booking exists | `fc.array(fc.record({...}))` |
| P8: Booking conflict prevention | Duplicate booking → 409, no new document | `fc.record({ venueId, date, slot })` |
| P9: Booking creation round-trip | Created booking appears in user history | `fc.record({ venueId, date, slot })` |
| P10: Cancellation restores availability | Cancelled booking → slot becomes available | `fc.record({ bookingId })` |
| P11: Venue required-field validation | Missing required field → 400, no document | `fc.subarray(["name","sportsType","location","pricePerHour"])` |

### Unit and Integration Tests

Unit tests cover:
- `authController`: register, login, admin login — specific examples and edge cases
- `venueController`: CRUD operations with valid and invalid payloads
- `bookingController`: slot query, booking creation, conflict scenarios
- `adminController`: dashboard aggregation, booking cancellation
- JWT middleware: valid token, expired token, missing token, wrong role
- Frontend services: Axios mock responses for success and error paths

Integration tests cover:
- Full registration → login → book → view history flow
- Admin login → create venue → user books → admin cancels flow
- Concurrent booking attempts for the same slot (race condition test)

### Frontend Testing

- **React Testing Library** for component tests
- Snapshot tests for `VenueCard`, `SlotGrid`, `BookingConfirmModal`
- Example-based tests for `ProtectedRoute` and `AdminRoute` redirect behavior
- Mock `AuthContext` values to test authenticated vs. unauthenticated states

### Test File Organization

```
backend/
└── tests/
    ├── unit/
    │   ├── auth.test.js
    │   ├── venue.test.js
    │   ├── booking.test.js
    │   └── admin.test.js
    ├── property/
    │   ├── auth.property.test.js      # P1–P6
    │   ├── booking.property.test.js   # P7–P10
    │   └── venue.property.test.js     # P11
    └── integration/
        └── flows.test.js

frontend/
└── src/
    └── __tests__/
        ├── components/
        └── pages/
```
