const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Score = require('../models/Score');

// ─── Token helpers ────────────────────────────────────────────────────────────

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, charityId, charityPercentage } = req.body;

  // Check duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  // Create user — password hashed by pre-save hook
  const user = await User.create({
    name,
    email,
    password,
    charityId: charityId || null,
    charityPercentage: charityPercentage || 10,
  });

  // Create empty Score document for this user
  await Score.create({ userId: user._id, scores: [] });

  // Create Stripe customer
  try {
    const stripe = require('../config/stripe');
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  } catch (stripeErr) {
    console.error('Stripe customer creation failed:', stripeErr.message);
    // Non-fatal — user can still register without Stripe customer
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      charityId: user.charityId,
      charityPercentage: user.charityPercentage,
    },
  });
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      charityId: user.charityId,
      charityPercentage: user.charityPercentage,
      stripeCustomerId: user.stripeCustomerId,
    },
  });
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        charityId: user.charityId,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('charityId', 'name images');
  return res.status(200).json({ success: true, user });
};

module.exports = { register, login, logout, refreshToken, getMe };
