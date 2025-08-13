const express = require("express");
const fileRoutes = require("./files/index");

const router = express.Router();

// API routes
router.use("/api", fileRoutes);

module.exports = router;
