const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    date: {
      type: String,
      required: true, // "YYYY-MM-DD"
    },
    slot: {
      type: String,
      required: true, // "HH:MM-HH:MM"
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate bookings at the DB layer
BookingSchema.index({ venue: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model("Booking", BookingSchema);
