const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");
const { requireInternal } = require("../middleware/requireInternal.js");
const referralsController = require("../controllers/referrals.controller.js");

const router = express.Router();

router.get("/generate", verifyToken, referralsController.generate);
router.post("/validate", requireInternal, referralsController.validate);
router.post("/complete", requireInternal, referralsController.complete);

module.exports = router;
