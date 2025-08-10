// Security utility functions

// Validate file key to prevent directory traversal
const validateFileKey = (key) => {
  if (!key || typeof key !== "string") {
    return false;
  }

  // Prevent directory traversal attacks
  if (key.includes("..") || key.includes("/") || key.includes("\\")) {
    return false;
  }

  return true;
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== "string") {
    return "";
  }

  // Remove path separators and other potentially dangerous characters
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
};

// Validate array of keys
const validateKeysArray = (keys) => {
  if (!Array.isArray(keys) || keys.length === 0) {
    return false;
  }

  return keys.every((key) => validateFileKey(key));
};

module.exports = {
  validateFileKey,
  sanitizeFilename,
  validateKeysArray,
};
