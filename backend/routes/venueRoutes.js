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

// Use Cloudinary upload if configured, otherwise fall back to no-op
let upload;
try {
  const cloudinaryConfig = require('../config/cloudinary');
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    upload = cloudinaryConfig.upload;
  }
} catch (e) {}

// Fallback: no-op middleware if Cloudinary not configured
const uploadMiddleware = upload
  ? upload.single('image')
  : (req, res, next) => next();

// ── Public-ish (requires valid JWT) ──────────────────────────────────────────
router.get('/',    verifyToken, getAllVenues);
router.get('/:id', verifyToken, getVenueById);

// ── Admin-only ────────────────────────────────────────────────────────────────
router.post(  '/',    verifyToken, requireAdmin, uploadMiddleware, createVenue);
router.put(   '/:id', verifyToken, requireAdmin, uploadMiddleware, updateVenue);
router.delete('/:id', verifyToken, requireAdmin, deleteVenue);

module.exports = router;
