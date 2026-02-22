import { Router } from "express"
import db from "../config/database.js"
import apiResponse from "../utils/response.js"

const router = Router()

router.get("/", async (req, res) => {
  let dbStatus = "ok"
  try {
    await db.raw("SELECT 1")
  } catch {
    dbStatus = "error"
  }

  const healthy = dbStatus === "ok"
  const status = healthy ? 200 : 503

  return res.status(status).json(
    apiResponse({
      message: healthy ? "healthy" : "unhealthy",
      data: {
        status: healthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
      },
    }),
  )
})

export default router
