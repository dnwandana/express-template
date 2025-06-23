import HttpError from "../utils/http-error.js";
import { HTTP_STATUS_CODE } from "../utils/constant.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";

/**
 * Express middleware to require a valid access token for protected routes.
 *
 * Validates the access token in the Authorization header and sets the user in the request object.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with error status and message
 */
export const requireAccessToken = (req, res, next) => {
  try {
    // get token from header
    const accessToken = req.headers["x-access-token"];
    if (!accessToken) {
      throw new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "No token provided");
    }

    // verify token
    const decoded = verifyAccessToken(accessToken);

    // set user in request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("requireToken error", error);
    if (error.name === "JsonWebTokenError") {
      return next(
        new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "Invalid token")
      );
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "Token expired")
      );
    }
    return next(error);
  }
};

/**
 * Express middleware to require a valid refresh token for protected routes.
 *
 * Validates the refresh token in the Authorization header.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with error status and message
 */
export const requireRefreshToken = (req, res, next) => {
  try {
    // get token from header
    const refreshToken = req.headers["x-refresh-token"];
    if (!refreshToken) {
      throw new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "No token provided");
    }

    // verify token
    verifyRefreshToken(refreshToken);

    next();
  } catch (error) {
    console.error("requireToken error", error);
    if (error.name === "JsonWebTokenError") {
      return next(
        new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "Invalid token")
      );
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "Token expired")
      );
    }
    return next(error);
  }
};
