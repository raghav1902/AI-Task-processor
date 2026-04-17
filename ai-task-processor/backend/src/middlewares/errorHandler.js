const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.status} - ${err.message}`, { 
    url: req.originalUrl, 
    method: req.method, 
    ip: req.ip,
    stack: err.stack 
  });

  if (process.env.NODE_ENV !== 'production') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
};

module.exports = errorHandler;
