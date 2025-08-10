const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getHealth,
  getConfig,
  getFiles,
  uploadFiles,
  uploadSingleFile,
  getFileSignedUrl,
  deleteFiles,
  deleteSingleFile,
} = require("../../controllers/fileController");
const { upload } = require("../../middlewares/upload");
const {
  validateUpload,
  handleValidationErrors,
} = require("../../middlewares/validation");

const router = express.Router();

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: "Too many uploads from this IP, please try again later.",
});

// Health check
router.get("/health", getHealth);

// Get upload configuration
router.get("/upload/config", getConfig);

// Get all files
router.get("/files", getFiles);

// Upload multiple files
router.post(
  "/upload",
  uploadLimiter,
  (req, res, next) => {
    // Handle both "files" (multiple) and "file" (single) field names
    const uploadMiddleware = upload.any();
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      // Ensure req.files exists for consistency
      if (!req.files) {
        req.files = [];
      }
      // Log for debugging
      console.log("Upload request received:", {
        filesCount: req.files ? req.files.length : 0,
        body: req.body,
        headers: req.headers["content-type"],
      });
      next();
    });
  },
  validateUpload,
  handleValidationErrors,
  uploadFiles
);

// Legacy single file upload for backward compatibility
router.post(
  "/upload/single",
  uploadLimiter,
  upload.single("file"),
  validateUpload,
  handleValidationErrors,
  uploadSingleFile
);

// Get signed URL for file access
router.get("/files/:key/url", getFileSignedUrl);

// Delete multiple files
router.delete("/files", deleteFiles);

// Legacy single file delete endpoint for backward compatibility
router.delete("/files/:key", deleteSingleFile);

module.exports = router;
