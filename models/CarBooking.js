const mongoose = require('mongoose');

const carBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  pickUpDate: { type: Date, required: true },
  dropOffDate: { type: Date, required: true },
  pickUpLocation: { type: String, required: true }, // address or region-specific
  dropOffLocation: { type: String, required: true },
  totalDays: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  driverNeeded: { type: Boolean, default: false },
  driverPrice: { type: Number, default: 0 },
  specialRequests: String,
  status: { type: String, enum: ['pending_payment', 'confirmed', 'cancelled', 'completed'], default: 'pending_payment' },
  paymentReference: String,
  createdAt: { type: Date, default: Date.now }
});

carBookingSchema.index({ carId: 1, pickUpDate: 1, dropOffDate: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'confirmed' } });

module.exports = mongoose.model('CarBooking', carBookingSchema);