# Implementation Plan: Sports Venue Booking System

## Overview

Full-stack implementation of a sports venue booking system using Node.js/Express/MongoDB on the backend and React/Tailwind CSS on the frontend. The plan follows the architecture defined in the design document, building incrementally from project scaffolding through data models, API routes, frontend pages, and property-based tests.

---

## Tasks

- [x] 1. Backend project setup
  - [x] 1.1 Initialise Node.js project and install dependencies
    - Run `npm init -y` inside a `backend/` directory
    - Install production deps: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `multer`, `dotenv`, `cors`
    - Install dev deps: `nodemon`, `jest`, `supertest`, `fast-check`
    - Create `backend/.env` with `MONGO_URI`, `JWT_SECRET`, `PORT` placeholders
    - Create `backend/server.js` entry point: initialise Express, register middleware (cors, json body parser, static `/uploads`), mount route stubs, start listening
    - Create folder structure: `config/`, `middleware/`, `models/`, `controllers/`, `routes/`, `tests/unit/`, `tests/property/`, `tests/integration/`
    - _Requirements: Design §Backend Structure_

  - [x] 1.2 Configure MongoDB connection
    - Write `backend/config/db.js` using Mongoose `connect()` with the `MONGO_URI` env variable
    - Call `db.js` from `server.js` before starting the HTTP server; log connection success/failure
    - _Requirements: Design §Data Models_

- [x] 2. MongoDB models
  - [x] 2.1 Implement User model
    - Write `backend/models/User.js` with the schema defined in the design: `name`, `mobile` (unique), `password`, `role` enum, timestamps
    - Add unique index on `mobile`
    - _Requirements: Design §User model_

  - [x] 2.2 Implement Venue model
    - Write `backend/models/Venue.js` with fields: `name`, `sportsType` (enum), `location`, `description`, `imageUrl`, `pricePerHour` (min 0), `slots` array, timestamps
    - _Requirements: Design §Venue model_

  - [x] 2.3 Implement Booking model
    - Write `backend/models/Booking.js` with fields: `user` (ObjectId ref), `venue` (ObjectId ref), `date` (string), `slot` (string), `status` enum, timestamps
    - Add compound unique index on `{ venue, date, slot }`
    - _Requirements: Design §Booking model, Property 8_

- [x] 3. Auth middleware
  - [x] 3.1 Implement `verifyToken` middleware
    - Write `backend/middleware/verifyToken.js`
    - Extract `Authorization: Bearer <token>` header; return 401 if absent or malformed
    - Verify token with `JWT_SECRET`; return 401 if invalid or expired
    - Attach `req.userId` and `req.role` from decoded payload; call `next()`
    - _Requirements: Design §Property 5_

  - [x] 3.2 Implement `requireAdmin` middleware
    - Write `backend/middleware/requireAdmin.js`
    - Check `req.role === "admin"`; return 403 if not; call `next()` otherwise
    - _Requirements: Design §Property 6_

  - [x]* 3.3 Write property tests for auth middleware (P5, P6)
    - **Property 5: Protected routes reject invalid tokens**
    - Use `fc.string()` and `fc.constant("")` to generate absent/malformed tokens; assert 401 for every case
    - **Property 6: Admin routes reject non-admin tokens**
    - Use `fc.constantFrom("user")` role; assert 403 for every case
    - Tag: `// Feature: sports-venue-booking, Property 5` and `Property 6`
    - File: `backend/tests/property/auth.property.test.js`
    - _Requirements: Design §Property 5, Property 6_

- [x] 4. Auth controllers and routes
  - [x] 4.1 Implement `authController.js`
    - `register`: validate required fields, check mobile uniqueness (409 if duplicate), hash password with `bcryptjs`, create User, sign JWT with `{ userId, role }`, return 201 with token + user
    - `login`: find user by mobile, compare password with `bcrypt.compare`, return 401 on mismatch, sign JWT, return 200
    - `adminLogin`: same as login but verify `role === "admin"` before issuing token; return 403 otherwise
    - _Requirements: Design §Auth Routes, Property 1, 2, 3, 4_

  - [x] 4.2 Implement `authRoutes.js` and mount on server
    - Wire `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin/login` to controller functions
    - Mount router in `server.js`
    - _Requirements: Design §Auth Routes_

  - [x]* 4.3 Write property tests for auth (P1–P4)
    - **Property 1: Password never stored in plaintext** — `fc.string()` → assert `bcrypt.hash(pw) !== pw`
    - **Property 2: Duplicate mobile rejected** — `fc.string({ minLength: 10, maxLength: 10 })` → register twice, assert 409 on second attempt and collection count unchanged
    - **Property 3: JWT role claim matches stored role** — `fc.constantFrom("user", "admin")` → register/seed, login, decode token, assert `role` claim equals DB role
    - **Property 4: Invalid credentials rejected** — `fc.string()` for wrong password / unknown mobile → assert 401 and no token in response
    - Tag: `// Feature: sports-venue-booking, Property 1/2/3/4`
    - File: `backend/tests/property/auth.property.test.js`
    - _Requirements: Design §Property 1, 2, 3, 4_

  - [x]* 4.4 Write unit tests for auth controller
    - Test register success (201 + token), duplicate mobile (409), missing fields (400)
    - Test login success (200 + token), wrong password (401), unknown mobile (401)
    - Test adminLogin with non-admin user (403)
    - File: `backend/tests/unit/auth.test.js`
    - _Requirements: Design §Auth Routes_

