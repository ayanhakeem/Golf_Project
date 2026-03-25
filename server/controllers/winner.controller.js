const Winner = require('../models/Winner');
const User = require('../models/User');
const { sendVerificationUpdate, sendPaymentConfirmation } = require('../utils/emailService');

/**
 * POST /api/winners/upload-proof
 * Subscriber uploads screenshot proof (file pre-processed by upload.middleware)
 */
const uploadProof = async (req, res) => {
  const { drawId } = req.body;
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Proof image is required' });
  }

  const winner = await Winner.findOne({ userId: req.user._id, drawId });
  if (!winner) {
    return res.status(404).json({ success: false, message: 'No win record found for this draw' });
  }

  winner.proofImageUrl = req.file.path;
  winner.submittedAt = new Date();
  winner.verificationStatus = 'pending';
  await winner.save();

  return res.status(200).json({ success: true, message: 'Proof uploaded successfully', winner });
};

/**
 * GET /api/winners/me
 * Get all winning records for the authenticated user
 */
const getMyWinnings = async (req, res) => {
  const winners = await Winner.find({ userId: req.user._id })
    .populate('drawId', 'month drawNumbers publishedAt')
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, winners });
};

/**
 * GET /api/winners — Admin
 * Get all winners with user + draw details
 */
const getAllWinners = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.verificationStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [winners, total] = await Promise.all([
    Winner.find(query)
      .populate('userId', 'name email')
      .populate('drawId', 'month drawNumbers')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Winner.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    winners,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
};

/**
 * PUT /api/winners/:id/verify — Admin
 * Approve or reject a winner's proof
 */
const verifyWinner = async (req, res) => {
  const { status, reviewNote } = req.body; // status: 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
  }

  const winner = await Winner.findById(req.params.id).populate('userId', 'name email');
  if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

  winner.verificationStatus = status;
  winner.reviewedAt = new Date();
  winner.reviewNote = reviewNote || '';
  if (status === 'approved') winner.paymentStatus = 'pending';
  await winner.save();

  // Notify winner
  await sendVerificationUpdate({
    to: winner.userId.email,
    name: winner.userId.name,
    status,
    reviewNote,
  }).catch((e) => console.error('Email failed:', e.message));

  return res.status(200).json({ success: true, message: `Winner ${status}`, winner });
};

/**
 * PUT /api/winners/:id/payout — Admin
 * Mark a winner as paid
 */
const markAsPaid = async (req, res) => {
  const winner = await Winner.findById(req.params.id).populate('userId', 'name email');
  if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

  if (winner.verificationStatus !== 'approved') {
    return res.status(400).json({ success: false, message: 'Winner must be approved before marking as paid' });
  }

  winner.paymentStatus = 'paid';
  await winner.save();

  await sendPaymentConfirmation({
    to: winner.userId.email,
    name: winner.userId.name,
    prizeAmount: winner.prizeAmount,
  }).catch((e) => console.error('Email failed:', e.message));

  return res.status(200).json({ success: true, message: 'Payment marked as paid', winner });
};

module.exports = { uploadProof, getMyWinnings, getAllWinners, verifyWinner, markAsPaid };
