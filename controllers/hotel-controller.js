// controllers/hotelController.js
const Hotel = require("../models/Hotel-model");
const HotelBooking = require("../models/HotelBooking");
const { uploadMedia } = require("../utils/media.service");
const Media = require("../models/Media-model");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");

// Create a new hotel (operator only)
const createHotel = async (req, res) => {
  try {
    // Extract text fields
    const {
      name,
      description,
      address,
      regionId,
      starRating,
      pricePerNight,
      amenities,
      totalRooms,
      availableRooms,
    } = req.body;

    // Basic validation (add more as needed)
    if (!name || !address || !regionId || !pricePerNight) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Handle multiple photo uploads
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const mediaResult = await uploadMedia(file, req.userId); // upload to Cloudinary
          photoUrls.push(mediaResult.url);
        } catch (uploadErr) {
          console.error(`Failed to upload photo: ${uploadErr.message}`);
        }
      }
    }

    // Create hotel document
    const hotelData = {
      operatorId: req.userId,
      name,
      description,
      address,
      regionId,
      starRating: starRating || 3,
      pricePerNight,
      amenities: amenities
        ? Array.isArray(amenities)
          ? amenities
          : amenities.split(",")
        : [],
      photos: photoUrls,
      totalRooms,
      availableRooms:
        availableRooms !== undefined ? availableRooms : totalRooms,
      status: "pending",
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();
    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all approved hotels (public, with filters)
const getHotels = async (req, res) => {
  try {
    const {
      regionId,
      minPrice,
      maxPrice,
      starRating,
      page = 1,
      limit = 10,
    } = req.query;
    const query = { status: "approved" };
    if (regionId) query.regionId = regionId;
    if (minPrice) query.pricePerNight = { $gte: parseInt(minPrice) };
    if (maxPrice)
      query.pricePerNight = {
        ...query.pricePerNight,
        $lte: parseInt(maxPrice),
      };
    if (starRating) query.starRating = parseInt(starRating);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [hotels, total] = await Promise.all([
      Hotel.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Hotel.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      data: {
        hotels,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single hotel by ID
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update hotel (operator owner only)
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      operatorId: req.userId,
    });
    if (!hotel)
      return res.status(404).json({
        success: false,
        message: "Hotel not found or you do not own it",
      });
    Object.assign(hotel, req.body);
    await hotel.save();
    res
      .status(200)
      .json({ success: true, message: "Hotel updated", data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete hotel (operator owner only)
const deleteHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const userId = req.userId;

    // Find hotel and ensure ownership
    const hotel = await Hotel.findOne({ _id: hotelId, operatorId: userId });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or you do not own it",
      });
    }

    // Check for active bookings (not cancelled or completed)
    const activeBookings = await HotelBooking.findOne({
      hotelId: hotelId,
      status: { $in: ["pending_payment", "confirmed"] },
    });
    if (activeBookings) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete hotel because there are active bookings",
      });
    }

    // Delete all associated photos from Cloudinary and Media collection
    if (hotel.photos && hotel.photos.length > 0) {
      for (const photoUrl of hotel.photos) {
        // Find the Media document by URL
        const mediaDoc = await Media.findOne({ url: photoUrl });
        if (mediaDoc) {
          // Delete from Cloudinary
          if (mediaDoc.publicId) {
            try {
              await deleteMediaFromCloudinary(mediaDoc.publicId);
            } catch (cloudErr) {
              console.error(
                `Failed to delete from Cloudinary: ${cloudErr.message}`,
              );
            }
          }
          // Delete Media document
          await Media.findByIdAndDelete(mediaDoc._id);
        }
      }
    }

    // Delete the hotel document
    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      message: "Hotel and associated media deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get hotels owned by the logged-in operator
const getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ operatorId: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: approve a hotel
const approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    hotel.status = "approved";
    await hotel.save();
    res
      .status(200)
      .json({ success: true, message: "Hotel approved", data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Book a hotel (traveler)
const bookHotel = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      numberOfRooms,
      guestNames,
      specialRequests,
    } = req.body;
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    if (hotel.availableRooms < numberOfRooms)
      return res
        .status(400)
        .json({ success: false, message: "Not enough rooms available" });

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24),
    );
    if (nights <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid check-in/out dates" });
    const totalPrice = hotel.pricePerNight * numberOfRooms * nights;

    const booking = new HotelBooking({
      userId: req.userId,
      hotelId,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      totalPrice,
      guestNames,
      specialRequests,
    });
    await booking.save();
    res.status(201).json({
      success: true,
      message: "Hotel booking created, proceed to payment",
      data: booking,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get my hotel bookings (traveler)
const getMyHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ userId: req.userId })
      .populate("hotelId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject a hotel (admin only)
const rejectHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }
    hotel.status = "rejected";
    await hotel.save();
    res
      .status(200)
      .json({ success: true, message: "Hotel rejected", data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getMyHotels,
  approveHotel,
  bookHotel,
  getMyHotelBookings,
  rejectHotel,
};
