

const express = require('express');
const { verifyToken } = require('../middleware/verifyToken'); // Dev 1
const { isAdmin }     = require('../middleware/isAdmin');      
const { validateCreateTour } = require('../middleware/createTourValidation');
const { createTour }         = require('../controllers/createTour-controller');

const router = express.Router();


router.post('/', verifyToken, validateCreateTour, createTour);

module.exports = router;
