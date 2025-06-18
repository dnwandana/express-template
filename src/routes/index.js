import { Router } from "express";
import { requireToken } from "../middlewares/authorization.js";
import authRoutes from "./authentication.js";
import todosRoutes from "./todos.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/todos", requireToken, todosRoutes);

export default router;