- [x] 5. Checkpoint — auth layer
  - Ensure all auth middleware and controller tests pass before proceeding.
  - Ask the user if any questions arise.

- [x] 6. Venue controllers and routes
  - [x] 6.1 Configure Multer for image upload
    - Write upload configuration in `backend/middleware/upload.js` (or inline in venueRoutes): `diskStorage` saving to `backend/uploads/`, `fileFilter` accepting images only, `limits.fileSize`
    - _Requirements: Design §Key Design Decisions (Image storage)_

  - [x] 6.2 Implement `venueController.js`
    - `getAllVenues`: return all venue documents (200)
    - `getVenueById`: return single venue by `_id`; 404 if not found
    - `createVenue`: validate required fields (name, sportsType, location, pricePerHour); set `imageUrl` from `req.file` if present; create document; return 201
    - `updateVenue`: find by id (404 if missing), apply updates, save, return 200
    - `deleteVenue`: find by id (404 if missing), delete, return 200
    - _Requirements: Design §Venue Routes, Property 11_

  - [x] 6.3 Implement `venueRoutes.js` and mount on server
    - `GET /api/venues` and `GET /api/venues/:id` — protected by `verifyToken`
    - `POST /api/venues` — protected by `verifyToken` + `requireAdmin` + Multer upload
    - `PUT /api/venues/:id` and `DELETE /api/venues/:id` — protected by `verifyToken` + `requireAdmin`
    - Mount router in `server.js`
    - _Requirements: Design §Venue Routes_

  - [x]* 6.4 Write property test for venue validation (P11)
    - **Property 11: Venue required-field validation**
    - Use `fc.subarray(["name","sportsType","location","pricePerHour"])` to generate requests missing at least one required field; assert 400 and no new document created
    - Tag: `// Feature: sports-venue-booking, Property 11`
    - File: `backend/tests/property/venue.property.test.js`
    - _Requirements: Design §Property 11_

  - [x]* 6.5 Write unit tests for venue controller
    - Test CRUD happy paths and 404 cases
    - Test image upload path stored in `imageUrl`
    - File: `backend/tests/unit/venue.test.js`
    - _Requirements: Design §Venue Routes_

- [x] 7. Booking controllers and routes
  - [x] 7.1 Implement slot availability query in `bookingController.js`
    - `getSlots`: accept `venueId` and `date` query param; fetch venue to get `slots` array; query confirmed bookings for that venue+date; return slot list with `status: "available" | "booked"` for each slot
    - _Requirements: Design §Booking Routes, Property 7_

  - [x] 7.2 Implement booking creation in `bookingController.js`
    - `createBooking`: validate `venueId`, `date`, `slot`; application-level conflict check (409 if confirmed booking exists); `Booking.create()`; catch Mongo duplicate key error (code 11000) and return 409; return 201 on success
    - _Requirements: Design §Booking Routes, Property 8, 9_

  - [x] 7.3 Implement user booking history in `bookingController.js`
    - `getMyBookings`: query bookings where `user === req.userId`; populate `venue` fields; return 200
    - _Requirements: Design §Booking Routes, Property 9_

  - [x] 7.4 Implement `bookingRoutes.js` and mount on server
    - `GET /api/bookings/slots/:venueId` — `verifyToken`
    - `POST /api/bookings` — `verifyToken`
    - `GET /api/bookings/my` — `verifyToken`
    - Mount router in `server.js`
    - _Requirements: Design §Booking Routes_

  - [x]* 7.5 Write property tests for booking (P7, P8, P9)
    - **Property 7: Slot availability reflects confirmed bookings** — seed bookings with `fc.array(fc.record({...}))`, call `getSlots`, assert each slot status matches confirmed booking existence
    - **Property 8: Booking conflict prevention** — `fc.record({ venueId, date, slot })` → create booking, attempt duplicate, assert 409 and document count unchanged
    - **Property 9: Booking creation round-trip** — `fc.record({ venueId, date, slot })` → create booking, call `getMyBookings`, assert booking appears with matching fields and `status === "confirmed"`
    - Tag: `// Feature: sports-venue-booking, Property 7/8/9`
    - File: `backend/tests/property/booking.property.test.js`
    - _Requirements: Design §Property 7, 8, 9_

  - [x]* 7.6 Write unit tests for booking controller
    - Test slot query with no bookings, partial bookings, all booked
    - Test createBooking success, conflict (409), missing fields (400)
    - Test getMyBookings returns only current user's bookings
    - File: `backend/tests/unit/booking.test.js`
    - _Requirements: Design §Booking Routes_

