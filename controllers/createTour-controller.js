// controllers/createTour-controller.js

const { validationResult } = require('express-validator');
const Tour = require('../models/Tour-model');
const Region = require('../models/Region'); // Task 2.1 model

const createTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(' | ');
      return res.status(400).json({ success: false, message });
    }

    const {
      title,
      description,
      price,
      durationDays,
      maxGroupSize,
      regionId,
      activityType,
      inclusions,
      exclusions,
      photos,
    } = req.body;

    // Confirm the referenced region exists
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found.' });
    }

    const tour = await Tour.create({
      operatorId: req.userId,   // set by verifyToken middleware (Dev 1)
      regionId,
      title,
      description,
      price,
      durationDays,
      maxGroupSize,
      activityType: activityType || [],
      inclusions:   inclusions   || [],
      exclusions:   exclusions   || [],
      photos:       photos       || [],
      status: 'pending',        // always starts pending — admin approves in Task 2.6
    });

    return res.status(201).json({ success: true, data: { tour } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTour };
