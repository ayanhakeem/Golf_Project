const express = require('express');
const router = express.Router();
const {
  getCharities, getFeaturedCharities, getCharityById,
  createCharity, updateCharity, deleteCharity,
} = require('../controllers/charity.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { uploadCharityImage } = require('../middleware/upload.middleware');

// Public routes
router.get('/', getCharities);
router.get('/featured', getFeaturedCharities);
router.get('/:id', getCharityById);

// Admin-only routes
router.post('/', protect, adminOnly, uploadCharityImage.array('images', 5), createCharity);
router.put('/:id', protect, adminOnly, uploadCharityImage.array('images', 5), updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

module.exports = router;
