const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");

/**
 * GET /api/admin/dashboard
 * Returns aggregate counts for users, venues, and bookings.
 */
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalVenues, totalBookings] = await Promise.all([
      User.countDocuments(),
      Venue.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.status(200).json({ totalUsers, totalVenues, totalBookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/admin/bookings
 * Returns all bookings with populated user and venue details, newest first.
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name mobile")
      .populate("venue", "name sportsType location")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * PATCH /api/admin/bookings/:id/cancel
 * Cancels a booking by ID.
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(409).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getDashboard, getAllBookings, cancelBooking };
