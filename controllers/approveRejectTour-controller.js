
const { validationResult } = require('express-validator');
const Tour = require('../models/Tour-model');


const approveTour = async (req, res, next) => {
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

    if (tour.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Tour is already approved.' });
    }

    const updated = await Tour.findByIdAndUpdate(
      req.params.tourId,
      { $set: { status: 'approved', rejectionReason: '' } },
      { new: true }
    ).populate('regionId', 'name zone');

    return res.status(200).json({ success: true, data: { tour: updated } });
  } catch (err) {
    next(err);
  }
};


const rejectTour = async (req, res, next) => {
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

    if (tour.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Tour is already rejected.' });
    }

    const updated = await Tour.findByIdAndUpdate(
      req.params.tourId,
      { $set: { status: 'rejected', rejectionReason: req.body.rejectionReason || '' } },
      { new: true }
    ).populate('regionId', 'name zone');

    return res.status(200).json({ success: true, data: { tour: updated } });
  } catch (err) {
    next(err);
  }
};

module.exports = { approveTour, rejectTour };
