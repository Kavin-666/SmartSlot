const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const { errorHandler, notFound } = require('./middleware/errorHandler.js');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
const allowedOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim()) : '*';
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting (basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// V2 & V3 REST API Routes
app.use('/api/v1/auth', require('./routes/auth.js'));
app.use('/api/v1/organizations', require('./routes/organizations.js'));
app.use('/api/v1/properties', require('./routes/properties.js'));
app.use('/api/v1/resources', require('./routes/resources.js'));
app.use('/api/v1/slots', require('./routes/slots.js'));
app.use('/api/v1/bookings', require('./routes/bookings.js'));
app.use('/api/v1/waitlist', require('./routes/waitlist.js'));
app.use('/api/v1/admin', require('./routes/admin.js'));
app.use('/api/v1/ai', require('./routes/ai.js'));

// 404 handler
app.use(notFound);
// Global error handler
app.use(errorHandler);

module.exports = app;
