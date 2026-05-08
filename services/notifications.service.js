const { sendEmail: sendEmailBrevo } = require("../utils/email.service.js");

/**
 * Demo notification: always logs with [EMAIL] prefix. Optionally sends via Brevo when configured.
 * @param {string} to
 * @param {string} subject
 * @param {string} text - plain text body
 */
async function sendEmail(to, subject, text) {
  const body = text == null ? "" : String(text);
  console.log("[EMAIL] ─────────────────────────────────────────");
  console.log("[EMAIL] To:", to);
  console.log("[EMAIL] Subject:", subject);
  console.log("[EMAIL] Body:\n" + body);
  console.log("[EMAIL] ─────────────────────────────────────────");

  if (process.env.BREVO_API_KEY && process.env.EMAIL_FROM) {
    const html = `<pre style="font-family:system-ui,sans-serif">${escapeHtml(body)}</pre>`;
    try {
      await sendEmailBrevo(to, subject, html);
    } catch (e) {
      console.warn("[EMAIL] Optional Brevo send failed:", e.message);
    }
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendBookingConfirmedEmail(user, booking, tourTitle) {
  const lines = [
    `Hi ${user.name},`,
    "",
    "Your booking is confirmed.",
    "",
    `Tour: ${tourTitle || "N/A"}`,
    `Travel date: ${booking.travelDate}`,
    `Travelers: ${booking.numTravelers}`,
    `Total paid: ${booking.totalPrice} ${booking.currency || "ETB"}`,
    `Booking ID: ${booking._id}`,
    "",
    "Thank you for choosing Touropia.",
  ];
  await sendEmail(user.email, "Booking confirmed", lines.join("\n"));
}

async function sendBookingCancellationEmail(user, booking, tourTitle) {
  const lines = [
    `Hi ${user.name},`,
    "",
    "Your booking has been cancelled.",
    "",
    `Tour: ${tourTitle || "N/A"}`,
    `Travel date: ${booking.travelDate}`,
    `Booking ID: ${booking._id}`,
  ];
  await sendEmail(user.email, "Booking cancelled", lines.join("\n"));
}

/** Optional: operator notified when tour is approved (hook for Dev 2). */
async function sendOperatorTourApprovedEmail(operatorUser, tourTitle) {
  const lines = [
    `Hi ${operatorUser.name},`,
    "",
    `Your tour "${tourTitle || "Tour"}" has been approved and is live.`,
  ];
  await sendEmail(operatorUser.email, "Tour approved", lines.join("\n"));
}

module.exports = {
  sendEmail,
  sendBookingConfirmedEmail,
  sendBookingCancellationEmail,
  sendOperatorTourApprovedEmail,
};
