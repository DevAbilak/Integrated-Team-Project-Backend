

const { validationResult } = require('express-validator');
const Tour = require('../models/Tour-model');

const getTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(' | ');
      return res.status(400).json({ success: false, message });
    }

    const tour = await Tour.findOne({ _id: req.params.tourId, isDeleted: false })
      .populate('regionId',   'name zone alertLevel alertMessage geoCoordinates')
      .populate('operatorId', 'name email')
      .select('-__v');

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found.' });
    }


    if (tour.status !== 'approved') {
      const isOwner = req.userId && tour.operatorId._id.toString() === req.userId.toString();
      const isAdmin = req.userRole === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ success: false, message: 'Tour not found.' });
      }
    }

    return res.status(200).json({ success: true, data: { tour } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTour };
