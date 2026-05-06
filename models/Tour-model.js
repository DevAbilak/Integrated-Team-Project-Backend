

const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema(
  {
   
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator ID is required.'],
    },

    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: [true, 'Region is required.'],
    },

    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters.'],
    },

    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
    },

    durationDays: {
      type: Number,
      required: [true, 'Duration is required.'],
      min: [1, 'Duration must be at least 1 day.'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'Max group size is required.'],
      min: [1, 'Group size must be at least 1.'],
    },

    
    activityType: {
      type: [String],
      default: [],
    },

    inclusions: {
      type: [String],
      default: [],
    },

    exclusions: {
      type: [String],
      default: [],
    },

    // Array of image URLs (Cloudinary or placeholder strings for demo)
    photos: {
      type: [String],
      default: [],
    },

    // New tours start as 'pending' — admin must approve before going public
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: "Status must be 'pending', 'approved', or 'rejected'.",
      },
      default: 'pending',
    },

    // Set by admin on rejection so operator knows why
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },

    // Updated by review system (future task)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // Soft delete — never hard delete because bookings reference tours
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Full-text search index on title and description (required for Task 2.3 search)
TourSchema.index({ title: 'text', description: 'text' });

// Compound index for public listing query
TourSchema.index({ regionId: 1, status: 1, isDeleted: 1, price: 1 });

// Operator dashboard query index
TourSchema.index({ operatorId: 1, status: 1 });

module.exports = mongoose.model('Tour', TourSchema);
