const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["earn", "redeem", "bonus"],
    required: true,
  },
  points: { type: Number, required: true }, // positive for earn/bonus, negative for redeem
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // bookingId or referralId
  createdAt: { type: Date, default: Date.now() },
});

loyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ referenceId: 1 });

module.exports = mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
