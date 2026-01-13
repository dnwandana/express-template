import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { httpLogger, requestLogger } from "./middlewares/logger.js";
import logger from "./utils/logger.js";

// initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logging middleware
app.use(httpLogger);
app.use(requestLogger);

// routes
app.use("/api", routes);

// not found and error handler
app.use(notFoundHandler);
app.use(errorHandler);

// start server
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
});
