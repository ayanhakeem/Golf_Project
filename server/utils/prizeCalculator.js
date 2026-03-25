/**
 * Prize Pool Calculator
 * Calculates draw prize pool from active subscriptions and
 * distributes prizes across match tiers.
 */

const Subscription = require('../models/Subscription');

// Prize tier percentages
const TIERS = { fiveMatch: 0.40, fourMatch: 0.35, threeMatch: 0.25 };

/**
 * Calculate the total prize pool from all active subscriptions.
 * Each subscription contributes its prizePortion (subscription amount
 * minus the charity percentage).
 *
 * @returns {Promise<number>} Total prize pool in pence/cents
 */
const calculatePrizePool = async () => {
  const activeSubs = await Subscription.find({ status: 'active' });
  const total = activeSubs.reduce((sum, sub) => sum + (sub.prizePortion || 0), 0);
  return total;
};

/**
 * Distribute prize money across tiers.
 * - If multiple winners in a tier, prize is split equally.
 * - If no 5-match winner, 40% carries to next month's jackpot rollover.
 *
 * @param {number} totalPool - Total prize pool in pence
 * @param {Object} winnerCounts - { fiveMatch: n, fourMatch: n, threeMatch: n }
 * @param {number} jackpotRollover - Rollover from previous month (pence)
 * @returns {Object} Tier prize amounts and per-winner amounts
 */
const distributePrizes = (totalPool, winnerCounts, jackpotRollover = 0) => {
  const fiveMatchPool = Math.floor(totalPool * TIERS.fiveMatch) + jackpotRollover;
  const fourMatchPool = Math.floor(totalPool * TIERS.fourMatch);
  const threeMatchPool = Math.floor(totalPool * TIERS.threeMatch);

  const newRollover = winnerCounts.fiveMatch === 0 ? fiveMatchPool : 0;

  return {
    total: totalPool,
    fiveMatch: Math.floor(fiveMatchPool),
    fourMatch: Math.floor(fourMatchPool),
    threeMatch: Math.floor(threeMatchPool),
    perWinner: {
      fiveMatch: winnerCounts.fiveMatch > 0
        ? Math.floor(fiveMatchPool / winnerCounts.fiveMatch)
        : 0,
      fourMatch: winnerCounts.fourMatch > 0
        ? Math.floor(fourMatchPool / winnerCounts.fourMatch)
        : 0,
      threeMatch: winnerCounts.threeMatch > 0
        ? Math.floor(threeMatchPool / winnerCounts.threeMatch)
        : 0,
    },
    newRollover, // Carries if no 5-match winners
  };
};

/**
 * Get the current jackpot rollover from the last published draw.
 * @param {Object} Draw - Mongoose Draw model
 * @returns {Promise<number>}
 */
const getJackpotRollover = async (Draw) => {
  const lastDraw = await Draw.findOne({ status: 'published' }).sort({ publishedAt: -1 });
  return lastDraw ? (lastDraw.jackpotRollover || 0) : 0;
};

/**
 * Format pence amount to readable GBP string
 * @param {number} pence
 * @returns {string} e.g. "£12.50"
 */
const formatGBP = (pence) => `£${(pence / 100).toFixed(2)}`;

module.exports = { calculatePrizePool, distributePrizes, getJackpotRollover, formatGBP };
