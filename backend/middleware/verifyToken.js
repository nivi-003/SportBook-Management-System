const jwt = require("jsonwebtoken");

/**
 * verifyToken middleware
 *
 * Extracts the JWT from the Authorization header (Bearer scheme),
 * verifies it against JWT_SECRET, and attaches req.userId and req.role
 * from the decoded payload before calling next().
 *
 * Returns 401 if the header is absent, malformed, or the token is
 * invalid / expired.
 */
module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Header must be present and follow "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    // Covers TokenExpiredError, JsonWebTokenError, NotBeforeError, etc.
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
