import { Router } from "express";
import * as todoController from "../controllers/todo.js";

const router = Router();

router
  .route("/")
  .get(todoController.getTodos)
  .post(todoController.createTodo)
  .delete(todoController.deleteTodos);

router
  .route("/:todo_id")
  .get(todoController.requireTodoIdParam, todoController.getTodo)
  .put(todoController.requireTodoIdParam, todoController.updateTodo)
  .delete(todoController.requireTodoIdParam, todoController.deleteTodo);

export default router;
