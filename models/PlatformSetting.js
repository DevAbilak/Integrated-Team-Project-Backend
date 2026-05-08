const mongoose = require("mongoose");

const platformSettingSchema = new mongoose.Schema(
  {
    commissionRate: { type: Number, required: true, min: 0, max: 100 },
    loyaltyPointsPerBirr: { type: Number, required: true, min: 1 },
    referralBonusPoints: { type: Number, required: true, min: 0 },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    maintenanceMode: { type: Boolean, default: false },
    features: {
      groupBookingEnabled: { type: Boolean, default: true },
      referralEnabled: { type: Boolean, default: true },
      dangerAlertsEnabled: { type: Boolean, default: true },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { updatedAt: true, createdAt: false },
  },
);

// Ensure only one document exists
platformSettingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      commissionRate: 10,
      loyaltyPointsPerBirr: 100,
      referralBonusPoints: 50,
      contactEmail: "admin@tourethiopia.com",
      maintenanceMode: false,
      features: {
        groupBookingEnabled: true,
        referralEnabled: true,
        dangerAlertsEnabled: true,
      },
    });
  }
  return doc;
};

module.exports = mongoose.model("PlatformSetting", platformSettingSchema);
