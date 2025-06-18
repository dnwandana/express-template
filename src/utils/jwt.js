import jwt from "jsonwebtoken";

/**
 * Generates a signed JSON Web Token for a given user.
 *
 * @param {string|number} id The unique identifier of the user.
 * @returns {string} A signed JWT string.
 */
export const generateJWT = (id) => {
  const jwtPayload = {
    id,
  };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verifies and decodes a JSON Web Token.
 *
 * @param {string} token The JWT string to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If verification fails (e.g., token expired, invalid signature, missing secret).
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
