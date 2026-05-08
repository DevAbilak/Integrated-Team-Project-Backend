const Booking = require("../models/Booking.js");
const User = require("../models/User-model.js");
const Payment = require("../models/Payment.js");
const { getSettings } = require("./platformSettings.service.js");
const {
  sendBookingConfirmedEmail,
  sendBookingCancellationEmail,
} = require("./notifications.service.js");
const { earnLoyaltyPoints } = require("./loyalty.service.js");
const { completeReferralIfFirstBooking } = require("./referrals.service.js");

async function getBookingForUser(bookingId, userId) {
  return Booking.findOne({ _id: bookingId, userId }).populate("packageId");
}

async function assertMaintenanceAllowsPayments() {
  const settings = await getSettings();
  if (settings.maintenanceMode) {
    const err = new Error("Platform is in maintenance mode. New payments are disabled.");
    err.statusCode = 503;
    throw err;
  }
}

/**
 * Mark booking paid and confirmed; notify user; loyalty + referral hooks.
 */
async function confirmBookingFromPayment({
  bookingId,
  transactionId,
  method,
  paymentDocId,
}) {
  const booking = await Booking.findById(bookingId).populate("packageId");
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (booking.status === "confirmed") {
    if (paymentDocId) {
      await Payment.findByIdAndUpdate(paymentDocId, { status: "succeeded" });
    }
    return { alreadyConfirmed: true, booking };
  }

  booking.status = "confirmed";
  booking.paymentReference = transactionId;
  await booking.save();

  if (paymentDocId) {
    await Payment.findByIdAndUpdate(paymentDocId, {
      status: "succeeded",
      updatedAt: new Date(),
    });
  } else {
    await Payment.updateMany(
      { bookingId, transactionId, status: "pending" },
      { status: "succeeded", updatedAt: new Date() },
    );
  }

  const user = await User.findById(booking.userId);
  const tourTitle =
    booking.packageId && booking.packageId.title
      ? booking.packageId.title
      : undefined;
  if (user) {
    await sendBookingConfirmedEmail(user, booking, tourTitle);
  }

  try {
    await earnLoyaltyPoints({
      userId: booking.userId,
      bookingId: booking._id,
      amountPaid: booking.totalPrice,
    });
  } catch (e) {
    console.warn("[loyalty] earn after payment failed:", e.message);
  }

  try {
    await completeReferralIfFirstBooking({
      userId: booking.userId,
      bookingId: booking._id,
    });
  } catch (e) {
    console.warn("[referral] complete failed:", e.message);
  }

  return { booking };
}

async function markPaymentFailed(bookingId, transactionId) {
  await Payment.updateMany(
    { bookingId, transactionId, status: "pending" },
    { status: "failed", updatedAt: new Date() },
  );
}

/**
 * Cancel a booking and notify (import from booking/cancellation flows).
 */
async function cancelBookingAndNotify(bookingId, userId) {
  const booking = await Booking.findOne({ _id: bookingId, userId }).populate(
    "packageId",
  );
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  booking.status = "cancelled";
  await booking.save();
  const user = await User.findById(userId);
  const tourTitle =
    booking.packageId && booking.packageId.title
      ? booking.packageId.title
      : undefined;
  if (user) {
    await sendBookingCancellationEmail(user, booking, tourTitle);
  }
  return { booking };
}

module.exports = {
  getBookingForUser,
  assertMaintenanceAllowsPayments,
  confirmBookingFromPayment,
  markPaymentFailed,
  cancelBookingAndNotify,
};
