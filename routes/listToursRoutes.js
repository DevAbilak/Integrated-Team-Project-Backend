

const express = require('express');
const { validateListTours } = require('../middleware/listToursValidation');
const { getAllTours }        = require('../controllers/listTours-controller');

const router = express.Router();


router.get('/', validateListTours, getAllTours);

module.exports = router;
