/**
 * Shared secret for internal HTTP-style calls (Dev 1 / Dev 3 simulators).
 * Header: X-Internal-Api-Key: <INTERNAL_API_KEY>
 */
function requireInternal(req, res, next) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    return res.status(503).json({
      success: false,
      message: "INTERNAL_API_KEY is not configured on server",
    });
  }
  const key = req.headers["x-internal-api-key"];
  if (!key || key !== expected) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

module.exports = { requireInternal };
