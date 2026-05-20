const mongoose = require("mongoose");

const hotelBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  numberOfRooms: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  guestNames: [String],
  specialRequests: String,
  status: {
    type: String,
    enum: ["pending_payment", "confirmed", "cancelled", "completed"],
    default: "pending_payment",
  },
  paymentReference: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HotelBooking", hotelBookingSchema);
