const Score = require('../models/Score');

/**
 * GET /api/scores/me
 * Return the authenticated user's scores, newest first
 */
const getMyScores = async (req, res) => {
  let scoreDoc = await Score.findOne({ userId: req.user._id });
  if (!scoreDoc) {
    scoreDoc = await Score.create({ userId: req.user._id, scores: [] });
  }

  const sorted = scoreDoc.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(200).json({ success: true, scores: sorted });
};

/**
 * POST /api/scores/add
 * Add a new score. Auto-drops oldest if > 5 entries.
 */
const addScore = async (req, res) => {
  const { value, date } = req.body;

  if (!value || value < 1 || value > 45) {
    return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
  }
  if (!date) {
    return res.status(400).json({ success: false, message: 'Score date is required' });
  }

  let scoreDoc = await Score.findOne({ userId: req.user._id });
  if (!scoreDoc) {
    scoreDoc = await Score.create({ userId: req.user._id, scores: [] });
  }

  // Sort ascending by date so we can remove the oldest (index 0 after sort)
  scoreDoc.scores.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Add new score
  scoreDoc.scores.push({ value: Number(value), date: new Date(date) });

  // If more than 5, remove the oldest
  if (scoreDoc.scores.length > 5) {
    scoreDoc.scores.shift(); // removes oldest (first after ascending sort)
  }

  await scoreDoc.save();

  const sorted = scoreDoc.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(201).json({ success: true, message: 'Score added', scores: sorted });
};

/**
 * PUT /api/scores/:id
 * Edit a single score entry by its subdocument _id
 */
const editScore = async (req, res) => {
  const { value, date } = req.body;
  const scoreDoc = await Score.findOne({ userId: req.user._id });

  if (!scoreDoc) {
    return res.status(404).json({ success: false, message: 'No scores found' });
  }

  const entry = scoreDoc.scores.id(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Score entry not found' });
  }

  if (value !== undefined) {
    if (value < 1 || value > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }
    entry.value = Number(value);
  }
  if (date !== undefined) {
    entry.date = new Date(date);
  }

  await scoreDoc.save();

  const sorted = scoreDoc.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(200).json({ success: true, message: 'Score updated', scores: sorted });
};

/**
 * DELETE /api/scores/:id
 * Delete a single score entry by its subdocument _id
 */
const deleteScore = async (req, res) => {
  const scoreDoc = await Score.findOne({ userId: req.user._id });

  if (!scoreDoc) {
    return res.status(404).json({ success: false, message: 'No scores found' });
  }

  const entry = scoreDoc.scores.id(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Score entry not found' });
  }

  entry.deleteOne();
  await scoreDoc.save();

  const sorted = scoreDoc.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(200).json({ success: true, message: 'Score deleted', scores: sorted });
};

module.exports = { getMyScores, addScore, editScore, deleteScore };
