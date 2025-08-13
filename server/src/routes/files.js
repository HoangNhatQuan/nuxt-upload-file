const express = require("express");
const rateLimit = require("express-rate-limit");
const { upload } = require("../middlewares/upload");
const {
  validateUpload,
  handleValidationErrors,
} = require("../middlewares/validation");
const {
  uploadUserFile,
  getUserFiles,
  deleteUserFile,
  getUserFileUrl,
} = require("../controllers");

const router = express.Router();

// File upload rate limiting for users
const userUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 uploads per windowMs
  message: {
    success: false,
    error: "Too many uploads from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Get user's files
router.get("/", getUserFiles);

// Upload files for user
router.post(
  "/upload",
  userUploadLimiter,
  (req, res, next) => {
    const uploadMiddleware = upload.any();
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      if (!req.files) {
        req.files = [];
      }
      next();
    });
  },
  validateUpload,
  handleValidationErrors,
  uploadUserFile
);

// Get signed URL for user's file
router.get("/:id/url", getUserFileUrl);

// Delete user's file
router.delete("/:id", deleteUserFile);

module.exports = router;
