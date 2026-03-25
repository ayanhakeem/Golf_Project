const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const Charity = require('../models/Charity');

/**
 * GET /api/admin/users
 * Paginated list of all users with subscription info
 */
const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (status) query.subscriptionStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .populate('charityId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
};

/**
 * PUT /api/admin/users/:id
 * Edit a user's role, subscription status, charityId, charityPercentage
 */
const updateUser = async (req, res) => {
  const allowed = ['role', 'subscriptionStatus', 'charityId', 'charityPercentage'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.status(200).json({ success: true, user });
};

/**
 * GET /api/admin/reports
 * Aggregate platform statistics
 */
const getReports = async (req, res) => {
  const [
    totalUsers,
    activeSubscriptions,
    totalCharities,
    totalDraws,
    totalWinners,
    pendingVerifications,
    charities,
  ] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: 'active' }),
    Charity.countDocuments({ isActive: true }),
    Draw.countDocuments({ status: 'published' }),
    Winner.countDocuments(),
    Winner.countDocuments({ verificationStatus: 'pending', proofImageUrl: { $ne: null } }),
    Charity.find({ isActive: true }, 'name'),
  ]);

  // Charity contribution totals — sum up (subscription amount * charityPercentage / 100)
  const subs = await Subscription.find({ status: 'active' }).populate({
    path: 'userId',
    select: 'charityId charityPercentage',
    populate: { path: 'charityId', select: 'name' },
  });

  const charityTotals = {};
  for (const sub of subs) {
    if (!sub.userId?.charityId) continue;
    const key = sub.userId.charityId._id.toString();
    const name = sub.userId.charityId.name;
    const pct = sub.userId.charityPercentage || 10;
    const contribution = Math.floor((sub.prizePortion || 0) * (pct / (100 - pct)));
    charityTotals[key] = charityTotals[key] || { name, total: 0 };
    charityTotals[key].total += contribution;
  }

  const stats = {
      totalUsers,
      activeSubs: activeSubscriptions,
      totalCharities,
      totalDraws,
      totalWinners,
      pendingVerifications,
      totalPotSize: subs.reduce((sum, s) => sum + (s.prizePortion || 0), 0),
      charityContributions: Object.values(charityTotals),
  };

  return res.status(200).json({
    success: true,
    reports: stats,
    data: stats,
  });
};

/**
 * GET /api/admin/analytics
 * Match-type statistics across all published draws
 */
const getAnalytics = async (req, res) => {
  const draws = await Draw.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(12);

  const matchStats = await Winner.aggregate([
    { $group: { _id: '$matchType', count: { $sum: 1 }, totalPaid: { $sum: '$prizeAmount' } } },
  ]);

  const monthlyPool = draws.map((d) => ({
    month: d.month,
    total: d.prizePool?.total || 0,
    fiveMatch: d.prizePool?.fiveMatch || 0,
    fourMatch: d.prizePool?.fourMatch || 0,
    threeMatch: d.prizePool?.threeMatch || 0,
    jackpotRollover: d.jackpotRollover || 0,
  }));

  return res.status(200).json({ success: true, analytics: { matchStats, monthlyPool } });
};

/**
 * GET /api/admin/users/:id/scores
 * Get a specific user's scores (admin view)
 */
const getUserScores = async (req, res) => {
  const score = await Score.findOne({ userId: req.params.id });
  const sorted = score ? score.scores.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  return res.status(200).json({ success: true, scores: sorted });
};

module.exports = { getUsers, updateUser, getReports, getAnalytics, getUserScores };
