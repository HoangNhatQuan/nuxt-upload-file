const express = require("express");
const authRoutes = require("./auth");
const filesRoutes = require("./files");
const { getHealth, getConfig } = require("../controllers");

const router = express.Router();

// Health check
router.get("/api/health", getHealth);

// Get upload configuration
router.get("/api/upload/config", getConfig);

// Authentication routes
router.use("/api/auth", authRoutes);

// User-scoped file routes
router.use("/api/files", filesRoutes);

module.exports = router;
