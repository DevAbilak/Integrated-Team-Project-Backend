const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");
const { requireInternal } = require("../middleware/requireInternal.js");
const loyaltyController = require("../controllers/loyalty.controller.js");

const router = express.Router();

router.post("/earn", requireInternal, loyaltyController.earn);
router.get("/balance", verifyToken, loyaltyController.balance);
router.post("/redeem", verifyToken, loyaltyController.redeem);

module.exports = router;
