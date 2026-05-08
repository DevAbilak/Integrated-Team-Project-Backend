const mongoose = require("mongoose");
const User = require("../models/User-model.js");
const LoyaltyTransaction = require("../models/LoyaltyTransaction.js");
const { getSettings } = require("./platformSettings.service.js");

/**
 * Award points after a confirmed payment. Idempotent per booking (one earn per booking).
 */
async function earnLoyaltyPoints({ userId, bookingId, amountPaid }) {
  if (!userId || !bookingId || amountPaid == null) {
    throw new Error("userId, bookingId, and amountPaid are required");
  }
  const settings = await getSettings();
  const perBirr = Math.max(1, settings.loyaltyPointsPerBirr || 100);
  const points = Math.floor(Number(amountPaid) / perBirr);
  if (points <= 0) {
    return { points: 0, user: await User.findById(userId).select("-password") };
  }

  const existing = await LoyaltyTransaction.findOne({
    userId,
    referenceId: bookingId,
    type: "earn",
  });
  if (existing) {
    const user = await User.findById(userId).select("-password");
    return { points: existing.points, user, duplicate: true };
  }

  const session = await mongoose.startSession();
  let result;
  await session.withTransaction(async () => {
    await User.findByIdAndUpdate(
      userId,
      { $inc: { pointsBalance: points } },
      { session },
    );
    await LoyaltyTransaction.create(
      [
        {
          userId,
          type: "earn",
          points,
          referenceId: bookingId,
        },
      ],
      { session },
    );
    result = { points };
  });
  session.endSession();

  const user = await User.findById(userId).select("-password");
  return { ...result, user };
}

async function getPointsBalance(userId) {
  const user = await User.findById(userId).select("pointsBalance name email");
  if (!user) {
    return null;
  }
  return { pointsBalance: user.pointsBalance ?? 0 };
}

/**
 * 1 loyalty point = 1 ETB discount (per spec).
 */
async function redeemPointsOnBooking({ userId, bookingId, pointsToRedeem }) {
  const Booking = require("../models/Booking.js");
  const points = Math.floor(Number(pointsToRedeem));
  if (!bookingId || points <= 0) {
    const err = new Error("bookingId and positive pointsToRedeem are required");
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking || String(booking.userId) !== String(userId)) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (booking.status !== "pending_payment") {
    const err = new Error("Loyalty redeem is only allowed for pending_payment bookings");
    err.statusCode = 400;
    throw err;
  }
  if (booking.loyaltyPointsRedeemed > 0) {
    const err = new Error("Points already applied to this booking");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user || (user.pointsBalance ?? 0) < points) {
    const err = new Error("Insufficient points");
    err.statusCode = 400;
    throw err;
  }

  const maxDiscount = Math.min(points, booking.totalPrice, user.pointsBalance);
  if (maxDiscount <= 0) {
    const err = new Error("Nothing to redeem");
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    await User.findByIdAndUpdate(
      userId,
      { $inc: { pointsBalance: -maxDiscount } },
      { session },
    );
    await LoyaltyTransaction.create(
      [
        {
          userId,
          type: "redeem",
          points: -maxDiscount,
          referenceId: bookingId,
        },
      ],
      { session },
    );
    booking.totalPrice = Math.max(0, booking.totalPrice - maxDiscount);
    booking.loyaltyPointsRedeemed = maxDiscount;
    booking.loyaltyDiscountApplied = maxDiscount;
    await booking.save({ session });
  });
  session.endSession();

  const updated = await Booking.findById(bookingId);
  const updatedUser = await User.findById(userId).select("-password");
  return { booking: updated, user: updatedUser, pointsRedeemed: maxDiscount };
}

module.exports = {
  earnLoyaltyPoints,
  getPointsBalance,
  redeemPointsOnBooking,
};
