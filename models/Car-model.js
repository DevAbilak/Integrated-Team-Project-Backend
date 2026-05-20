const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true },
  name: { type: String, required: true, trim: true }, // e.g., "Toyota Land Cruiser"
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1990, max: new Date().getFullYear() + 1 },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
  seatingCapacity: { type: Number, required: true, min: 2, max: 50 },
  pricePerDay: { type: Number, required: true, min: 0 },
  pricePerKm: { type: Number, default: 0, min: 0 }, // optional extra charge per km
  photos: [String],
  available: { type: Boolean, default: true },
  features: [String], // e.g., ["AC", "GPS", "4x4", "Child Seat"]
  licensePlate: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  averageRating: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

carSchema.index({ regionId: 1, status: 1, pricePerDay: 1 });
carSchema.index({ name: 'text', model: 'text' });

module.exports = mongoose.model('Car', carSchema);