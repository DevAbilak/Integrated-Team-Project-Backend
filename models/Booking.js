const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TourPackage",
    required: true,
  },
  travelDate: { type: Date, required: true },
  numTravelers: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["pending_payment", "confirmed", "cancelled", "completed"],
    default: "pending_payment",
  },
  paymentReference: { type: String, trim: true },
  specialRequests: { type: String, maxLength: 300, trim: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound unique index to prevent double‑booking (only for confirmed bookings)
bookingSchema.index(
  { packageId: 1, travelDate: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } },
);

// Indexes for queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ packageId: 1, travelDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
