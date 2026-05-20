const Car = require('../models/Car-model');
const CarBooking = require('../models/CarBooking');
const Media = require("../models/Media-model");
const Region = require('../models/Region');
const { deleteMediaFromCloudinary } = require('../utils/cloudinary');
const { uploadMedia } = require('../utils/media.service');

// Create a new car listing (operator only)
const createCar = async (req, res) => {
  try {
    // Extract text fields
    const {
      name, model, year, fuelType, transmission, seatingCapacity,
      pricePerDay, pricePerKm, features, licensePlate, regionId,
      available = true
    } = req.body;

    // Basic validation
    if (!name || !model || !year || !fuelType || !transmission || !seatingCapacity || !pricePerDay || !licensePlate || !regionId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Upload photos (if any)
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const mediaResult = await uploadMedia(file, req.userId);
          photoUrls.push(mediaResult.url);
        } catch (uploadErr) {
          console.error(`Failed to upload car photo: ${uploadErr.message}`);
        }
      }
    }

    // Create car document
    const carData = {
      operatorId: req.userId,
      regionId,
      name,
      model,
      year,
      fuelType,
      transmission,
      seatingCapacity,
      pricePerDay,
      pricePerKm: pricePerKm || 0,
      photos: photoUrls,
      features: features ? (Array.isArray(features) ? features : features.split(',')) : [],
      licensePlate,
      available: available === 'true' || available === true,
      status: 'pending'
    };

    const car = new Car(carData);
    await car.save();

    res.status(201).json({ success: true, message: 'Car added successfully', data: car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all approved cars (public, with filters)
const getCars = async (req, res) => {
  try {
    const { regionId, minPrice, maxPrice, transmission, fuelType, seatingCapacity, page = 1, limit = 10 } = req.query;
    const query = { status: 'approved', available: true };
    if (regionId) query.regionId = regionId;
    if (minPrice) query.pricePerDay = { $gte: parseInt(minPrice) };
    if (maxPrice) query.pricePerDay = { ...query.pricePerDay, $lte: parseInt(maxPrice) };
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (seatingCapacity) query.seatingCapacity = { $gte: parseInt(seatingCapacity) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      Car.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Car.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      data: {
        cars,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single car by ID
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.status(200).json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update car (operator owner only)
const updateCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, operatorId: req.userId });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found or you do not own it' });
    Object.assign(car, req.body);
    await car.save();
    res.status(200).json({ success: true, message: 'Car updated', data: car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete car (operator owner only) – check for active bookings
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, operatorId: req.userId });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found or you do not own it' });

    // Check for active bookings
    const activeBooking = await CarBooking.findOne({
      carId: req.params.id,
      status: { $in: ['pending_payment', 'confirmed'] }
    });
    if (activeBooking) {
      return res.status(400).json({ success: false, message: 'Cannot delete car with active bookings' });
    }

    // Delete all associated photos from Cloudinary and Media collection
    if (car.photos && car.photos.length > 0) {
      for (const photoUrl of car.photos) {
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

    // Delete the car document
    await car.deleteOne()
    res.status(200).json({ success: true, message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get cars owned by the logged-in operator
const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ operatorId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: approve a car
const approveCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    car.status = 'approved';
    await car.save();
    res.status(200).json({ success: true, message: 'Car approved', data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: reject a car
const rejectCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    car.status = 'rejected';
    await car.save();
    res.status(200).json({ success: true, message: 'Car rejected', data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Book a car (traveler)
const bookCar = async (req, res) => {
  try {
    const { carId, pickUpDate, dropOffDate, pickUpLocation, dropOffLocation, driverNeeded, specialRequests } = req.body;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (!car.available) return res.status(400).json({ success: false, message: 'Car is not available' });

    const startDate = new Date(pickUpDate);
    const endDate = new Date(dropOffDate);
    if (endDate <= startDate) return res.status(400).json({ success: false, message: 'Drop-off date must be after pick-up date' });
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    let totalPrice = car.pricePerDay * totalDays;
    if (driverNeeded) {
      // Example driver fee: 500 per day
      totalPrice += 500 * totalDays;
    }

    const booking = new CarBooking({
      userId: req.userId,
      carId,
      pickUpDate: startDate,
      dropOffDate: endDate,
      pickUpLocation,
      dropOffLocation,
      totalDays,
      totalPrice,
      driverNeeded: driverNeeded || false,
      driverPrice: driverNeeded ? 500 * totalDays : 0,
      specialRequests,
      status: 'pending_payment'
    });
    await booking.save();

    // Optionally mark car as unavailable for overlapping dates (complex, skip for MVP)
    res.status(201).json({ success: true, message: 'Car booking created, proceed to payment', data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get my car bookings (traveler)
const getMyCarBookings = async (req, res) => {
  try {
    const bookings = await CarBooking.find({ userId: req.userId }).populate('carId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel a car booking (only if pending_payment or confirmed)
const cancelCarBooking = async (req, res) => {
  try {
    const booking = await CarBooking.findOne({ _id: req.params.id, userId: req.userId });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'confirmed' && new Date(booking.pickUpDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a booking that has already started' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  getMyCars,
  approveCar,
  rejectCar,
  bookCar,
  getMyCarBookings,
  cancelCarBooking
};