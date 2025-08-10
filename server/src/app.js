require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://project-uploader-phi.vercel.app"]
        : [/^http:\/\/localhost:\d+$/, /^http:\/\/172\.16\.0\.\d+:\d+$/],
    credentials: true,
  })
);

// Rate limiting for all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use(routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

module.exports = { app, PORT };
