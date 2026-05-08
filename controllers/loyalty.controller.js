const { earnLoyaltyPoints, getPointsBalance, redeemPointsOnBooking } = require("../services/loyalty.service.js");

async function earn(req, res) {
  try {
    const { userId, bookingId, amountPaid } = req.body || {};
    if (!userId || !bookingId || amountPaid == null) {
      return res.status(400).json({
        success: false,
        message: "userId, bookingId, and amountPaid are required",
      });
    }
    const result = await earnLoyaltyPoints({ userId, bookingId, amountPaid });
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Loyalty earn failed",
    });
  }
}

async function balance(req, res) {
  try {
    const row = await getPointsBalance(req.userId);
    if (!row) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: row });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Failed to read balance",
    });
  }
}

async function redeem(req, res) {
  try {
    const { bookingId, pointsToRedeem } = req.body || {};
    const result = await redeemPointsOnBooking({
      userId: req.userId,
      bookingId,
      pointsToRedeem,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      success: false,
      message: e.message || "Redeem failed",
    });
  }
}

module.exports = { earn, balance, redeem };
