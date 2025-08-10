const express = require("express");
const fileRoutes = require("./api/files");

const router = express.Router();

// API routes
router.use("/api", fileRoutes);

module.exports = router;
