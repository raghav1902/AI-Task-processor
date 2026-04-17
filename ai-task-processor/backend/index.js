require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth');
const taskRoutes = require('./src/routes/tasks');
const errorHandler = require('./src/middlewares/errorHandler');
const logger = require('./src/utils/logger');

const app = express();

// Required for rate limiting to work correctly on Render/Cloud hosting
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// CORS configuration - Allows for cookies/credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error(`MongoDB connection error: ${err}`));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is healthy' });
});

// Global Error Handler (Must be last)
app.use(errorHandler);

// Listen on Port (Render uses 10000 by default)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});