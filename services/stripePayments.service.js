const Stripe = require("stripe");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

/**
 * Stripe expects smallest currency unit. ETB uses 2 decimals.
 * If STRIPE_CHECKOUT_CURRENCY=usd, converts ETB → USD using STRIPE_ETB_PER_USD (default 150).
 */
function buildStripeCheckoutAmounts(totalEtb) {
  const currency = (process.env.STRIPE_CHECKOUT_CURRENCY || "etb")
    .toLowerCase()
    .trim();
  const etb = Math.round(Number(totalEtb) * 100) / 100;
  const etbMinor = Math.round(etb * 100);

  if (currency === "etb") {
    return { currency: "etb", unitAmount: etbMinor };
  }

  const rate = Number(process.env.STRIPE_ETB_PER_USD) || 150;
  const usd = etb / rate;
  const usdCents = Math.max(50, Math.round(usd * 100)); // min $0.50
  return { currency: "usd", unitAmount: usdCents };
}

async function createCheckoutSession({
  bookingId,
  amountEtb,
  customerEmail,
  successUrl,
  cancelUrl,
}) {
  const stripe = getStripe();
  const { currency, unitAmount } = buildStripeCheckoutAmounts(amountEtb);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: String(bookingId),
    customer_email: customerEmail || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { bookingId: String(bookingId) },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: unitAmount,
          product_data: {
            name: "Tour booking",
            metadata: { bookingId: String(bookingId) },
          },
        },
      },
    ],
  });

  return { sessionId: session.id, url: session.url };
}

async function retrieveCheckoutSession(sessionId) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

module.exports = {
  getStripe,
  createCheckoutSession,
  retrieveCheckoutSession,
};
