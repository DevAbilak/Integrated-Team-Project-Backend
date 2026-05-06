

const { body, param } = require('express-validator');

const validateUpdateTour = [
  param('tourId')
    .isMongoId().withMessage('Invalid tour ID.'),

  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters.'),

  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty.'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),

  body('durationDays')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 day.'),

  body('maxGroupSize')
    .optional()
    .isInt({ min: 1 }).withMessage('Max group size must be at least 1.'),

  body('regionId')
    .optional()
    .isMongoId().withMessage('Invalid region ID.'),

  body('activityType')
    .optional()
    .isArray().withMessage('activityType must be an array.'),

  body('inclusions')
    .optional()
    .isArray().withMessage('inclusions must be an array.'),

  body('exclusions')
    .optional()
    .isArray().withMessage('exclusions must be an array.'),

  body('photos')
    .optional()
    .isArray().withMessage('photos must be an array.'),
];

const validateDeleteTour = [
  param('tourId')
    .isMongoId().withMessage('Invalid tour ID.'),
];

module.exports = { validateUpdateTour, validateDeleteTour };
