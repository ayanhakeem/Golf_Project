const express = require('express');
const router = express.Router();
const { getAllDraws, getLatestDraw, getDrawById, simulateDraw, publishDraw } = require('../controllers/draw.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Public
router.get('/', getAllDraws);
router.get('/latest', getLatestDraw);
router.get('/:id', getDrawById);

// Admin only
router.post('/simulate', protect, adminOnly, simulateDraw);
router.post('/publish', protect, adminOnly, publishDraw);

module.exports = router;
