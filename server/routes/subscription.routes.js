const express = require('express');
const router = express.Router();
const { createCheckoutSession, cancelSubscription, getStatus } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.get('/status', protect, getStatus);

module.exports = router;
