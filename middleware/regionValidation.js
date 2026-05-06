

const { body } = require('express-validator');

const validateCreateRegion = [
  body('name')
    .trim()
    .notEmpty().withMessage('Region name is required.'),

  body('zone')
    .optional()
    .trim(),

  body('alertLevel')
    .optional()
    .isIn(['green', 'yellow', 'red'])
    .withMessage("alertLevel must be 'green', 'yellow', or 'red'."),

  // alertMessage required when alertLevel is yellow or red
  body('alertMessage').custom((value, { req }) => {
    const level = req.body.alertLevel;
    if ((level === 'yellow' || level === 'red') && !value) {
      throw new Error('alertMessage is required when alertLevel is yellow or red.');
    }
    return true;
  }),

  body('geoCoordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('geoCoordinates must be an array of exactly [longitude, latitude].'),

  body('geoCoordinates[0]')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180.'),

  body('geoCoordinates[1]')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90.'),
];

module.exports = { validateCreateRegion };
