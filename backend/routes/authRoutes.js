const express = require('express');
const router = express.Router();
const { register, login, adminLogin, checkMobile, resetPassword } = require('../controllers/authController');

// All auth routes are public — no auth middleware required

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

// POST /api/auth/check-mobile
router.post('/check-mobile', checkMobile);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
