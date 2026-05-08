const Booking = require("../models/Booking");
const Venue = require("../models/Venue");

// GET /api/bookings/slots/:venueId?date=YYYY-MM-DD
const getSlots = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { date } = req.query;

    if (!venueId || !date) {
      return res.status(400).json({ message: "venueId and date are required" });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const confirmedBookings = await Booking.find({
      venue: venueId,
      date,
      status: "confirmed",
    });

    const bookedSlots = new Set(confirmedBookings.map((b) => b.slot));

    const slots = venue.slots.map((slot) => ({
      slot,
      status: bookedSlots.has(slot) ? "booked" : "available",
    }));

    return res.status(200).json({ slots });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { venueId, date, slot } = req.body;

    if (!venueId || !date || !slot) {
      return res.status(400).json({ message: "venueId, date, and slot are required" });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Application-level conflict check
    const existing = await Booking.findOne({
      venue: venueId,
      date,
      slot,
      status: "confirmed",
    });
    if (existing) {
      return res.status(409).json({ message: "Slot already booked for this venue and date" });
    }

    const booking = await Booking.create({
      user: req.userId,
      venue: venueId,
      date,
      slot,
      status: "confirmed",
    });

    return res.status(201).json({ booking });
  } catch (err) {
    // MongoDB duplicate key error (race condition fallback)
    if (err.code === 11000) {
      return res.status(409).json({ message: "Slot already booked for this venue and date" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate("venue", "name sportsType location imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getSlots, createBooking, getMyBookings };
