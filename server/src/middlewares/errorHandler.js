const multer = require("multer");
const { CLOUD_MAX_FILE_BYTES, getUploadConfig } = require("../config/upload");

// Centralized error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  // Handle multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `File too large. Maximum size is ${Math.round(
          CLOUD_MAX_FILE_BYTES / (1024 * 1024)
        )}MB.`,
        maxSize: CLOUD_MAX_FILE_BYTES,
        maxSizeMB: Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024)),
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files. Maximum 10 files allowed per request.",
      });
    }
  }

  // Handle file filter errors
  if (error.message && error.message.includes("Invalid file type")) {
    return res.status(400).json({
      error: error.message,
      allowedTypes: getUploadConfig().allowedMimeTypes,
    });
  }

  // Handle validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: error.message,
    });
  }

  // Handle database errors
  if (error.code === "PGRST116") {
    return res.status(404).json({
      error: "Resource not found",
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
