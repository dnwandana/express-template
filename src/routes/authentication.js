import { Router } from "express";
import {
  requireAccessToken,
  requireRefreshToken,
} from "../middlewares/authorization.js";
import * as authController from "../controllers/authentication.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post(
  "/refresh",
  requireAccessToken,
  requireRefreshToken,
  authController.refreshAccessToken
);

export default router;
