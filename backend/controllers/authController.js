const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Public — creates a new user account.
 *
 * Body: { name, mobile, password }
 * Returns 201 with { token, user: { _id, name, role } }
 * Returns 400 if validation fails
 * Returns 409 if mobile is already registered
 */
async function register(req, res) {
  try {
    const { name, mobile, password } = req.body;

    // --- Required field validation ---
    if (!name || !mobile || !password) {
      return res.status(400).json({ message: "Name, mobile, and password are required." });
    }

    // --- Mobile format: exactly 10 numeric digits ---
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Mobile must be a 10-digit numeric value." });
    }

    // --- Password length: minimum 8 characters ---
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    // --- Uniqueness check ---
    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Create user with role "user" ---
    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      role: "user",
    });

    // --- Sign JWT (24h expiry) ---
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    // Safety net: catch MongoDB duplicate key error from race conditions
    if (err.code === 11000) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }
    throw err;
  }
}

/**
 * POST /api/auth/login
 * Public — authenticates a regular user.
 *
 * Body: { mobile, password }
 * Returns 200 with { token, user: { _id, name, role } }
 * Returns 401 if credentials are invalid
 */
async function login(req, res) {
  try {
    const { mobile, password } = req.body;

    // --- Find user by mobile ---
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- Verify password ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- Sign JWT (24h expiry) ---
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      token,
      user: { _id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/auth/admin/login
 * Public — authenticates an admin user.
 *
 * Body: { mobile, password }
 * Returns 200 with { token, user: { _id, name, role } }
 * Returns 401 if credentials are invalid
 * Returns 403 if the user is not an admin
 */
async function adminLogin(req, res) {
  try {
    const { mobile, password } = req.body;

    // --- Find user by mobile ---
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- Verify password ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- Role check ---
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // --- Sign JWT (1h expiry for admin sessions) ---
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      user: { _id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/auth/check-mobile
 * Public — checks if a mobile number is registered.
 */
async function checkMobile(req, res) {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "Mobile number not found. Please register first." });
    }
    return res.status(200).json({ message: "Mobile found" });
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/auth/reset-password
 * Public — resets password for a registered mobile number.
 */
async function resetPassword(req, res) {
  try {
    const { mobile, newPassword } = req.body;
    if (!mobile || !newPassword) {
      return res.status(400).json({ message: "Mobile and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "Mobile number not found." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    throw err;
  }
}

module.exports = { register, login, adminLogin, checkMobile, resetPassword };
