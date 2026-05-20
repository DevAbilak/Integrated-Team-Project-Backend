const express = require("express");
const { verifyToken } = require("../middleware/verifyToken");
const { isAdmin, isOperator } = require("../middleware/isAdmin");
const { uploadMultiple } = require("../middleware/upload");
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getMyHotels,
  approveHotel,
  bookHotel,
  getMyHotelBookings,
  rejectHotel,
} = require("../controllers/hotel-controller");

const router = express.Router();

// Public routes
router.get("/", getHotels);
router.get("/:id", getHotelById);

// Protected routes (require login)
router.use(verifyToken);

// Traveler routes
router.post("/:id/book", bookHotel);
router.get("/my/bookings", getMyHotelBookings);

// Operator routes
router.post("/", isOperator, uploadMultiple.array("photos", 10), createHotel);
router.put("/:id", isOperator, updateHotel);
router.delete("/:id", isOperator, deleteHotel);
router.get("/my/hotels", isOperator, getMyHotels);

// Admin only
router.put("/:id/approve", isAdmin, approveHotel);
router.put("/:id/reject", isAdmin, rejectHotel);

module.exports = router;
