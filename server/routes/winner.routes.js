const express = require('express');
const router = express.Router();
const { uploadProof, getMyWinnings, getAllWinners, verifyWinner, markAsPaid } = require('../controllers/winner.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { requireActiveSubscription } = require('../middleware/subscription.middleware');
const { uploadProof: uploadProofMiddleware } = require('../middleware/upload.middleware');

// Subscriber routes
router.post('/upload-proof', protect, requireActiveSubscription, uploadProofMiddleware.single('proof'), uploadProof);
router.get('/me', protect, getMyWinnings);

// Admin routes
router.get('/', protect, adminOnly, getAllWinners);
router.put('/:id/verify', protect, adminOnly, verifyWinner);
router.put('/:id/payout', protect, adminOnly, markAsPaid);

module.exports = router;
