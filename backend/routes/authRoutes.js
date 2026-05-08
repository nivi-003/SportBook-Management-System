const express = require('express');
const router = express.Router();
const { register, login, adminLogin } = require('../controllers/authController');

// All auth routes are public — no auth middleware required

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

module.exports = router;
