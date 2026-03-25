const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, 'Score value is required'],
    min: [1, 'Score must be at least 1'],
    max: [45, 'Score must be at most 45'],
  },
  date: {
    type: Date,
    required: [true, 'Score date is required'],
  },
});

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    scores: {
      type: [scoreEntrySchema],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: 'Cannot have more than 5 scores',
      },
    },
  },
  { timestamps: true }
);

// Always return scores sorted newest first
scoreSchema.methods.getSortedScores = function () {
  return this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
};

module.exports = mongoose.model('Score', scoreSchema);
