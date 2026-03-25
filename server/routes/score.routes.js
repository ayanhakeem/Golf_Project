const express = require('express');
const router = express.Router();
const { getMyScores, addScore, editScore, deleteScore } = require('../controllers/score.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireActiveSubscription } = require('../middleware/subscription.middleware');

// All score routes require auth + active subscription
router.use(protect, requireActiveSubscription);

router.get('/me', getMyScores);
router.post('/add', addScore);
router.put('/:id', editScore);
router.delete('/:id', deleteScore);

module.exports = router;
