import joi from "joi";
import HttpError from "../utils/http-error.js";
import apiResponse from "../utils/response.js";
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGE } from "../utils/constant.js";
import * as todoModel from "../models/todos.js";

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
  // params schema validation
  const paramSchema = joi.object({
    todo_id: joi.string().required(),
  });

  const { error, value } = paramSchema.validate(req.params);
  if (error) {
    throw new HttpError(HTTP_STATUS_CODE.BAD_REQUEST, error.details[0].message);
  }

  // request value
  const { todo_id } = value;

  // assign request value
  req.todoId = todo_id;

  next();
};

export const getTodos = async (req, res, next) => {
  try {
    // query schema validation for pagination
    const querySchema = joi.object({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      sort_by: joi.string().valid("updated_at", "title").default("updated_at"),
      sort_order: joi.string().valid("asc", "desc").default("desc"),
    });

    const { error, value } = querySchema.validate(req.query);
    if (error) {
      throw new HttpError(
        HTTP_STATUS_CODE.BAD_REQUEST,
        error.details[0].message
      );
    }

    // request values
    const userId = req.user.id;
    const { page, limit, sort_by, sort_order } = value;

    // calculate offset
    const offset = (page - 1) * limit;

    // get total count and todos simultaneously
    const [totalResult, todos] = await Promise.all([
      todoModel.count({ user_id: userId }),
      todoModel.findManyPaginated(
        { user_id: userId },
        {
          limit,
          offset,
          orders: [{ column: sort_by, order: sort_order }],
        }
      ),
    ]);

    // pagination information
    const total = parseInt(totalResult.count);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const pagination = {
      current_page: page,
      total_pages: totalPages,
      total_items: total,
      items_per_page: limit,
      has_next_page: hasNextPage,
      has_previous_page: hasPreviousPage,
      next_page: hasNextPage ? page + 1 : null,
      previous_page: hasPreviousPage ? page - 1 : null,
    };

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          todos: todos,
          pagination: pagination,
        },
      })
    );
  } catch (error) {
    console.error("error in getTodos", error);
    return next(error);
  }
};

export const getTodo = async (req, res, next) => {
  try {
    // request values
    const userId = req.user.id;
    const todoId = req.todoId;

    // get todo
    const todo = await todoModel.findOne({ id: todoId, user_id: userId });

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          todo: todo,
        },
      })
    );
  } catch (error) {
    console.error("error in getTodo", error);
    return next(error);
  }
};

export const createTodo = async (req, res, next) => {
  try {
    // request body schema validation
    const bodySchema = joi.object({
      title: joi.string().required(),
      description: joi.string().optional(),
      is_completed: joi.boolean().optional(),
    });

    // request values
    const { error, value } = bodySchema.validate(req.body);
    if (error) {
      throw new HttpError(
        HTTP_STATUS_CODE.BAD_REQUEST,
        error.details[0].message
      );
    }

    // request values
    const userId = req.user.id;
    const { title, description, is_completed } = value;

    // create todo
    const [todo] = await todoModel.create({
      user_id: userId,
      title: title,
      description: description,
      is_completed: is_completed,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(HTTP_STATUS_CODE.CREATED).json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.CREATED,
        data: {
          todo: todo,
        },
      })
    );
  } catch (error) {
    console.error("error in createTodo", error);
    return next(error);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    // request body schema validation
    const bodySchema = joi.object({
      title: joi.string().required(),
      description: joi.string().optional(),
      is_completed: joi.boolean().optional(),
    });

    // request values
    const { error, value } = bodySchema.validate(req.body);
    if (error) {
      throw new HttpError(
        HTTP_STATUS_CODE.BAD_REQUEST,
        error.details[0].message
      );
    }

    // request values
    const userId = req.user.id;
    const todoId = req.todoId;
    const { title, description, is_completed } = value;

    // update todo
    const [todo] = await todoModel.update(
      { id: todoId, user_id: userId },
      {
        title: title,
        description: description,
        is_completed: is_completed,
        updated_at: new Date(),
      }
    );

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
        data: {
          todo: todo,
        },
      })
    );
  } catch (error) {
    console.error("error in updateTodo", error);
    return next(error);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    // request values
    const userId = req.user.id;
    const todoId = req.todoId;

    // delete todo
    await todoModel.remove({ id: todoId, user_id: userId });

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
      })
    );
  } catch (error) {
    console.error("error in deleteTodo", error);
    return next(error);
  }
};

export const deleteTodos = async (req, res, next) => {
  try {
    // query schema validation
    const querySchema = joi.object({
      ids: joi.string().required(),
    });

    // request values
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      throw new HttpError(
        HTTP_STATUS_CODE.BAD_REQUEST,
        error.details[0].message
      );
    }

    // request values
    const userId = req.user.id;
    const { ids } = value;
    const todoIds = ids.split(",").map((id) => id.trim());

    // delete todos
    const deletePromises = todoIds.map(
      async (todoId) => await todoModel.remove({ id: todoId, user_id: userId })
    );
    await Promise.all(deletePromises);

    return res.json(
      apiResponse({
        message: HTTP_STATUS_MESSAGE.OK,
      })
    );
  } catch (error) {
    console.error("error in deleteTodos", error);
    return next(error);
  }
};
