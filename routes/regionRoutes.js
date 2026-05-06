const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { isAdmin } = require('../middleware/isAdmin');
const { validateCreateRegion } = require('../middleware/regionValidation');
const { createRegion, getAllRegions } = require('../controllers/region-controllers');

const router = express.Router();

// POST /api/admin/regions — admin only
router.post(
  '/admin/regions',
  verifyToken,
  isAdmin,
  validateCreateRegion,
  createRegion
);

// GET /api/regions — public, no auth
router.get('/regions', getAllRegions);

module.exports = router;