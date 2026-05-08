const Cart = require("../models/Cart-model");

const ensureCartOwner = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    req.cart = cart;
    next();
  } catch (error) {
    console.log("Cart middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { ensureCartOwner };