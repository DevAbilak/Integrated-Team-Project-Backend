const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String, required: true, trim: true },
  targetType: {
    type: String,
    enum: ["user", "package", "region", "setting"],
    required: true,
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: String, trim: true },
  ipAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
});

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("AdminLog", adminLogSchema);
