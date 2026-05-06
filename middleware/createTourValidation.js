// middleware/createTourValidation.js

const { body } = require('express-validator');

const validateCreateTour = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),

  body('durationDays')
    .notEmpty().withMessage('Duration is required.')
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 day.'),

  body('maxGroupSize')
    .notEmpty().withMessage('Max group size is required.')
    .isInt({ min: 1 }).withMessage('Max group size must be at least 1.'),

  body('regionId')
    .notEmpty().withMessage('Region is required.')
    .isMongoId().withMessage('Invalid region ID.'),

  body('activityType')
    .optional()
    .isArray().withMessage('activityType must be an array of strings.'),

  body('inclusions')
    .optional()
    .isArray().withMessage('inclusions must be an array of strings.'),

  body('exclusions')
    .optional()
    .isArray().withMessage('exclusions must be an array of strings.'),

  body('photos')
    .optional()
    .isArray().withMessage('photos must be an array of URL strings.'),
];

module.exports = { validateCreateTour };
