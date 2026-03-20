const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const { StatusCodes } = require("http-status-codes");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const businessRoutes = require("./routes/businessRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { uploadsRoot } = require("./utils/paths");

const app = express();
app.set('trust proxy', 1);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 400,
    standardHeaders: true
  })
);
app.use(compression());
app.use(cookieParser(env.cookieSecret));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/uploads", express.static(uploadsRoot));

app.get("/", (req, res) => {
  res.status(StatusCodes.OK).json({ 
    message: "Atlasia Workbook API is running smoothly",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_req, res) => {
  res.status(StatusCodes.OK).json({ status: "ok", appName: env.atlasiaName });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/sprint", sprintRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
