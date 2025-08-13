const userService = require("../services/userService");

/**
 * User signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error:
          "Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens",
      });
    }

    const user = await userService.createUser(username, password);

    res.status(201).json({
      success: true,
      data: {
        username: user.username,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);

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

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    const user = await userService.authenticateUser(username, password);

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
      },
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Signin error:", error);

    if (error.message === "Invalid username or password") {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

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
