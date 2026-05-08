

const express = require('express');
const { verifyToken } = require('../middleware/verifyToken'); 
const { validateUpdateTour, validateDeleteTour } = require('../middleware/updateDeleteTourValidation');
const { updateTour, deleteTour }                 = require('../controllers/updateDeleteTour-controller');

const router = express.Router();


router.put('/:tourId', verifyToken, validateUpdateTour, updateTour);


router.delete('/:tourId', verifyToken, validateDeleteTour, deleteTour);

module.exports = router;
