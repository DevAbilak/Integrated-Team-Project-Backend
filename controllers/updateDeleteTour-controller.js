

const { validationResult } = require('express-validator');
const Tour   = require('../models/Tour-model');
const Region = require('../models/Region');


const updateTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(' | ');
      return res.status(400).json({ success: false, message });
    }

    const tour = await Tour.findOne({ _id: req.params.tourId, isDeleted: false });

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found.' });
    }

    const isOwner = tour.operatorId.toString() === req.userId.toString();
    const isAdmin = req.userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this tour.' });
    }

    // Only allow known fields — prevent mass assignment
    const allowedFields = [
      'title', 'description', 'price', 'durationDays',
      'maxGroupSize', 'regionId', 'activityType', 'inclusions', 'exclusions', 'photos',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    // Confirm new region exists if regionId is being changed
    if (updates.regionId) {
      const region = await Region.findById(updates.regionId);
      if (!region) {
        return res.status(404).json({ success: false, message: 'Region not found.' });
      }
    }

 
    if (isOwner && !isAdmin) {
      updates.status = 'pending';
      updates.rejectionReason = '';
    }

    const updated = await Tour.findByIdAndUpdate(
      req.params.tourId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('regionId', 'name zone alertLevel');

    return res.status(200).json({ success: true, data: { tour: updated } });
  } catch (err) {
    next(err);
  }
};

const deleteTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(' | ');
      return res.status(400).json({ success: false, message });
    }

    const tour = await Tour.findOne({ _id: req.params.tourId, isDeleted: false });

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found.' });
    }

    const isOwner = tour.operatorId.toString() === req.userId.toString();
    const isAdmin = req.userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this tour.' });
    }

    await Tour.findByIdAndUpdate(req.params.tourId, { $set: { isDeleted: true } });

    return res.status(200).json({ success: true, data: { message: 'Tour deleted successfully.' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateTour, deleteTour };
