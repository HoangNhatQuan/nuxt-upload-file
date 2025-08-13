const User = require("../models/user");
const {
  hashPassword,
  comparePassword,
  validatePassword,
} = require("../utils/password");

/**
 * Create a new user
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - Created user (without password)
 */
const createUser = async (username, password) => {
  try {
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.createUser(username, passwordHash);

    // Return user without password
    return {
      username: user.username,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

/**
 * Authenticate user
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - User info if authenticated
 */
const authenticateUser = async (username, password) => {
  try {
    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Return user info without password
    return {
      username: user.username,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Promise<Object>} - User object
 */
const getUserByUsername = async (username) => {
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};

/**
 * Add file to user's files array
 * @param {string} username - Username
 * @param {Object} fileItem - File item to add
 * @returns {Promise<Object>} - Updated user
 */
const addFileToUser = async (username, fileItem) => {
  try {
    const user = await getUserByUsername(username);
    await user.addFile(fileItem);
    return user;
  } catch (error) {
    console.error("Add file to user error:", error);
    throw error;
  }
};

/**
 * Remove file from user's files array
 * @param {string} username - Username
 * @param {string} fileId - File ID to remove
 * @returns {Promise<Object>} - Updated user
 */
const removeFileFromUser = async (username, fileId) => {
  try {
    const user = await getUserByUsername(username);
    await user.removeFile(fileId);
    return user;
  } catch (error) {
    console.error("Remove file from user error:", error);
    throw error;
  }
};

/**
 * Get user's files
 * @param {string} username - Username
 * @returns {Promise<Array>} - User's files array
 */
const getUserFiles = async (username) => {
  try {
    const user = await getUserByUsername(username);
    return user.files || [];
  } catch (error) {
    console.error("Get user files error:", error);
    throw error;
  }
};

/**
 * Find file by ID in user's files
 * @param {string} username - Username
 * @param {string} fileId - File ID
 * @returns {Promise<Object|null>} - File item or null
 */
const findUserFileById = async (username, fileId) => {
  try {
    const user = await getUserByUsername(username);
    return user.findFileById(fileId);
  } catch (error) {
    console.error("Find user file error:", error);
    throw error;
  }
};

module.exports = {
  createUser,
  authenticateUser,
  getUserByUsername,
  addFileToUser,
  removeFileFromUser,
  getUserFiles,
  findUserFileById,
};
