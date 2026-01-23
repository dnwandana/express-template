import jwt from "jsonwebtoken"

/**
 * Generates a signed JSON Web Token for a given user.
 *
 * @param {string|number} id The unique identifier of the user.
 * @returns {string} A signed JWT string.
 */
export const generateAccessToken = (id) => {
  const jwtPayload = {
    id,
  }

  return jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  })
}

/**
 * Generates a refresh token for a given user.
 *
 * @param {string|number} id The unique identifier of the user.
 * @returns {string} A signed refresh token string.
 */
export const generateRefreshToken = (id) => {
  const jwtPayload = {
    id,
  }

  return jwt.sign(jwtPayload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  })
}

/**
 * Verifies and decodes a JSON Web Token.
 *
 * @param {string} token The JWT string to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If verification fails (e.g., token expired, invalid signature, missing secret).
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
}

/**
 * Verifies and decodes a refresh token.
 *
 * @param {string} token The refresh token string to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If verification fails (e.g., token expired, invalid signature, missing secret).
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
}
