const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  method: {
    type: String,
    enum: ["stripe", "chapa"],
    required: true,
  },
  transactionId: { type: String, required: true, trim: true, index: true },
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed"],
    default: "pending",
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "ETB", trim: true, uppercase: true },
  rawMetadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentSchema.index({ bookingId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
