const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, logout, refreshToken, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('charityPercentage')
      .optional()
      .isInt({ min: 10, max: 100 })
      .withMessage('Charity percentage must be 10–100'),
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
