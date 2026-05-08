

const express = require('express');
const { validateTourId } = require('../middleware/getTourValidation');
const { getTour }        = require('../controllers/getTour-controller');

const router = express.Router();


router.get('/:tourId', validateTourId, getTour);

module.exports = router;
