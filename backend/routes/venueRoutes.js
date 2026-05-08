const express = require('express');
const router = express.Router();

const {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');

const verifyToken   = require('../middleware/verifyToken');
const requireAdmin  = require('../middleware/requireAdmin');
const upload        = require('../middleware/upload');

// ── Public-ish (requires valid JWT) ──────────────────────────────────────────
router.get('/',    verifyToken, getAllVenues);
router.get('/:id', verifyToken, getVenueById);

// ── Admin-only ────────────────────────────────────────────────────────────────
router.post(  '/',    verifyToken, requireAdmin, upload.single('image'), createVenue);
router.put(   '/:id', verifyToken, requireAdmin, upload.single('image'), updateVenue);
router.delete('/:id', verifyToken, requireAdmin, deleteVenue);

module.exports = router;
