import apiResponse from "../utils/response.js";
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGE } from "../utils/constant.js";
import logger from "../utils/logger.js";

/**
 * Express error-handling middleware.
 *
 * Sends a JSON response with the error status code and message using a consistent API response format.
 *
 * @param {Object} err - Express error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with error status and message
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error('Error occurred', {
    message: err.message,
    status: err.status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
  });

  return res.status(err.status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(
    apiResponse({
      message: err.message || HTTP_STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
      data: null,
    })
  );
};

/**
 * Express middleware to handle 404 Not Found errors for unmatched routes.
 *
 * Sends a JSON response with 404 status and a standardized not found message.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with 404 status and not found message
 */
export const notFoundHandler = (req, res, next) => {
  // Log 404 errors
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  return res.status(HTTP_STATUS_CODE.NOT_FOUND).json(
    apiResponse({
      message: HTTP_STATUS_MESSAGE.NOT_FOUND,
      data: null,
    })
  );
};
