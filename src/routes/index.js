import { Router } from "express";
import { requireAccessToken } from "../middlewares/authorization.js";
import authRoutes from "./authentication.js";
import todosRoutes from "./todos.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/todos", requireAccessToken, todosRoutes);

export default router;
