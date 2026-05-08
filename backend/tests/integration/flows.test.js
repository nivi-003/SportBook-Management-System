/**
 * Integration tests — Sports Venue Booking System
 *
 * Uses supertest against the Express app with an in-memory MongoDB instance
 * (mongodb-memory-server) so no real database connection is required.
 *
 * Flows covered:
 *   Flow 1: register → login → book → view history
 *   Flow 2: admin login → create venue → user books → admin cancels → slot available
 *   Flow 3: concurrent booking race condition (two requests for the same slot)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const Venue = require('../../models/Venue');
const Booking = require('../../models/Booking');
const bcrypt = require('bcryptjs');

let mongod;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function seedAdmin() {
  const hashed = await bcrypt.hash('adminpass123', 10);
  return User.create({
    name: 'Admin User',
    mobile: '9000000001',
    password: hashed,
    role: 'admin',
  });
}

async function seedVenue(overrides = {}) {
  return Venue.create({
    name: 'Test Turf',
    sportsType: 'Football Turf',
    location: 'Chennai',
    pricePerHour: 500,
    slots: ['06:00-07:00', '07:00-08:00', '08:00-09:00'],
    ...overrides,
  });
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clean all collections between tests
  await Promise.all([
    User.deleteMany({}),
    Venue.deleteMany({}),
    Booking.deleteMany({}),
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// ── Flow 1: register → login → book → view history ───────────────────────────

describe('Flow 1: register → login → book → view history', () => {
  it('completes the full user booking flow', async () => {
    // 1. Seed a venue
    const venue = await seedVenue();

    // 2. Register a new user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', mobile: '9876543210', password: 'password123' });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeDefined();
    const userToken = registerRes.body.token;

    // 3. Login with the same credentials
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ mobile: '9876543210', password: 'password123' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    const token = loginRes.body.token;

    // 4. Check slot availability — all slots should be available
    const slotsRes = await request(app)
      .get(`/api/bookings/slots/${venue._id}`)
      .query({ date: '2025-09-01' })
      .set('Authorization', `Bearer ${token}`);

    expect(slotsRes.status).toBe(200);
    expect(slotsRes.body.slots).toHaveLength(3);
    expect(slotsRes.body.slots[0].status).toBe('available');

    // 5. Book a slot
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ venueId: venue._id, date: '2025-09-01', slot: '06:00-07:00' });

    expect(bookRes.status).toBe(201);
    expect(bookRes.body.booking.status).toBe('confirmed');
    expect(bookRes.body.booking.slot).toBe('06:00-07:00');

    // 6. Slot should now show as booked
    const slotsAfterRes = await request(app)
      .get(`/api/bookings/slots/${venue._id}`)
      .query({ date: '2025-09-01' })
      .set('Authorization', `Bearer ${token}`);

    const bookedSlot = slotsAfterRes.body.slots.find((s) => s.slot === '06:00-07:00');
    expect(bookedSlot.status).toBe('booked');

    // 7. View booking history — booking should appear
    const historyRes = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.bookings).toHaveLength(1);
    expect(historyRes.body.bookings[0].slot).toBe('06:00-07:00');
    expect(historyRes.body.bookings[0].status).toBe('confirmed');
    expect(historyRes.body.bookings[0].venue.name).toBe('Test Turf');
  });
});

// ── Flow 2: admin login → create venue → user books → admin cancels ───────────

describe('Flow 2: admin login → create venue → user books → admin cancels', () => {
  it('admin can cancel a booking and the slot becomes available again', async () => {
    // 1. Seed admin
    await seedAdmin();

    // 2. Admin login
    const adminLoginRes = await request(app)
      .post('/api/auth/admin/login')
      .send({ mobile: '9000000001', password: 'adminpass123' });

    expect(adminLoginRes.status).toBe(200);
    const adminToken = adminLoginRes.body.token;

    // 3. Admin creates a venue
    const createVenueRes = await request(app)
      .post('/api/venues')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Admin Venue')
      .field('sportsType', 'Badminton Court')
      .field('location', 'Bangalore')
      .field('pricePerHour', '300')
      .field('slots', JSON.stringify(['10:00-11:00', '11:00-12:00']));

    expect(createVenueRes.status).toBe(201);
    const venueId = createVenueRes.body._id;

    // 4. Register a regular user
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', mobile: '9111111111', password: 'bobpass123' });

    expect(regRes.status).toBe(201);
    const userToken = regRes.body.token;

    // 5. User books a slot
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ venueId, date: '2025-10-01', slot: '10:00-11:00' });

    expect(bookRes.status).toBe(201);
    const bookingId = bookRes.body.booking._id;

    // 6. Admin views all bookings
    const allBookingsRes = await request(app)
      .get('/api/admin/bookings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(allBookingsRes.status).toBe(200);
    expect(allBookingsRes.body.bookings).toHaveLength(1);

    // 7. Admin cancels the booking
    const cancelRes = await request(app)
      .patch(`/api/admin/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.booking.status).toBe('cancelled');

    // 8. Slot should now be available again
    const slotsRes = await request(app)
      .get(`/api/bookings/slots/${venueId}`)
      .query({ date: '2025-10-01' })
      .set('Authorization', `Bearer ${userToken}`);

    expect(slotsRes.status).toBe(200);
    const slot = slotsRes.body.slots.find((s) => s.slot === '10:00-11:00');
    expect(slot.status).toBe('available');
  });
});

// ── Flow 3: concurrent booking race condition ─────────────────────────────────

describe('Flow 3: concurrent booking — same slot, two simultaneous requests', () => {
  it('only one booking succeeds and the other gets 409', async () => {
    // 1. Seed venue and two users
    const venue = await seedVenue();

    const [reg1, reg2] = await Promise.all([
      request(app)
        .post('/api/auth/register')
        .send({ name: 'User1', mobile: '9200000001', password: 'pass1234a' }),
      request(app)
        .post('/api/auth/register')
        .send({ name: 'User2', mobile: '9200000002', password: 'pass1234b' }),
    ]);

    expect(reg1.status).toBe(201);
    expect(reg2.status).toBe(201);

    const token1 = reg1.body.token;
    const token2 = reg2.body.token;

    // 2. Fire two simultaneous booking requests for the same slot
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token1}`)
        .send({ venueId: venue._id, date: '2025-11-01', slot: '06:00-07:00' }),
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token2}`)
        .send({ venueId: venue._id, date: '2025-11-01', slot: '06:00-07:00' }),
    ]);

    const statuses = [res1.status, res2.status].sort();

    // Exactly one should succeed (201) and one should fail (409)
    expect(statuses).toEqual([201, 409]);

    // 3. Only one Booking document should exist in the DB
    const count = await Booking.countDocuments({
      venue: venue._id,
      date: '2025-11-01',
      slot: '06:00-07:00',
      status: 'confirmed',
    });
    expect(count).toBe(1);
  });
});
