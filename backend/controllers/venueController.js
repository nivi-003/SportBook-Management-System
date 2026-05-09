const Venue = require("../models/Venue");

/**
 * Get all venues
 * @route GET /api/venues
 */
exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get venue by ID
 * @route GET /api/venues/:id
 */
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new venue
 * @route POST /api/venues
 */
exports.createVenue = async (req, res) => {
  try {
    const {
      name,
      sportsType,
      location,
      pricePerHour,
      description,
      slots,
    } = req.body;

    // Validate required fields
    if (!name || !sportsType || !location || pricePerHour === undefined) {
      return res.status(400).json({
        message:
          "Missing required fields: name, sportsType, location, pricePerHour",
      });
    }

    // Image URL handling
    const imageUrl = req.file
      ? req.file.path
      : req.body.imageUrl || "";

    // Parse slots
    let parsedSlots = [];

    if (slots) {
      if (typeof slots === "string") {
        try {
          parsedSlots = JSON.parse(slots);
        } catch (e) {
          parsedSlots = [slots];
        }
      } else if (Array.isArray(slots)) {
        parsedSlots = slots;
      }
    }

    // Create venue
    const venue = new Venue({
      name,
      sportsType,
      location,
      pricePerHour,
      description: description || "",
      imageUrl,
      slots: parsedSlots,
    });

    const createdVenue = await venue.save();

    res.status(201).json(createdVenue);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update venue by ID
 * @route PUT /api/venues/:id
 */
exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const {
      name,
      sportsType,
      location,
      pricePerHour,
      description,
      slots,
    } = req.body;

    if (name !== undefined) venue.name = name;
    if (sportsType !== undefined) venue.sportsType = sportsType;
    if (location !== undefined) venue.location = location;
    if (pricePerHour !== undefined) venue.pricePerHour = pricePerHour;
    if (description !== undefined) venue.description = description;

    // Parse slots
    if (slots !== undefined) {
      if (typeof slots === "string") {
        try {
          venue.slots = JSON.parse(slots);
        } catch (e) {
          venue.slots = [slots];
        }
      } else if (Array.isArray(slots)) {
        venue.slots = slots;
      }
    }

    // Image update
    if (req.file) {
      venue.imageUrl = req.file.path;
    } else if (req.body.imageUrl !== undefined) {
      venue.imageUrl = req.body.imageUrl;
    }

    const updatedVenue = await venue.save();

    res.status(200).json(updatedVenue);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete venue by ID
 * @route DELETE /api/venues/:id
 */
exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    await venue.deleteOne();

    res.status(200).json({ message: "Venue deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};