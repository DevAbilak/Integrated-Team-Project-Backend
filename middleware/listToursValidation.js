

const { query } = require('express-validator');

const validateListTours = [
  query('regionId')
    .optional()
    .isMongoId().withMessage('Invalid region ID.'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('minPrice must be a positive number.'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxPrice must be a positive number.'),

  query('durationDays')
    .optional()
    .isInt({ min: 1 }).withMessage('durationDays must be a positive integer.'),

  query('activityType')
    .optional()
    .isString().withMessage('activityType must be a string.'),

  query('search')
    .optional()
    .isString().withMessage('search must be a string.'),

  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'rating', 'newest'])
    .withMessage("sort must be one of: price_asc, price_desc, rating, newest."),
];

module.exports = { validateListTours };
