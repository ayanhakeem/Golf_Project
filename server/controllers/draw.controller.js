const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const User = require('../models/User');
const Score = require('../models/Score');
const { randomDraw, algorithmicDraw, simulateDraw, getMatchType, countMatches } = require('../utils/drawEngine');
const { calculatePrizePool, distributePrizes, getJackpotRollover } = require('../utils/prizeCalculator');
const { sendWinnerNotification, sendDrawResults } = require('../utils/emailService');

/**
 * GET /api/draws
 * Return all published draws
 */
const getAllDraws = async (req, res) => {
  const draws = await Draw.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('winners');
  return res.status(200).json({ success: true, draws });
};

/**
 * GET /api/draws/latest
 */
const getLatestDraw = async (req, res) => {
  const draw = await Draw.findOne({ status: 'published' })
    .sort({ publishedAt: -1 })
    .populate({ path: 'winners', populate: { path: 'userId', select: 'name' } });
  return res.status(200).json({ success: true, draw });
};

/**
 * GET /api/draws/:id
 */
const getDrawById = async (req, res) => {
  const draw = await Draw.findById(req.params.id).populate('winners');
  if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
  return res.status(200).json({ success: true, draw });
};

/**
 * POST /api/draws/simulate — Admin
 * Run a simulation preview without persisting draw results.
 */
const simulateDraw_ = async (req, res) => {
  const { drawType = 'random', bias = 'most', customNumbers } = req.body;
  const month = req.body.month || new Date().toISOString().slice(0, 7); // e.g. "2026-03"

  let drawNumbers;
  if (customNumbers && Array.isArray(customNumbers) && customNumbers.length === 5) {
    drawNumbers = customNumbers.map(Number);
  } else if (drawType === 'algorithmic') {
    drawNumbers = await algorithmicDraw(bias);
  } else {
    drawNumbers = randomDraw();
  }

  const simulation = await simulateDraw(drawNumbers);
  const totalPool = await calculatePrizePool();
  const jackpotRollover = await getJackpotRollover(Draw);

  const prizes = distributePrizes(
    totalPool,
    {
      fiveMatch: simulation.summary.fiveMatch,
      fourMatch: simulation.summary.fourMatch,
      threeMatch: simulation.summary.threeMatch,
    },
    jackpotRollover
  );

  // Save simulation result to a Draft draw (upsert by month)
  const draft = await Draw.findOneAndUpdate(
    { month },
    {
      month,
      drawNumbers,
      drawType,
      status: 'simulated',
      prizePool: {
        total: prizes.total,
        fiveMatch: prizes.fiveMatch,
        fourMatch: prizes.fourMatch,
        threeMatch: prizes.threeMatch,
      },
      jackpotRollover,
      simulationResult: { ...simulation, prizes },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return res.status(200).json({
    success: true,
    message: 'Simulation complete (not published)',
    simulation: {
      drawId: draft._id,
      month: month,
      drawnNumbers: drawNumbers,
      potSize: totalPool,
      results: {
        match5: {
          winnersCount: simulation.summary.fiveMatch,
          payoutPerWinner: prizes.perWinner.fiveMatch,
          totalPayout: simulation.summary.fiveMatch * prizes.perWinner.fiveMatch,
        },
        match4: {
          winnersCount: simulation.summary.fourMatch,
          payoutPerWinner: prizes.perWinner.fourMatch,
          totalPayout: simulation.summary.fourMatch * prizes.perWinner.fourMatch,
        },
        match3: {
          winnersCount: simulation.summary.threeMatch,
          payoutPerWinner: prizes.perWinner.threeMatch,
          totalPayout: simulation.summary.threeMatch * prizes.perWinner.threeMatch,
        },
      },
    },
    prizes,
    jackpotRollover,
  });
};

/**
 * POST /api/draws/publish — Admin
 * Publish a simulated draw, create Winner records, notify winners.
 */
const publishDraw = async (req, res) => {
  const { drawId } = req.body;

  const draw = await Draw.findById(drawId);
  if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
  if (draw.status === 'published') {
    return res.status(400).json({ success: false, message: 'Draw already published' });
  }

  const drawNumbers = draw.drawNumbers;
  const totalPool = draw.prizePool.total || (await calculatePrizePool());
  const jackpotRollover = draw.jackpotRollover || 0;

  // Re-evaluate actual winners from current scores
  const activeUsers = await User.find({ subscriptionStatus: 'active' }, '_id name email');
  const userIds = activeUsers.map((u) => u._id);
  const scoreDocs = await Score.find({ userId: { $in: userIds } });

  const scoreMap = {};
  for (const doc of scoreDocs) {
    scoreMap[doc.userId.toString()] = doc.scores.map((s) => s.value);
  }

  const winnersBucket = { '5-match': [], '4-match': [], '3-match': [] };
  for (const user of activeUsers) {
    const uid = user._id.toString();
    const userScores = scoreMap[uid] || [];
    const matchCount = countMatches(userScores, drawNumbers);
    const matchType = getMatchType(matchCount);
    if (matchType) winnersBucket[matchType].push(user);
  }

  const prizes = distributePrizes(
    totalPool,
    {
      fiveMatch: winnersBucket['5-match'].length,
      fourMatch: winnersBucket['4-match'].length,
      threeMatch: winnersBucket['3-match'].length,
    },
    jackpotRollover
  );

  // Create Winner documents + notify
  const winnerDocs = [];
  const notifyPromises = [];

  for (const [matchType, users] of Object.entries(winnersBucket)) {
    const prizeAmount = prizes.perWinner[matchType === '5-match' ? 'fiveMatch' : matchType === '4-match' ? 'fourMatch' : 'threeMatch'];
    for (const user of users) {
      const winner = await Winner.create({
        userId: user._id,
        drawId: draw._id,
        matchType,
        prizeAmount,
      });
      winnerDocs.push(winner._id);

      notifyPromises.push(
        sendWinnerNotification({
          to: user.email,
          name: user.name,
          matchType,
          prizeAmount,
          drawMonth: draw.month,
          dashboardUrl: process.env.CLIENT_URL + '/dashboard',
        }).catch((e) => console.error('Winner email failed:', e.message))
      );
    }
  }

  // Send draw results to all active subscribers
  for (const user of activeUsers) {
    notifyPromises.push(
      sendDrawResults({
        to: user.email,
        name: user.name,
        drawMonth: draw.month,
        drawNumbers,
        nextJackpot: prizes.newRollover,
        dashboardUrl: process.env.CLIENT_URL + '/dashboard',
      }).catch((e) => console.error('Draw results email failed:', e.message))
    );
  }

  // Publish the draw
  draw.status = 'published';
  draw.winners = winnerDocs;
  draw.prizePool = {
    total: prizes.total,
    fiveMatch: prizes.fiveMatch,
    fourMatch: prizes.fourMatch,
    threeMatch: prizes.threeMatch,
  };
  draw.jackpotRollover = prizes.newRollover;
  draw.publishedAt = new Date();
  await draw.save();

  // Fire emails in background
  Promise.all(notifyPromises);

  return res.status(200).json({
    success: true,
    message: `Draw published for ${draw.month}`,
    draw,
    prizes,
    winnersCreated: winnerDocs.length,
  });
};

module.exports = { getAllDraws, getLatestDraw, getDrawById, simulateDraw: simulateDraw_, publishDraw };
