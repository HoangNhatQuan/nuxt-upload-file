const userService = require("../services/userService");

/**
 * User signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error:
          "Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens",
      });
    }

    // Create user
    const user = await userService.createUser(username, password);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        username: user.username,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle specific errors
    if (error.message === "Username already exists") {
      return res.status(409).json({
        success: false,
        error: "Username already exists",
      });
    }

    if (error.message.includes("Password must be")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * User signin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Authenticate user
    const user = await userService.authenticateUser(username, password);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        username: user.username,
      },
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Signin error:", error);

    // Handle authentication errors
    if (error.message === "Invalid username or password") {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  signin,
};
