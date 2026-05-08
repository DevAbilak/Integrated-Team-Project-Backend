

const { param, body } = require('express-validator');

const validateApproveReject = [
  param('tourId')
    .isMongoId().withMessage('Invalid tour ID.'),


  body('rejectionReason')
    .optional()
    .trim()
    .isString().withMessage('Rejection reason must be a string.'),
];

module.exports = { validateApproveReject };
