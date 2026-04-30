const express = require("express");
const {
  getAllUsers,
  verifyOperator,
} = require("../controllers/admin-controllers");
const { verifyToken } = require("../middleware/verifyToken");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/users/:id/verify-operator", verifyToken, isAdmin, verifyOperator);

module.exports = router;
