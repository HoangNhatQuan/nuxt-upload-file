require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./config/mongodb");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize MongoDB connection
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Security middleware
    app.use(helmet());
    app.use(
      cors({
        origin:
          process.env.NODE_ENV === "production"
            ? [
                "https://nuxt-upload-file-2vkp.vercel.app",
                "http://localhost:3000",
                /^http:\/\/localhost:\d+$/,
                /^http:\/\/172\.16\.0\.\d+:\d+$/,
              ]
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

    console.log("✅ App initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    process.exit(1);
  }
};

// Initialize the app
initializeApp();

module.exports = { app, PORT };
