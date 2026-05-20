const express = require("express");
const { requireInternal } = require("../middleware/requireInternal.js");
const { updateBookingStatus } = require("../controllers/internal.controller.js");

const router = express.Router();

router.post("/update-booking-status", requireInternal, updateBookingStatus);

module.exports = router;
