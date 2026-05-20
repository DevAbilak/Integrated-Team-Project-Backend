const express = require('express');
const {verifyToken} = require("../middleware/verifyToken")
const {isAdmin, isOperator} = require("../middleware/isAdmin")
const {
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
} = require('../controllers/car.controller');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Authenticated routes
router.use(verifyToken);

// Traveler routes
router.post('/book', bookCar);
router.get('/my/bookings', getMyCarBookings);
router.put('/bookings/:id/cancel', cancelCarBooking);

// Operator routes
router.post('/', isOperator,uploadMultiple.array("photos", 10), createCar);
router.put('/:id', isOperator, updateCar);
router.delete('/:id', isOperator, deleteCar);
router.get('/my/cars', isOperator, getMyCars);

// Admin routes
router.put('/:id/approve', isAdmin, approveCar);
router.put('/:id/reject', isAdmin, rejectCar);

module.exports = router;