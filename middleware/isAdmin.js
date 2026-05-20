const User = require("../models/User-model");

const isAdmin = async (req, res, next) => {
  if (!req.userId) {
    return res
      .status(400)
      .json({ success: false, message: "Can't find user in request" });
  }
  const user = await User.findById(req.userId);
  if (!user || user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admin only." });
  }
  next();
};

module.exports = { isAdmin };
