
const express = require('express');
const { verifyToken } = require('../middleware/verifyToken'); // Dev 1
const { isAdmin }     = require('../middleware/isAdmin');      // Dev 1
const { validateApproveReject }           = require('../middleware/approveRejectValidation');
const { approveTour, rejectTour }         = require('../controllers/approveRejectTour-controller');

const router = express.Router();

// PUT /api/admin/tours/:tourId/approve
// Admin approves a pending tour — becomes visible to public
router.put('/:tourId/approve', verifyToken, isAdmin, validateApproveReject, approveTour);

// PUT /api/admin/tours/:tourId/reject
// Admin rejects a tour with an optional reason
router.put('/:tourId/reject', verifyToken, isAdmin, validateApproveReject, rejectTour);

module.exports = router;
