'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const { connectDB } = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { register, httpRequestDuration, httpRequestsTotal } = require('./src/utils/metrics');
const { checkUpcomingRenewals } = require('./src/services/notification.service');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & utility middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost', 'http://localhost:8080'],
  credentials: true
}))
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Prometheus request metrics middleware ─────────────────────────────────────
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
    end({ status_code: res.statusCode });
  });
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Prometheus metrics endpoint ───────────────────────────────────────────────
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Cron: daily renewal check at 8:00 AM ─────────────────────────────────────
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily renewal check...');
  await checkUpcomingRenewals();
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`✅ Smart Sub backend listening on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Health      : http://localhost:${PORT}/health`);
    console.log(`   Metrics     : http://localhost:${PORT}/metrics`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
