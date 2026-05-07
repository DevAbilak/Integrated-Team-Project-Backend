const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

// GET CART
router.get("/", verifyToken, getCart);

// ADD ITEM
router.post("/items", verifyToken, addCartItem);

// UPDATE ITEM
router.put("/items/:itemId", verifyToken, updateCartItem);

// DELETE ITEM
router.delete("/items/:itemId", verifyToken, removeCartItem);

// CLEAR ALL
router.delete("/", verifyToken, clearCart);

module.exports = router;