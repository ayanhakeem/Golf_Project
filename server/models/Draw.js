const mongoose = require('mongoose');

const prizePoolSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  fiveMatch: { type: Number, default: 0 },  // 40% of total
  fourMatch: { type: Number, default: 0 },  // 35% of total
  threeMatch: { type: Number, default: 0 }, // 25% of total
});

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: String, // e.g. "2026-03"
      required: true,
      unique: true,
    },
    drawNumbers: {
      type: [Number],
      validate: {
        validator: function (v) {
          return v.length === 5 && new Set(v).size === 5;
        },
        message: 'Draw must contain exactly 5 unique numbers',
      },
    },
    drawType: {
      type: String,
      enum: ['random', 'algorithmic'],
      default: 'random',
    },
    status: {
      type: String,
      enum: ['draft', 'simulated', 'published'],
      default: 'draft',
    },
    prizePool: {
      type: prizePoolSchema,
      default: () => ({}),
    },
    jackpotRollover: {
      type: Number,
      default: 0,
    },
    winners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Winner',
      },
    ],
    publishedAt: {
      type: Date,
      default: null,
    },
    // Simulation preview — not persisted to db as final
    simulationResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Draw', drawSchema);
