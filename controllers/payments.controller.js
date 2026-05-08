const Payment = require("../models/Payment.js");
const Booking = require("../models/Booking.js");
const User = require("../models/User-model.js");
const {
  getBookingForUser,
  assertMaintenanceAllowsPayments,
  confirmBookingFromPayment,
  markPaymentFailed,
} = require("../services/booking.service.js");
const {
  createCheckoutSession,
  retrieveCheckoutSession,
  getStripe,
} = require("../services/stripePayments.service.js");
const {
  initializeTransaction,
  verifyTransaction,
} = require("../services/chapaPayments.service.js");

function isChapaVerifySuccess(remote) {
  if (!remote || remote.status !== "success" || !remote.data) {
    return false;
  }
  const st = String(remote.data.status || "").toLowerCase();
  return (
    st === "success" ||
    st === "successful" ||
    st === "completed" ||
    st === "paid"
  );
}

function publicBaseUrl(req) {
  if (process.env.PUBLIC_API_BASE_URL) {
    return process.env.PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  const host = req.get("host");
  const proto = req.protocol || "http";
  return `${proto}://${host}`;
}

async function getPaymentConfig(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
        chapaPublicKey: process.env.CHAPA_PUBLIC_KEY || "",
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: e.message || "Server error" });
  }
}

async function initiatePayment(req, res) {
  try {
    const { bookingId, method } = req.body || {};
    if (!bookingId || !method) {
      return res.status(400).json({
        success: false,
        message: "bookingId and method are required",
      });
    }
    if (!["stripe", "chapa"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'method must be "stripe" or "chapa"',
      });
    }

    await assertMaintenanceAllowsPayments();

    const booking = await getBookingForUser(bookingId, req.userId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    if (booking.status !== "pending_payment") {
      return res.status(400).json({
        success: false,
        message: "Booking is not awaiting payment",
      });
    }

    const user = await User.findById(req.userId);
    const currency = (booking.currency || "ETB").toUpperCase();
    const amount = booking.totalPrice;
    const base = publicBaseUrl(req);

    if (method === "stripe") {
      const successUrl = `${process.env.CLIENT_URL || base}/payments/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.CLIENT_URL || base}/payments/cancel`;

      const { sessionId, url } = await createCheckoutSession({
        bookingId: booking._id,
        amountEtb: amount,
        customerEmail: user?.email,
        successUrl,
        cancelUrl,
      });

      const payment = await Payment.create({
        bookingId: booking._id,
        userId: req.userId,
        method: "stripe",
        transactionId: sessionId,
        status: "pending",
        amount,
        currency,
      });

      return res.status(200).json({
        success: true,
        data: { paymentUrl: url, transactionId: sessionId },
      });
    }

    const txRef = `tour_${booking._id}_${Date.now()}`;
    const callbackUrl = `${base}/api/payments/webhook/chapa`;
    const returnUrl = `${process.env.CLIENT_URL || base}/payments/return?tx_ref=${encodeURIComponent(txRef)}`;

    const chapa = await initializeTransaction({
      txRef,
      amount,
      currency,
      email: user?.email || "customer@example.com",
      firstName: user?.name?.split?.(" ")?.[0] || "Customer",
      lastName: user?.name?.split?.(" ")?.slice(1).join(" ") || "User",
      callbackUrl,
      returnUrl,
    });

    await Payment.create({
      bookingId: booking._id,
      userId: req.userId,
      method: "chapa",
      transactionId: txRef,
      status: "pending",
      amount,
      currency,
      rawMetadata: chapa.raw,
    });

    return res.status(200).json({
      success: true,
      data: { paymentUrl: chapa.checkoutUrl, transactionId: txRef },
    });
  } catch (e) {
    console.error("initiatePayment", e);
    const code = e.statusCode && Number(e.statusCode) >= 400 ? e.statusCode : 500;
    return res.status(code).json({
      success: false,
      message: e.message || "Payment initiation failed",
    });
  }
}

async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET missing — webhook verification skipped");
  }

  let event;
  try {
    const stripe = getStripe();
    if (whSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
    } else {
      event = JSON.parse(req.body.toString("utf8"));
    }
  } catch (err) {
    console.error("Stripe webhook signature error", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId =
        session.client_reference_id || session.metadata?.bookingId;
      if (bookingId) {
        const payment = await Payment.findOne({
          transactionId: session.id,
          method: "stripe",
        });
        await confirmBookingFromPayment({
          bookingId,
          transactionId: session.id,
          method: "stripe",
          paymentDocId: payment?._id,
        });
      }
    }
    return res.json({ received: true });
  } catch (e) {
    console.error("Stripe webhook handler", e);
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function handleChapaWebhook(req, res) {
  try {
    const body = req.body || {};
    const txRef =
      body.tx_ref ||
      body.txRef ||
      body.data?.tx_ref ||
      body["meta[tx_ref]"];

    if (!txRef) {
      return res.status(400).json({ success: false, message: "Missing tx_ref" });
    }

    const remote = await verifyTransaction(txRef);
    const ok = isChapaVerifySuccess(remote);

    const payment = await Payment.findOne({
      transactionId: txRef,
      method: "chapa",
    });

    if (ok && payment) {
      await confirmBookingFromPayment({
        bookingId: payment.bookingId,
        transactionId: txRef,
        method: "chapa",
        paymentDocId: payment._id,
      });
    } else if (payment && !ok) {
      await markPaymentFailed(payment.bookingId, txRef);
    }

    return res.status(200).json({ success: true, data: { received: true } });
  } catch (e) {
    console.error("Chapa webhook", e);
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function adminConfirmPayment(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    const payment = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });
    await confirmBookingFromPayment({
      bookingId,
      transactionId: payment?.transactionId || `admin_${Date.now()}`,
      method: payment?.method || "manual",
      paymentDocId: payment?._id,
    });
    return res.status(200).json({
      success: true,
      data: { bookingId, confirmed: true },
    });
  } catch (e) {
    const code = e.statusCode === 404 ? 404 : 500;
    return res.status(code).json({
      success: false,
      message: e.message || "Confirm failed",
    });
  }
}

async function getPaymentStatus(req, res) {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId, userId: req.userId }).sort({
      createdAt: -1,
    });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment record for this booking",
      });
    }

    let details = { stored: payment.status };

    if (payment.method === "stripe") {
      const session = await retrieveCheckoutSession(payment.transactionId);
      const map =
        session.payment_status === "paid"
          ? "succeeded"
          : session.status === "expired"
            ? "failed"
            : "pending";
      details.gateway = {
        payment_status: session.payment_status,
        status: session.status,
      };
      return res.status(200).json({
        success: true,
        data: { status: map, details },
      });
    }

    const remote = await verifyTransaction(payment.transactionId);
    const ok = isChapaVerifySuccess(remote);
    const st = ok ? "succeeded" : payment.status === "failed" ? "failed" : "pending";
    details.gateway = remote?.data || remote;
    return res.status(200).json({
      success: true,
      data: { status: st, details },
    });
  } catch (e) {
    console.error("getPaymentStatus", e);
    return res.status(500).json({
      success: false,
      message: e.message || "Status check failed",
    });
  }
}

module.exports = {
  getPaymentConfig,
  initiatePayment,
  handleStripeWebhook,
  handleChapaWebhook,
  adminConfirmPayment,
  getPaymentStatus,
};
