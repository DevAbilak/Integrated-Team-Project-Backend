const {
  getSettings,
  updateSettings,
} = require("../services/platformSettings.service.js");

async function getAdminSettings(req, res) {
  try {
    const doc = await getSettings();
    return res.status(200).json({
      success: true,
      data: {
        loyaltyPointsPerBirr: doc.loyaltyPointsPerBirr,
        referralBonusPoints: doc.referralBonusPoints,
        commissionRate: doc.commissionRate,
        maintenanceMode: doc.maintenanceMode,
        contactEmail: doc.contactEmail,
        features: doc.features,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Failed to load settings",
    });
  }
}

async function putAdminSettings(req, res) {
  try {
    const doc = await updateSettings(req.body || {}, req.userId);
    return res.status(200).json({
      success: true,
      data: {
        loyaltyPointsPerBirr: doc.loyaltyPointsPerBirr,
        referralBonusPoints: doc.referralBonusPoints,
        commissionRate: doc.commissionRate,
        maintenanceMode: doc.maintenanceMode,
        contactEmail: doc.contactEmail,
        features: doc.features,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Failed to update settings",
    });
  }
}

module.exports = { getAdminSettings, putAdminSettings };
