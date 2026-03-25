/**
 * Draw Engine — handles random draws, algorithmic draws,
 * simulation (preview without persisting), and match scoring.
 */

const Score = require('../models/Score');
const User = require('../models/User');

// ─── Random Draw ──────────────────────────────────────────────────────────────

/**
 * Generate 5 unique random numbers between 1 and 45.
 * @returns {number[]} Array of 5 unique numbers
 */
const randomDraw = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

// ─── Algorithmic Draw ─────────────────────────────────────────────────────────

/**
 * Analyse all active subscribers' scores and weight the draw
 * toward the MOST frequent values (to maximise winners) or
 * LEAST frequent (to lower payout risk — configurable).
 *
 * @param {'most'|'least'} bias - 'most' to favour popular numbers, 'least' to avoid them
 * @returns {Promise<number[]>} 5 weighted-unique draw numbers
 */
const algorithmicDraw = async (bias = 'most') => {
  // Fetch all active user IDs
  const activeUsers = await User.find({ subscriptionStatus: 'active' }, '_id');
  const userIds = activeUsers.map((u) => u._id);

  // Tally frequencies across all scores
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;

  const scoreDocs = await Score.find({ userId: { $in: userIds } });
  for (const doc of scoreDocs) {
    for (const s of doc.scores) {
      freq[s.value] = (freq[s.value] || 0) + 1;
    }
  }

  // Sort numbers by frequency
  const sorted = Object.entries(freq)
    .map(([num, count]) => ({ num: Number(num), count }))
    .sort((a, b) => (bias === 'most' ? b.count - a.count : a.count - b.count));

  // Pick top 5 unique numbers from sorted list
  const result = sorted.slice(0, 5).map((x) => x.num).sort((a, b) => a - b);

  // Fallback: if fewer than 5 unique numbers found, fill randomly
  while (result.length < 5) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (!result.includes(r)) result.push(r);
  }

  return result.sort((a, b) => a - b);
};

// ─── Match Scoring ────────────────────────────────────────────────────────────

/**
 * Count how many of a user's scores match the draw numbers.
 * @param {number[]} userScores - array of score values
 * @param {number[]} drawNumbers - 5 draw numbers
 * @returns {number} count of matching numbers
 */
const countMatches = (userScores, drawNumbers) => {
  const drawSet = new Set(drawNumbers);
  return userScores.filter((s) => drawSet.has(s)).length;
};

/**
 * Determine match type string from match count.
 * @param {number} count
 * @returns {'5-match'|'4-match'|'3-match'|null}
 */
const getMatchType = (count) => {
  if (count >= 5) return '5-match';
  if (count === 4) return '4-match';
  if (count === 3) return '3-match';
  return null;
};

// ─── Simulate Draw ────────────────────────────────────────────────────────────

/**
 * Run a draw against all active subscribers without persisting.
 * Returns a preview of potential winners.
 *
 * @param {number[]} drawNumbers - 5 draw numbers to test
 * @returns {Promise<Object>} Simulation result with winner preview
 */
const simulateDraw = async (drawNumbers) => {
  const activeUsers = await User.find({ subscriptionStatus: 'active' }, '_id name email');
  const userIds = activeUsers.map((u) => u._id);
  const scoreDocs = await Score.find({ userId: { $in: userIds } });

  // Map userId → score values
  const scoreMap = {};
  for (const doc of scoreDocs) {
    scoreMap[doc.userId.toString()] = doc.scores.map((s) => s.value);
  }

  const results = { '5-match': [], '4-match': [], '3-match': [] };

  for (const user of activeUsers) {
    const uid = user._id.toString();
    const userScores = scoreMap[uid] || [];
    const matchCount = countMatches(userScores, drawNumbers);
    const matchType = getMatchType(matchCount);

    if (matchType) {
      results[matchType].push({
        userId: uid,
        name: user.name,
        email: user.email,
        userScores,
        matchCount,
        matchType,
      });
    }
  }

  return {
    drawNumbers,
    totalActiveUsers: activeUsers.length,
    winners: results,
    summary: {
      fiveMatch: results['5-match'].length,
      fourMatch: results['4-match'].length,
      threeMatch: results['3-match'].length,
    },
  };
};

module.exports = { randomDraw, algorithmicDraw, simulateDraw, countMatches, getMatchType };
