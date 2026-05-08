const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getSlots, createBooking, getMyBookings } = require('../controllers/bookingController');

// GET /api/bookings/slots/:venueId?date=YYYY-MM-DD — protected
router.get('/slots/:venueId', verifyToken, getSlots);

// GET /api/bookings/my — protected
// IMPORTANT: must be defined BEFORE /:id to avoid Express matching "my" as an :id param
router.get('/my', verifyToken, getMyBookings);

// POST /api/bookings — protected
router.post('/', verifyToken, createBooking);

module.exports = router;
