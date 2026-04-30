const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TourPackage",
    required: true,
  },
  quantity: { type: Number, default: 1, min: 1 },
  travelDate: { type: Date, required: true },
  numTravelers: { type: Number, required: true, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: { updatedAt: true, createdAt: false },
  },
);

cartSchema.index({ userId: 1 });

module.exports = mongoose.model("Cart", cartSchema);
