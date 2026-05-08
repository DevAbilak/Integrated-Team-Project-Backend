const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");
const { isAdmin } = require("../middleware/isAdmin.js");
const paymentsController = require("../controllers/payments.controller.js");

const router = express.Router();

router.get("/config", paymentsController.getPaymentConfig);
router.post("/initiate", verifyToken, paymentsController.initiatePayment);
router.post("/webhook/chapa", paymentsController.handleChapaWebhook);
router.post(
  "/confirm/:bookingId",
  verifyToken,
  isAdmin,
  paymentsController.adminConfirmPayment,
);
router.get("/status/:bookingId", verifyToken, paymentsController.getPaymentStatus);

module.exports = router;
