const multer = require("multer");
const { CLOUD_MAX_FILE_BYTES, allAllowedTypes } = require("../config/upload");

// Configure multer for memory storage (for Supabase upload)
const storage = multer.memoryStorage();

// Enhanced file filter with comprehensive MIME type validation
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${
          file.mimetype
        }. Allowed types: ${allAllowedTypes.join(", ")}`
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: CLOUD_MAX_FILE_BYTES, // 50MB limit
    files: 10, // Allow up to 10 files per request
    fieldSize: 10 * 1024 * 1024, // 10MB for field data
  },
});

module.exports = {
  upload,
};
