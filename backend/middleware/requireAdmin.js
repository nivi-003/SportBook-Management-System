/**
 * requireAdmin middleware
 *
 * Must be used after verifyToken, which sets req.role from the decoded JWT.
 * Allows the request to proceed only if req.role === "admin".
 * Returns 403 Forbidden for any other role.
 */
module.exports = function requireAdmin(req, res, next) {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
