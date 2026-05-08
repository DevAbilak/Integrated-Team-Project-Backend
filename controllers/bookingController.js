const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Booking = require("../models/Booking");
const TourPackage = require("../models/TourPackage");

// ==========================================
// POST /api/bookings
// Create bookings from cart items
// ==========================================
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      paymentMethod,
      specialRequests,
    } = req.body;

    const cart = await Cart.findOne({
      userId: req.userId,
    }).session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const createdBookings = [];

    for (const item of cart.items) {
      const tour = await TourPackage.findById(
        item.packageId
      ).session(session);

      if (!tour) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Tour package not found",
        });
      }

      if (tour.status !== "approved") {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Tour package is not approved",
        });
      }

      // check confirmed booking conflict
      const existingBooking =
        await Booking.findOne({
          packageId: item.packageId,
          travelDate: item.travelDate,
          status: "confirmed",
        }).session(session);

      if (existingBooking) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Selected package already booked for that date",
        });
      }

      const totalPrice =
        (tour.price || 0) *
        item.numTravelers *
        item.quantity;

      const paymentReference =
        "PAY-" + Date.now();

      const booking =
        await Booking.create(
          [
            {
              userId: req.userId,
              packageId: item.packageId,
              travelDate: item.travelDate,
              numTravelers:
                item.numTravelers,
              totalPrice,
              status:
                "pending_payment",
              paymentReference,
              specialRequests:
                specialRequests ||
                "",
            },
          ],
          { session }
        );

      createdBookings.push(
        booking[0]
      );
    }

    // clear cart after successful booking creation
    cart.items = [];
    await cart.save({
      session,
    });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      data: createdBookings,
      payment: {
        method:
          paymentMethod ||
          "chapa",
        status: "pending",
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.log(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create booking",
    });
  } finally {
    session.endSession();
  }
};

// ==========================================
// GET /api/bookings/me
// ==========================================
const getMyBookings =
  async (req, res) => {
    try {
      const { status } =
        req.query;

      const query = {
        userId: req.userId,
      };

      if (status) {
        query.status = status;
      }

      const bookings =
        await Booking.find(
          query
        )
          .populate(
            "packageId"
          )
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json({
          success: true,
          data: bookings,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch bookings",
        });
    }
  };

module.exports = {
  createBooking,
  getMyBookings,
};