import { Router } from "express"
import { requireRefreshToken } from "../middlewares/authorization.js"
import * as authController from "../controllers/authentication.js"

const router = Router()

router.post("/signup", authController.signup)
router.post("/signin", authController.signin)
router.post("/refresh", requireRefreshToken, authController.refreshAccessToken)

export default router
