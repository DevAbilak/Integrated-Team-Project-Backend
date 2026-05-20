const PlatformSetting = require("../models/PlatformSetting");

async function getSettings() {
  return PlatformSetting.getSingleton();
}

async function updateSettings(updates, adminUserId) {
  const doc = await PlatformSetting.getSingleton();
  const allowed = [
    "commissionRate",
    "loyaltyPointsPerBirr",
    "referralBonusPoints",
    "contactEmail",
    "maintenanceMode",
    "features",
  ];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      doc[key] = updates[key];
    }
  }
  if (adminUserId) {
    doc.updatedBy = adminUserId;
  }
  doc.updatedAt = new Date();
  await doc.save();
  return doc;
}

module.exports = { getSettings, updateSettings };
