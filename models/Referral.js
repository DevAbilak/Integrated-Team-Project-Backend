const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referredEmail: { type: String, required: true, lowercase: true, trim: true },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  completedBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  createdAt: { type: Date, default: Date.now() },
});

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referredEmail: 1 });

module.exports = mongoose.model("Referral", referralSchema);
