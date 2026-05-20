const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
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
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  pricePerNight: { type: Number, required: true, min: 0 },
  amenities: [String],
  photos: [String],
  totalRooms: { type: Number, required: true, min: 1 },
  availableRooms: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  averageRating: { type: Number, default: 0 },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

hotelSchema.index({ regionId: 1, status: 1, pricePerNight: 1 });
module.exports = mongoose.model("Hotel", hotelSchema);
