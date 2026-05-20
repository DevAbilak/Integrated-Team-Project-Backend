const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User-model.js");
const Referral = require("../models/Referral.js");
const LoyaltyTransaction = require("../models/LoyaltyTransaction.js");
const Booking = require("../models/Booking.js");
const { getSettings } = require("./platformSettings.service.js");

function generateCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function ensureReferralCode(userId) {
  let user = await User.findById(userId);
  if (!user) {
    return null;
  }
  if (!user.referralCode) {
    for (let i = 0; i < 5; i++) {
      const code = generateCode();
      const clash = await User.findOne({ referralCode: code });
      if (!clash) {
        user.referralCode = code;
        await user.save();
        break;
      }
    }
  }
  return user.referralCode;
}

/**
 * Called after registration with optional referral code.
 */
async function validateReferral({ newUserId, email, referralCode }) {
  const settings = await getSettings();
  if (!settings.features?.referralEnabled) {
    return { skipped: true };
  }
  if (!referralCode || !newUserId || !email) {
    return { skipped: true };
  }
  const code = String(referralCode).trim().toUpperCase();
  const referrer = await User.findOne({ referralCode: code });
  if (!referrer || String(referrer._id) === String(newUserId)) {
    return { valid: false, message: "Invalid referral code" };
  }

  const existing = await Referral.findOne({
    referredEmail: email.toLowerCase().trim(),
  });
  if (existing) {
    return { valid: false, message: "Referral already recorded for this email" };
  }

  await Referral.create({
    referrerId: referrer._id,
    referredEmail: email.toLowerCase().trim(),
    referredUserId: newUserId,
    status: "pending",
  });

  await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

  return { valid: true, referrerId: referrer._id };
}

/**
 * On first confirmed booking for referred user, award bonus points to both.
 */
async function completeReferralIfFirstBooking({ userId, bookingId }) {
  const settings = await getSettings();
  if (!settings.features?.referralEnabled) {
    return { skipped: true };
  }

  const user = await User.findById(userId);
  if (!user || !user.referredBy) {
    return { skipped: true };
  }

  const referral = await Referral.findOne({
    referredUserId: userId,
    status: "pending",
  });
  if (!referral) {
    return { skipped: true };
  }

  const confirmedCount = await Booking.countDocuments({
    userId,
    status: "confirmed",
  });
  if (confirmedCount !== 1) {
    return { skipped: true, reason: "not_first_booking" };
  }

  const bonus = settings.referralBonusPoints ?? 50;
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    referral.status = "completed";
    referral.completedBookingId = bookingId;
    await referral.save({ session });

    await User.findByIdAndUpdate(
      referral.referrerId,
      { $inc: { pointsBalance: bonus } },
      { session },
    );
    await User.findByIdAndUpdate(userId, { $inc: { pointsBalance: bonus } }, { session });

    await LoyaltyTransaction.create(
      [
        {
          userId: referral.referrerId,
          type: "bonus",
          points: bonus,
          referenceId: bookingId,
        },
        {
          userId,
          type: "bonus",
          points: bonus,
          referenceId: bookingId,
        },
      ],
      { session },
    );
  });
  session.endSession();

  return { completed: true, bonusPointsEach: bonus };
}

module.exports = {
  ensureReferralCode,
  validateReferral,
  completeReferralIfFirstBooking,
};
