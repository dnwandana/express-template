import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import routes from "./routes/index.js"
import { errorHandler, notFoundHandler } from "./middlewares/error.js"
import { httpLogger, requestLogger } from "./middlewares/logger.js"
import logger from "./utils/logger.js"
import validateEnv from "./utils/validate-env.js"

// validate environment variables before anything else
validateEnv()

// initialize express app
const app = express()
const PORT = process.env.PORT

// middlewares
app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"] } },
    referrerPolicy: { policy: "no-referrer" },
  }),
)
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) || [
      "http://localhost:8080",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-access-token", "x-refresh-token"],
  }),
)
app.use(express.json({ limit: "100kb" }))
app.use(express.urlencoded({ extended: true, limit: "100kb" }))

// logging middleware
app.use(httpLogger)
app.use(requestLogger)

// routes
app.use("/api", routes)

// not found and error handler
app.use(notFoundHandler)
app.use(errorHandler)

// start server
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV,
  })
})
