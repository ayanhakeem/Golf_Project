const express = require('express');
const router = express.Router();
const { getUsers, updateUser, getReports, getAnalytics, getUserScores } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect, adminOnly);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/users/:id/scores', getUserScores);
router.get('/reports', getReports);
router.get('/stats', getReports);
router.get('/analytics', getAnalytics);

module.exports = router;
