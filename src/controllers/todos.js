import joi from "joi"
import HttpError from "../utils/http-error.js"
import apiResponse from "../utils/response.js"
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGE } from "../utils/constant.js"
import * as todoModel from "../models/todos.js"
import crypto from "node:crypto"
import logger from "../utils/logger.js"
import { validatePaginationQuery, executePaginatedQuery } from "../utils/pagination.js"

const todoIdParamSchema = joi.object({
  todo_id: joi.string().uuid().required(),
})

const todoBodySchema = joi
  .object({
    title: joi.string().max(255).required(),
    description: joi.string().max(5000).optional(),
    is_completed: joi.boolean().optional(),
  })
  .options({ stripUnknown: true })

const deleteTodosQuerySchema = joi
  .object({
    ids: joi
      .string()
      .required()
      .custom((value, helpers) => {
        const ids = value.split(",").map((id) => id.trim())
        if (ids.length > 50) {
          return helpers.error("any.invalid")
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        for (const id of ids) {
          if (!uuidRegex.test(id)) {
            return helpers.error("any.invalid")
          }
        }
        return ids
      })
      .messages({ "any.invalid": "ids must be 1-50 comma-separated valid UUIDs" }),
  })
  .options({ stripUnknown: true })

/**
 * Express middleware to require a todo_id parameter in the request.
 *
 * Validates the todo_id parameter in the request URL.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with error status and message
 */
export const requireTodoIdParam = (req, res, next) => {
  const { error, value } = todoIdParamSchema.validate(req.params)
  if (error) {
    throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // request value
  const { todo_id } = value

  // assign request value
  req.todoId = todo_id

  next()
}

export const getTodos = async (req, res, next) => {
  try {
    // request values
    const userId = req.user.id
    const params = validatePaginationQuery(req.query, ["updated_at", "title"])

    // get total count and todos simultaneously
    const { data: todos, pagination } = await executePaginatedQuery(
      todoModel.count,
      todoModel.findManyPaginated,
      { user_id: userId },
      params,
      ["title"],
    )

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          todos,
          pagination,
        },
      }),
    )
  } catch (error) {
    logger.error("Get todos error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    })
    return next(error)
  }
}

export const getTodo = async (req, res, next) => {
  try {
    // request values
    const userId = req.user.id
    const todoId = req.todoId

    // get todo
    const todo = await todoModel.findOne({ id: todoId, user_id: userId })

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          todo: todo,
        },
      }),
    )
  } catch (error) {
    logger.error("Get todo error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      todoId: req.todoId,
    })
    return next(error)
  }
}

export const createTodo = async (req, res, next) => {
  try {
    // request values
    const { error, value } = todoBodySchema.validate(req.body)
    if (error) {
      throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message)
    }

    // request values
    const userId = req.user.id
    const { title, description, is_completed } = value

    // create todo
    const [todo] = await todoModel.create({
      id: crypto.randomUUID(),
      user_id: userId,
      title: title,
      description: description,
      is_completed: is_completed,
      created_at: new Date(),
      updated_at: new Date(),
    })

    logger.info("Todo created successfully", {
      todoId: todo.id,
      userId: userId,
      title: title,
    })

    return res.status(HTTP_STATUS_CODE.CREATED).json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.CREATED,
        data: {
          todo: todo,
        },
      }),
    )
  } catch (error) {
    logger.error("Create todo error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    })
    return next(error)
  }
}

export const updateTodo = async (req, res, next) => {
  try {
    // request values
    const { error, value } = todoBodySchema.validate(req.body)
    if (error) {
      throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message)
    }

    // request values
    const userId = req.user.id
    const todoId = req.todoId
    const { title, description, is_completed } = value

    // update todo
    const [todo] = await todoModel.update(
      { id: todoId, user_id: userId },
      {
        title: title,
        description: description,
        is_completed: is_completed,
        updated_at: new Date(),
      },
    )

    logger.info("Todo updated successfully", {
      todoId: todoId,
      userId: userId,
    })

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          todo: todo,
        },
      }),
    )
  } catch (error) {
    logger.error("Update todo error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      todoId: req.todoId,
    })
    return next(error)
  }
}

export const deleteTodo = async (req, res, next) => {
  try {
    // request values
    const userId = req.user.id
    const todoId = req.todoId

    // delete todo
    await todoModel.remove({ id: todoId, user_id: userId })

    logger.info("Todo deleted successfully", {
      todoId: todoId,
      userId: userId,
    })

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
      }),
    )
  } catch (error) {
    logger.error("Delete todo error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      todoId: req.todoId,
    })
    return next(error)
  }
}

export const deleteTodos = async (req, res, next) => {
  try {
    const { error, value } = deleteTodosQuerySchema.validate(req.query)
    if (error) {
      throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message)
    }

    // request values
    const userId = req.user.id
    const todoIds = value.ids

    // delete todos
    await todoModel.removeMany(todoIds, { user_id: userId })

    logger.info("Multiple todos deleted successfully", {
      count: todoIds.length,
      userId: userId,
    })

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
      }),
    )
  } catch (error) {
    logger.error("Delete multiple todos error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    })
    return next(error)
  }
}
