const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const DB = require('./db');
const usersRoutes = require('./routes/users');


const app = express();

app.use(express.json());

// HTTP access logs
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Simple health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
// DB health check — shows how many managers are seeded
app.get('/health/db', (_req, res) => {
  const count = DB.db.prepare('SELECT COUNT(*) AS c FROM managers').get().c;
  res.json({ ok: true, managers_seeded: count });
});


app.use(usersRoutes);
// Central error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  logger.error('Unhandled error', { status, message: err.message, stack: err.stack });
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
