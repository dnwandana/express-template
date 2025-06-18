import HttpError from "../utils/http-error.js";
import { HTTP_STATUS_CODE } from "../utils/constant.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Express middleware to require a valid JWT token for protected routes.
 *
 * Validates the JWT token in the Authorization header and sets the user in the request object.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with error status and message
 */
export const requireToken = (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "No token provided");
    }

    // verify token
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // set user in request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("requireToken error", error);
    return next(error);
  }
};
