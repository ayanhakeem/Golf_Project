const express = require('express');
const app = express();
try {
  const charityRoutes = require('./routes/charity.routes');
  app.use('/charities', charityRoutes);
  console.log('Charity routes OK');
} catch (err) {
  console.error('Charity route error:', err);
}
