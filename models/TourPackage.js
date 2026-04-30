const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, max: 500 },
  createdAt: { type: Date, default: Date.now },
});

const tourPackageSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  title: { type: String, required: true, max: 200, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  durationDays: { type: Number, required: true, min: 1, max: 30 },
  maxGroupSize: { type: Number, required: true, min: 1 },
  inclusions: [String],
  exclusions: [String],
  photos: [String],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now() },
});

// Text index for search
tourPackageSchema.index({ title: "text", description: "text" });
// Index for filtering
tourPackageSchema.index({ regionId: 1, status: 1, price: 1, durationDays: 1 });
tourPackageSchema.index({ operatorId: 1 });

module.exports = mongoose.model("TourPackage", tourPackageSchema);
