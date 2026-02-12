import joi from "joi"
import HttpError from "../utils/http-error.js"
import apiResponse from "../utils/response.js"
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGE } from "../utils/constant.js"
import * as userModel from "../models/users.js"
import { hashPassword, verifyPassword } from "../utils/argon2.js"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js"
import logger from "../utils/logger.js"

const signupSchema = joi
  .object({
    username: joi
      .string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9._-]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "username must contain only letters, numbers, dots, underscores, or hyphens",
      }),
    password: joi.string().min(8).max(72).required(),
    confirmation_password: joi.string().required().valid(joi.ref("password")).messages({
      "any.only": "confirmation_password must match password",
    }),
  })
  .options({ stripUnknown: true })

const signinSchema = joi
  .object({
    username: joi
      .string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9._-]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "username must contain only letters, numbers, dots, underscores, or hyphens",
      }),
    password: joi.string().min(8).max(72).required(),
  })
  .options({ stripUnknown: true })

export const signup = async (req, res, next) => {
  try {
    // validate request body
    const { error, value } = signupSchema.validate(req.body)
    if (error) {
      throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message)
    }

    // request values
    const { username, password } = value

    // check if user already exists
    const existingUser = await userModel.findOne({ username })
    if (existingUser) {
      throw new HttpError(
        HTTP_STATUS_CODE.BAD_REQUEST,
        "user with the given username already exists",
      )
    }

    // hash password
    const hashedPassword = await hashPassword(password)

    // create user
    const [user] = await userModel.create({
      username: username,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    })

    logger.info("User registered successfully", {
      userId: user.id,
      username: user.username,
      ip: req.ip || req.connection.remoteAddress,
    })

    return res.status(HTTP_STATUS_CODE.CREATED).json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.CREATED,
        data: {
          id: user.id,
          username: user.username,
        },
      }),
    )
  } catch (error) {
    logger.error("Signup error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip || req.connection.remoteAddress,
    })
    return next(error)
  }
}

export const signin = async (req, res, next) => {
  try {
    // validate request body
    const { error, value } = signinSchema.validate(req.body)
    if (error) {
      throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message)
    }

    // request values
    const { username, password } = value

    // check if user exists
    const user = await userModel.findOneWithPassword({ username })
    if (!user) {
      throw new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "invalid credentials")
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password, password)
    if (!isPasswordValid) {
      throw new HttpError(HTTP_STATUS_CODE.UNAUTHORIZED, "invalid credentials")
    }

    // generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    logger.info("User signed in successfully", {
      userId: user.id,
      username: user.username,
      ip: req.ip || req.connection.remoteAddress,
    })

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          id: user.id,
          username: user.username,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      }),
    )
  } catch (error) {
    logger.error("Signin error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip || req.connection.remoteAddress,
    })
    return next(error)
  }
}

export const refreshAccessToken = async (req, res, next) => {
  try {
    // request values
    const userId = req.user.id

    // generate new access token
    const accessToken = generateAccessToken(userId)

    logger.info("Access token refreshed successfully", {
      userId: userId,
      ip: req.ip || req.connection.remoteAddress,
    })

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          access_token: accessToken,
        },
      }),
    )
  } catch (error) {
    logger.error("Refresh access token error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip || req.connection.remoteAddress,
    })
    return next(error)
  }
}
