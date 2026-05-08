const {
  ensureReferralCode,
  validateReferral,
  completeReferralIfFirstBooking,
} = require("../services/referrals.service.js");

async function generate(req, res) {
  try {
    const code = await ensureReferralCode(req.userId);
    if (!code) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const base = process.env.CLIENT_URL || "";
    return res.status(200).json({
      success: true,
      data: {
        referralCode: code,
        referralLink: base ? `${base}/signup?ref=${code}` : null,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Failed to generate referral",
    });
  }
}

async function validate(req, res) {
  try {
    const { newUserId, email, referralCode } = req.body || {};
    if (!newUserId || !email) {
      return res.status(400).json({
        success: false,
        message: "newUserId and email are required",
      });
    }
    const result = await validateReferral({ newUserId, email, referralCode });
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Referral validate failed",
    });
  }
}

async function complete(req, res) {
  try {
    const { userId, bookingId } = req.body || {};
    if (!userId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "userId and bookingId are required",
      });
    }
    const result = await completeReferralIfFirstBooking({ userId, bookingId });
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Referral complete failed",
    });
  }
}

module.exports = { generate, validate, complete };
