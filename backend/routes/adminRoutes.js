const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');
const { getDashboard, getAllBookings, cancelBooking } = require('../controllers/adminController');

// All admin routes require a valid JWT and admin role
router.use(verifyToken, requireAdmin);

// GET /api/admin/dashboard — aggregate stats
router.get('/dashboard', getDashboard);

// GET /api/admin/bookings — all bookings with user + venue details
router.get('/bookings', getAllBookings);

// PATCH /api/admin/bookings/:id/cancel — cancel a booking
router.patch('/bookings/:id/cancel', cancelBooking);

module.exports = router;