- [x] 8. Admin controllers and routes
  - [x] 8.1 Implement `adminController.js`
    - `getDashboard`: aggregate counts — `User.countDocuments()`, `Venue.countDocuments()`, `Booking.countDocuments({ status: "confirmed" })`; return 200 with stats object
    - `getAllBookings`: return all bookings with `user` and `venue` populated; return 200
    - `cancelBooking`: find booking by id (404 if missing); set `status = "cancelled"`; save; return 200
    - _Requirements: Design §Admin Routes, Property 10_

  - [x] 8.2 Implement `adminRoutes.js` and mount on server
    - All routes protected by `verifyToken` + `requireAdmin`
    - `GET /api/admin/dashboard`, `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:id/cancel`
    - Mount router in `server.js`
    - _Requirements: Design §Admin Routes_

  - [x]* 8.3 Write property test for cancellation (P10)
    - **Property 10: Cancellation makes slot available again**
    - `fc.record({ bookingId })` → confirm booking exists, admin cancels, call `getSlots`, assert slot is now "available"
    - Tag: `// Feature: sports-venue-booking, Property 10`
    - File: `backend/tests/property/booking.property.test.js`
    - _Requirements: Design §Property 10_

  - [x]* 8.4 Write unit tests for admin controller
    - Test dashboard returns correct counts
    - Test getAllBookings returns populated documents
    - Test cancelBooking success and 404 for unknown id
    - File: `backend/tests/unit/admin.test.js`
    - _Requirements: Design §Admin Routes_

- [x] 9. Error handling middleware
  - [x] 9.1 Implement centralised error handler
    - Write `backend/middleware/errorHandler.js` matching the design: log `err.stack`, return `{ message: "Internal server error" }` with status 500
    - Register as the last middleware in `server.js` (after all routes)
    - _Requirements: Design §Error Handling_

- [x] 10. Checkpoint — backend complete
  - Ensure all backend unit, property, and integration tests pass.
  - Verify all API endpoints respond correctly with a REST client.
  - Ask the user if any questions arise.

- [x] 11. Frontend project setup
  - [x] 11.1 Initialise React project and install dependencies
    - Bootstrap with `create-react-app` or Vite inside a `frontend/` directory
    - Install: `react-router-dom`, `axios`, `tailwindcss`, `postcss`, `autoprefixer`
    - Configure Tailwind (`tailwind.config.js`, `postcss.config.js`, import in `index.css`)
    - Create folder structure matching the design: `src/context/`, `src/routes/`, `src/services/`, `src/pages/admin/`, `src/components/admin/`, `src/__tests__/components/`, `src/__tests__/pages/`
    - Configure Axios base URL pointing to the backend (via `.env` `REACT_APP_API_URL`)
    - _Requirements: Design §Frontend Structure_

- [x] 12. AuthContext and service modules
  - [x] 12.1 Implement `AuthContext.jsx`
    - Create context with `login(token)` (decode payload, store token in `localStorage`), `logout()` (clear storage), and `user` (decoded payload or null)
    - Wrap `<App>` with `<AuthProvider>` in `index.jsx`
    - _Requirements: Design §Component Responsibilities (AuthContext)_

  - [x] 12.2 Implement service modules
    - `authService.js`: `register(data)`, `login(data)`, `adminLogin(data)` — POST to `/api/auth/*`
    - `venueService.js`: `getVenues()`, `getVenue(id)`, `createVenue(formData)`, `updateVenue(id, data)`, `deleteVenue(id)`
    - `bookingService.js`: `getSlots(venueId, date)`, `createBooking(data)`, `getMyBookings()`
    - `adminService.js`: `getDashboard()`, `getAllBookings()`, `cancelBooking(id)`
    - All functions attach `Authorization: Bearer <token>` header from `localStorage`
    - _Requirements: Design §Frontend Structure_

