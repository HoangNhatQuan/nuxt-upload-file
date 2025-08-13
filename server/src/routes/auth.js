const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, signin } = require("../controllers/authController");

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth attempts per windowMs
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// User signup
router.post("/signup", signup);

// User signin
router.post("/signin", signin);

module.exports = router;
