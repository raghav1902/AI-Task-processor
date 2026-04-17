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
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Fixes wildcard credential restriction

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error(`MongoDB connection error: ${err}`));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is healthy' });
});

// Global Error Handler must be the last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