- [x] 13. Route guards
  - [x] 13.1 Implement `ProtectedRoute.jsx`
    - Read token from `AuthContext`; redirect to `/login` if absent or expired
    - _Requirements: Design §Component Responsibilities (ProtectedRoute), Property 5_

  - [x] 13.2 Implement `AdminRoute.jsx`
    - Read `user.role` from `AuthContext`; redirect to `/admin/login` if role ≠ "admin"
    - _Requirements: Design §Component Responsibilities (AdminRoute), Property 6_

  - [x] 13.3 Wire React Router in `App.jsx`
    - Define all routes: public (`/login`, `/register`, `/admin/login`), user-protected (`/`, `/venues/:id`, `/profile`), admin-protected (`/admin/dashboard`, `/admin/venues`, `/admin/bookings`)
    - Wrap user routes with `<ProtectedRoute>` and admin routes with `<AdminRoute>`
    - _Requirements: Design §Frontend Structure_

- [x] 14. Shared components
  - [x] 14.1 Implement `Navbar.jsx`
    - Show app name/logo; conditionally render user nav links (Home, Profile, Logout) or admin nav links based on `AuthContext` role
    - _Requirements: Design §Components_

  - [x] 14.2 Implement `VenueCard.jsx`
    - Accept venue prop; display image, name, sportsType, location, pricePerHour; link to `/venues/:id`
    - _Requirements: Design §Components_

  - [x] 14.3 Implement `SlotGrid.jsx`
    - Accept `slots` array (each with `slot` and `status`); render buttons styled differently for "available" vs "booked"; emit `onSelect(slot)` callback for available slots
    - _Requirements: Design §Component Responsibilities (SlotGrid)_

  - [x] 14.4 Implement `BookingConfirmModal.jsx`
    - Accept `venue`, `date`, `slot`, `onConfirm`, `onCancel` props; render confirmation dialog; call `onConfirm` or `onCancel` on button click
    - _Requirements: Design §Component Responsibilities (BookingConfirmModal)_

  - [x] 14.5 Implement `Toast.jsx` and `LoadingSpinner.jsx`
    - `Toast`: accept `message` and `type` ("success" | "error"); auto-dismiss after 3 s; render at app root level
    - `LoadingSpinner`: simple animated spinner for loading states
    - _Requirements: Design §Components_

- [x] 15. User pages
  - [-] 15.1 Implement `RegisterPage.jsx`
    - Controlled form: name, mobile, password; call `authService.register`; on success store token via `AuthContext.login` and redirect to `/`; show Toast on error
    - _Requirements: Design §Auth Routes_

  - [x] 15.2 Implement `LoginPage.jsx`
    - Controlled form: mobile, password; call `authService.login`; on success store token and redirect to `/`; show Toast on error
    - _Requirements: Design §Auth Routes_

  - [-] 15.3 Implement `HomePage.jsx`
    - On mount call `venueService.getVenues()`; show `LoadingSpinner` while fetching; render grid of `VenueCard` components; handle empty state
    - _Requirements: Design §Component Responsibilities (HomePage)_

  - [x] 15.4 Implement `VenueDetailsPage.jsx`
    - Fetch venue details and slots for selected date via `venueService.getVenue` and `bookingService.getSlots`; render `SlotGrid`; on slot select open `BookingConfirmModal`; on confirm call `bookingService.createBooking`; show Toast on success/error; refresh slots after booking
    - _Requirements: Design §Component Responsibilities (VenueDetailsPage), Property 7, 8_

  - [x] 15.5 Implement `ProfilePage.jsx`
    - Fetch user profile from decoded JWT and booking history via `bookingService.getMyBookings()`; render booking list with venue name, date, slot, status; show `LoadingSpinner` while fetching
    - _Requirements: Design §Component Responsibilities (ProfilePage), Property 9_

