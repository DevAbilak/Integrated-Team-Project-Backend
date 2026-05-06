// middleware/getTourValidation.js

const { param } = require('express-validator');

const validateTourId = [
  param('tourId')
    .isMongoId().withMessage('Invalid tour ID format.'),
];

module.exports = { validateTourId };
