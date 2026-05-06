

const { validationResult } = require('express-validator');
const Region = require('../models/Region');

// ── POST /api/admin/regions 

const createRegion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(' | ');
      return res.status(400).json({ success: false, message });
    }

    const { name, zone, alertLevel, alertMessage, geoCoordinates } = req.body;

    const region = await Region.create({
      name,
      zone,
      alertLevel,
      alertMessage,
      geoCoordinates,
    });

    return res.status(201).json({ success: true, data: { region } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/regions 

const getAllRegions = async (req, res, next) => {
  try {
    const regions = await Region.find()
      .select('-__v')
      .sort({ name: 1 });

    return res.status(200).json({ success: true, data: { regions } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRegion, getAllRegions };
