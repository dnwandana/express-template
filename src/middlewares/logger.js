import logger from '../utils/logger.js';
import morgan from 'morgan';

// Use Morgan for HTTP request logging with our logger stream
const httpLogger = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: logger.stream,
});

// Custom request logging middleware for detailed information
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request details
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log response details
  res.end = function (...args) {
    const duration = Date.now() - startTime;

    logger.http('Outgoing response', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });

    // Call the original end function
    originalEnd.apply(this, args);
  };

  next();
};

export { httpLogger, requestLogger };
