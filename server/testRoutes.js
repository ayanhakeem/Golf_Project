const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// Mock connectDB
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');

try {
  app.use('/auth', authRoutes);
  console.log('Auth routes OK');
  app.use('/scores', scoreRoutes);
  console.log('Score routes OK');
} catch (err) {
  console.error('Route loading error:', err.message);
}
console.log('Test finished');
