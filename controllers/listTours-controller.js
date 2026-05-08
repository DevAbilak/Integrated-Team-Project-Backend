// controllers/listTours-controller.js

const { validationResult } = require('express-validator');
const Tour = require('../models/Tour-model');

const getAllTours = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(' | ');
      return res.status(400).json({ success: false, message });
    }

    const { regionId, minPrice, maxPrice, durationDays, activityType, search, sort } = req.query;

    // Base filter: only non-deleted tours
    const filter = { isDeleted: false };

    if (req.userId && req.userRole === 'operator') {
      filter.$or = [
        { status: 'approved' },
        { operatorId: req.userId },
      ];
    } else {
      filter.status = 'approved';
    }

    // Optional filters
    if (regionId)     filter.regionId     = regionId;
    if (durationDays) filter.durationDays = { $lte: Number(durationDays) };
    if (activityType) filter.activityType = { $in: [activityType] };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Sorting
    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { averageRating: -1 },
      newest:     { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const tours = await Tour.find(filter)
      .populate('regionId', 'name zone alertLevel alertMessage geoCoordinates')
      .select('-__v')
      .sort(sortBy);

    return res.status(200).json({ success: true, data: { count: tours.length, tours } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTours };
