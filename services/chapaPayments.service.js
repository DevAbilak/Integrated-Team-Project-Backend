const crypto = require("crypto");
const { Chapa } = require("chapa-nodejs");

function getSecretKey() {
  const k = process.env.CHAPA_SECRET_KEY;
  if (!k) {
    throw new Error("CHAPA_SECRET_KEY is not configured");
  }
  return k;
}

function getChapaClient() {
  return new Chapa({
    secretKey: getSecretKey(),
    webhookSecret: process.env.CHAPA_WEBHOOK_SECRET || undefined,
  });
}

/**
 * Initialize hosted Chapa checkout.
 * @see https://developer.chapa.co
 */
async function initializeTransaction({
  txRef,
  amount,
  currency,
  email,
  firstName,
  lastName,
  callbackUrl,
  returnUrl,
}) {
  const chapa = getChapaClient();
  const data = await chapa.initialize({
    amount: String(amount),
    currency: currency || "ETB",
    email,
    first_name: firstName || "Customer",
    last_name: lastName || "Tour",
    tx_ref: txRef,
    callback_url: callbackUrl,
    return_url: returnUrl,
  });

  if (!data || data.status !== "success" || !data.data?.checkout_url) {
    const msg = data?.message || "Chapa initialization failed";
    const err = new Error(msg);
    err.details = data;
    throw err;
  }

  return { checkoutUrl: data.data.checkout_url, raw: data };
}

async function verifyTransaction(txRef) {
  const chapa = getChapaClient();
  return chapa.verify({ tx_ref: String(txRef) });
}

/**
 * Chapa webhook HMAC: secret + body, compare with signature header (when enabled).
 */
function verifyChapaSignature(rawBody, signatureHeader) {
  const secret = process.env.CHAPA_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) {
    return !secret;
  }
  try {
    const chapa = getChapaClient();
    const payload =
      typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody || {});
    return chapa.verifyWebhook(payload, signatureHeader);
  } catch (_) {
    // Fallback to manual HMAC to keep behavior stable.
    const hash = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return hash === signatureHeader;
  }
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
  verifyChapaSignature,
};
