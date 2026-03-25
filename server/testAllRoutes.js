const express = require('express');
const app = express();
const routes = [
  './routes/auth.routes',
  './routes/score.routes', 
  './routes/subscription.routes',
  './routes/charity.routes',
  './routes/draw.routes',
  './routes/winner.routes',
  './routes/admin.routes',
  './routes/webhook.routes'
];

routes.forEach(r => {
  try {
    const route = require(r);
    app.use('/test', route);
    console.log(`${r} OK`);
  } catch (err) {
    console.error(`${r} ERROR:`, err);
  }
});
console.log('Finished testing all routes');
