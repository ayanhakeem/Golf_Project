// require('dotenv').config();
// const express = require('express');
// require('express-async-errors');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const connectDB = require('./config/db');

// // ─── Route imports ────────────────────────────────────────────────────────────
// const authRoutes         = require('./routes/auth.routes');
// const scoreRoutes        = require('./routes/score.routes');
// const subscriptionRoutes = require('./routes/subscription.routes');
// const charityRoutes      = require('./routes/charity.routes');
// const drawRoutes         = require('./routes/draw.routes');
// const winnerRoutes       = require('./routes/winner.routes');
// const adminRoutes        = require('./routes/admin.routes');
// const webhookRoutes      = require('./routes/webhook.routes');

// const app = express();

// // ─── Connect Database ─────────────────────────────────────────────────────────
// connectDB();

// // ─── IMPORTANT: Webhook route MUST come before json() middleware ──────────────
// // Stripe requires the raw body for signature verification
// app.use('/api/webhook', webhookRoutes);

// // ─── Global Middleware ────────────────────────────────────────────────────────
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // ─── API Routes ───────────────────────────────────────────────────────────────
// app.use('/api/auth',          authRoutes);
// app.use('/api/scores',        scoreRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
// app.use('/api/charities',     charityRoutes);
// app.use('/api/draws',         drawRoutes);
// app.use('/api/winners',       winnerRoutes);
// app.use('/api/admin',         adminRoutes);

// // ─── Health Check ─────────────────────────────────────────────────────────────
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // ─── 404 Handler ──────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
// });

// // ─── Global Error Handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//     console.error(`❌ JSON Syntax Error on ${req.method} ${req.url}:`, err.message);
//   } else {
//     console.error('🔥 Error:', err.message);
//   }

//   if (err.name === 'ValidationError') {
//     const messages = Object.values(err.errors).map((e) => e.message);
//     return res.status(400).json({ success: false, message: messages.join(', ') });
//   }
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0];
//     return res.status(409).json({ success: false, message: `${field} already exists` });
//   }
//   if (err.name === 'CastError') {
//     return res.status(400).json({ success: false, message: 'Invalid ID format' });
//   }

//   res.status(err.statusCode || err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal server error',
//   });
// });

// // ─── Start Server ─────────────────────────────────────────────────────────────
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
require('dotenv').config();
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const charityRoutes = require('./routes/charity.routes');
const drawRoutes = require('./routes/draw.routes');
const winnerRoutes = require('./routes/winner.routes');
const adminRoutes = require('./routes/admin.routes');
const webhookRoutes = require('./routes/webhook.routes');

const app = express();

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── IMPORTANT: Webhook route MUST come before json() middleware ──────────────
app.use('/api/webhook', webhookRoutes);

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://golf-project-1.onrender.com',    // ← production frontend
    'http://localhost:5173',                   // ← local development
    process.env.CLIENT_URL,                   // ← env variable fallback
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Golf Charity API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(`❌ JSON Syntax Error on ${req.method} ${req.url}:`, err.message);
  } else {
    console.error('🔥 Error:', err.message);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});