require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const {
  connectDB,
  getConnectionStatus,
  waitForConnection,
} = require("./config/mongodb");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection validation middleware
const requireDBConnection = async (req, res, next) => {
  if (!getConnectionStatus()) {
    try {
      await waitForConnection(5000); // Wait up to 5 seconds
      next();
    } catch (error) {
      return res.status(503).json({
        error: "Database temporarily unavailable",
        message: "Please try again in a moment",
      });
    }
  } else {
    next();
  }
};

// Initialize MongoDB connection
const initializeApp = async () => {
  try {
    console.log("🚀 Starting application initialization...");

    // Connect to MongoDB first
    await connectDB();

    // Wait for connection to be fully established
    await waitForConnection();

    // Security middleware
    app.use(helmet());
    app.use(
      cors({
        origin: "*",
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

    // Health check endpoint (no DB required)
    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: getConnectionStatus() ? "connected" : "disconnected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    // Apply DB connection validation to all API routes
    app.use("/api/", requireDBConnection);

    // Routes
    app.use(routes);

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // 404 handler (must be after all routes)
    app.use(notFoundHandler);

    console.log("✅ App initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    return false;
  }
};

module.exports = { app, PORT, initializeApp };
