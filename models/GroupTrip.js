const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shareAmount: { type: Number, required: true, min: 0 },
  paidStatus: { type: Boolean, default: false },
});

const groupTripSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TourPackage",
    required: true,
  },
  totalCost: { type: Number, required: true, min: 0 },
  inviteCode: { type: String, required: true, unique: true },
  members: [groupMemberSchema],
  createdAt: { type: Date, default: Date.now() },
});

groupTripSchema.index({ inviteCode: 1 });
groupTripSchema.index({ creatorId: 1 });

module.exports = mongoose.model("GroupTrip", groupTripSchema);
