const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");

const {
  createBooking,
  getMyBookings,
} = require("../controllers/bookingController");

// POST create booking
router.post("/", verifyToken, createBooking);

// GET my bookings
router.get("/me", verifyToken, getMyBookings);

module.exports = router;