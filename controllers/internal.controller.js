const {
  confirmBookingFromPayment,
  markPaymentFailed,
} = require("../services/booking.service.js");

/**
 * Dev 3 contract: POST /internal/update-booking-status
 * Body: { bookingId, status: "success" | "failed" | "confirmed", transactionId?, method? }
 */
async function updateBookingStatus(req, res) {
  try {
    const { bookingId, status, transactionId, method } = req.body || {};
    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "bookingId and status are required",
      });
    }
    const s = String(status).toLowerCase();
    if (["success", "confirmed", "paid"].includes(s)) {
      await confirmBookingFromPayment({
        bookingId,
        transactionId: transactionId || `internal_${Date.now()}`,
        method: method || "internal",
      });
    } else if (["failed", "payment_failed"].includes(s)) {
      if (transactionId) {
        await markPaymentFailed(bookingId, transactionId);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported status value",
      });
    }
    return res.status(200).json({ success: true, data: { updated: true } });
  } catch (e) {
    const code = e.statusCode === 404 ? 404 : 500;
    return res.status(code).json({
      success: false,
      message: e.message || "Internal update failed",
    });
  }
}

module.exports = { updateBookingStatus };
