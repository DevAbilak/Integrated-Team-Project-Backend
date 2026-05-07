const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const TourPackage = require("../models/TourPackage");

// ==================================
// GET CURRENT USER CART
// GET /api/cart
// ==================================
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId }).populate(
      "items.packageId"
    );

    if (!cart) {
      cart = await Cart.create({
        userId: req.userId,
        items: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// ==================================
// ADD ITEM TO CART
// POST /api/cart/items
// ==================================
const addCartItem = async (req, res) => {
  try {
    const { packageId, quantity, travelDate, numTravelers } = req.body;

    if (!packageId || !travelDate || !numTravelers) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID",
      });
    }

    const tour = await TourPackage.findById(packageId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    if (tour.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Only approved tours can be added",
      });
    }

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.packageId.toString() === packageId &&
        new Date(item.travelDate).toDateString() ===
          new Date(travelDate).toDateString()
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      existingItem.numTravelers += numTravelers;
    } else {
      cart.items.push({
        packageId,
        quantity: quantity || 1,
        travelDate,
        numTravelers,
      });
    }

    cart.updatedAt = Date.now();

    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    console.log("Add cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item",
    });
  }
};

// ==================================
// UPDATE CART ITEM
// PUT /api/cart/items/:itemId
// ==================================
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, travelDate, numTravelers } = req.body;

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (quantity) item.quantity = quantity;
    if (travelDate) item.travelDate = travelDate;
    if (numTravelers) item.numTravelers = numTravelers;

    cart.updatedAt = Date.now();

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    console.log("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

// ==================================
// DELETE CART ITEM
// DELETE /api/cart/items/:itemId
// ==================================
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.deleteOne();

    cart.updatedAt = Date.now();

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    console.log("Remove item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item",
    });
  }
};

// ==================================
// CLEAR CART
// DELETE /api/cart
// ==================================
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.updatedAt = Date.now();

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.log("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};