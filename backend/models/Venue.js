const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sportsType: {
      type: String,
      required: true,
      enum: ["Football Turf", "Cricket Ground", "Badminton Court", "Tennis Court"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "", // relative path served as static
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    slots: [{ type: String }], // e.g. ["06:00-07:00", "07:00-08:00", ...]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", VenueSchema);