- [x] 16. Admin pages and components
  - [x] 16.1 Implement `AdminLoginPage.jsx`
    - Controlled form: mobile, password; call `authService.adminLogin`; on success store token and redirect to `/admin/dashboard`; show Toast on error
    - _Requirements: Design §Auth Routes_

  - [x] 16.2 Implement `VenueForm.jsx`
    - Controlled form for all venue fields + image file input; accept `initialValues` prop for edit mode; call `onSubmit(formData)` with `multipart/form-data`; validate required fields client-side before submit
    - _Requirements: Design §Component Responsibilities (VenueForm), Property 11_

  - [x] 16.3 Implement `VenueManagementPage.jsx`
    - Fetch venues via `venueService.getVenues()`; render venue list; "Add Venue" button opens `VenueForm` in create mode; edit icon opens `VenueForm` in edit mode; delete icon shows confirmation then calls `venueService.deleteVenue`; show Toast on success/error
    - _Requirements: Design §Component Responsibilities (VenueManagementPage)_

  - [x] 16.4 Implement `BookingTable.jsx`
    - Accept `bookings` array prop; render table with columns: user name, venue name, date, slot, status, actions; "Cancel" button emits `onCancel(bookingId)` callback; visually distinguish cancelled rows
    - _Requirements: Design §Component Responsibilities (BookingTable)_

  - [x] 16.5 Implement `BookingManagementPage.jsx`
    - Fetch all bookings via `adminService.getAllBookings()`; render `BookingTable`; on cancel call `adminService.cancelBooking(id)` then refresh list; show Toast on success/error
    - _Requirements: Design §Component Responsibilities (BookingManagementPage), Property 10_

  - [x] 16.6 Implement `DashboardPage.jsx`
    - Fetch stats via `adminService.getDashboard()`; display total users, venues, confirmed bookings as stat cards; show `LoadingSpinner` while fetching
    - _Requirements: Design §Component Responsibilities (DashboardPage)_

- [x] 17. Checkpoint — frontend complete
  - Ensure all frontend component and page tests pass.
  - Verify routing, auth guards, and API integration work end-to-end.
  - Ask the user if any questions arise.

- [x] 18. Integration tests
  - [x] 18.1 Write end-to-end flow: register → login → book → view history
    - Use `supertest` against a test MongoDB instance
    - Register user, login, create venue (as admin), book a slot, call `getMyBookings`, assert booking present
    - File: `backend/tests/integration/flows.test.js`
    - _Requirements: Design §Integration tests_

  - [x] 18.2 Write end-to-end flow: admin login → create venue → user books → admin cancels
    - Admin login, create venue, user books slot, admin cancels booking, assert slot availability returns "available"
    - File: `backend/tests/integration/flows.test.js`
    - _Requirements: Design §Integration tests, Property 10_

  - [ ]* 18.3 Write concurrent booking race condition test
    - Simulate two simultaneous booking requests for the same slot; assert exactly one succeeds (201) and the other fails (409); assert only one Booking document exists
    - File: `backend/tests/integration/flows.test.js`
    - _Requirements: Design §Booking Conflict Handling, Property 8_

- [x] 19. Final checkpoint — all tests pass
  - Run the full test suite (unit + property + integration + frontend).
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery.
- Each task references specific requirements and design sections for traceability.
- Property tests use `fast-check` with a minimum of 100 iterations per property (as specified in the design).
- All 11 correctness properties from the design are covered: P1–P4 in task 4.3, P5–P6 in task 3.3, P7–P9 in task 7.5, P10 in task 8.3, P11 in task 6.4.
- Backend tests use `jest` + `supertest` against an in-memory or test MongoDB instance.
- Frontend tests use React Testing Library.
- Multer uploads are stored in `backend/uploads/` and served as static files — no cloud storage required for the prototype.
- The compound unique index on `Booking(venue, date, slot)` is the last line of defence against race conditions; the application-level check in task 7.2 handles the common case.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["3.3", "4.3", "4.4"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "6.3"] },
    { "id": 7, "tasks": ["6.4", "6.5", "7.1", "7.2", "7.3"] },
    { "id": 8, "tasks": ["7.4"] },
    { "id": 9, "tasks": ["7.5", "7.6", "8.1", "8.2"] },
    { "id": 10, "tasks": ["8.3", "8.4", "9.1"] },
    { "id": 11, "tasks": ["11.1"] },
    { "id": 12, "tasks": ["12.1", "12.2"] },
    { "id": 13, "tasks": ["13.1", "13.2"] },
    { "id": 14, "tasks": ["13.3"] },
    { "id": 15, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5"] },
    { "id": 16, "tasks": ["15.1", "15.2", "15.3"] },
    { "id": 17, "tasks": ["15.4", "15.5", "16.1", "16.2"] },
    { "id": 18, "tasks": ["16.3", "16.4", "16.5", "16.6"] },
    { "id": 19, "tasks": ["18.1", "18.2"] },
    { "id": 20, "tasks": ["18.3"] }
  ]
}
```
