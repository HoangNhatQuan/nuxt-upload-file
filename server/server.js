require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const {
  uploadFile,
  removeFiles,
  getFileUrl,
  listFiles,
  getFileMetadata,
  getUploadConfig,
} = require("./storage");

const app = express();
const PORT = process.env.PORT || 3001;

// Cloud storage configuration
const CLOUD_MAX_FILE_BYTES =
  parseInt(process.env.CLOUD_MAX_FILE_BYTES) || 50 * 1024 * 1024; // 50MB default
const CLOUD_PROVIDER = process.env.CLOUD_PROVIDER || "supabase";

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : [/^http:\/\/localhost:\d+$/, /^http:\/\/172\.16\.0\.\d+:\d+$/],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: "Too many uploads from this IP, please try again later.",
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure multer for memory storage (for Supabase upload)
const storage = multer.memoryStorage();

// Enhanced file filter with comprehensive MIME type validation
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types by category
  const allowedMimeTypes = {
    // Images
    images: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      "image/ico",
    ],
    // Videos
    videos: [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
      "video/3gp",
      "video/ogg",
      "video/m4v",
    ],
    // Audio
    audio: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/flac",
      "audio/wma",
      "audio/m4a",
      "audio/opus",
    ],
    // Documents
    documents: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/rtf",
      "application/json",
      "application/xml",
      "text/xml",
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ],
  };

  // Flatten all allowed types
  const allAllowedTypes = [
    ...allowedMimeTypes.images,
    ...allowedMimeTypes.videos,
    ...allowedMimeTypes.audio,
    ...allowedMimeTypes.documents,
  ];

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

// Validation middleware
const validateUpload = [
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description too long"),
];

// Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    config: {
      maxFileSize: `${Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024))}MB`,
      maxFilesPerRequest: 10,
      provider: CLOUD_PROVIDER,
      bucket: process.env.SUPABASE_BUCKET || "files"
    }
  });
});

// Get upload configuration for client
app.get("/api/upload/config", (req, res) => {
  try {
    const config = getUploadConfig();
    res.json(config);
  } catch (error) {
    console.error("Config error:", error);
    res.status(500).json({ error: "Failed to get upload configuration" });
  }
});

// Get all uploaded files with pagination and filtering
app.get("/api/files", async (req, res) => {
  try {
    const { prefix = "", limit = 50, offset = 0 } = req.query;

    const result = await listFiles({
      prefix: prefix,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      files: result.items,
      total: result.total,
      nextOffset: result.nextOffset,
    });
  } catch (error) {
    console.error("Error reading files:", error);
    res.status(500).json({ error: "Failed to retrieve files" });
  }
});

// Enhanced upload endpoint supporting multiple files
app.post(
  "/api/upload",
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
        headers: req.headers['content-type']
      });
      next();
    });
  },
  validateUpload,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          error: "No files uploaded",
          message: "Please select at least one file to upload"
        });
      }

      const results = [];
      const uploadErrors = [];

      // Process each file
      for (const file of req.files) {
        try {
          // Calculate checksum for file integrity
          const checksum = crypto
            .createHash("md5")
            .update(file.buffer)
            .digest("hex");

          // Sanitize filename
          const sanitizedFilename = path
            .basename(file.originalname)
            .replace(/[^a-zA-Z0-9.-]/g, "_");

          // Upload to cloud storage
          const result = await uploadFile({
            file: {
              ...file,
              originalname: sanitizedFilename,
            },
            contentType: file.mimetype,
            description: req.body.description || "",
            checksum: checksum,
          });

          results.push({
            id: result.key,
            filename: sanitizedFilename,
            mimeType: file.mimetype,
            size: file.size,
            url: result.urlSigned,
            checksum: checksum,
            uploadedAt: result.uploadedAt,
          });
        } catch (error) {
          console.error(`Upload error for ${file.originalname}:`, error);
          uploadErrors.push({
            filename: file.originalname,
            error: error.message,
          });
        }
      }

      // Return results
      if (results.length > 0) {
        res.status(201).json({
          message: `Successfully uploaded ${results.length} file(s)`,
          files: results,
          errors: uploadErrors.length > 0 ? uploadErrors : undefined,
        });
      } else {
        res.status(400).json({
          error: "No files were uploaded successfully",
          errors: uploadErrors,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  }
);

// Legacy single file upload for backward compatibility
app.post(
  "/api/upload/single",
  uploadLimiter,
  upload.single("file"),
  validateUpload,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Calculate checksum
      const checksum = crypto
        .createHash("md5")
        .update(req.file.buffer)
        .digest("hex");

      // Sanitize filename
      const sanitizedFilename = path
        .basename(req.file.originalname)
        .replace(/[^a-zA-Z0-9.-]/g, "_");

      // Upload to Supabase storage
      const result = await uploadFile({
        file: {
          ...req.file,
          originalname: sanitizedFilename,
        },
        contentType: req.file.mimetype,
        description: req.body.description || "",
        checksum: checksum,
      });

      res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: result.key,
          filename: sanitizedFilename,
          originalName: result.name,
          size: result.size,
          mimetype: result.contentType,
          uploadDate: result.uploadedAt,
          description: result.description,
          url: result.urlSigned,
          checksum: checksum,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }
);

// Get signed URL for file access
app.get("/api/files/:key/url", async (req, res) => {
  try {
    const key = req.params.key;
    const expiresIn = parseInt(req.query.expiresIn) || 15 * 60; // Default 15 minutes

    // Security: Prevent directory traversal
    if (!key || key.includes("..") || key.includes("/")) {
      return res.status(400).json({ error: "Invalid key" });
    }

    const signedUrl = await getFileUrl(key, expiresIn);
    res.json({ url: signedUrl });
  } catch (error) {
    console.error("Get file URL error:", error);
    res.status(404).json({ error: "File not found" });
  }
});

// Delete files (supports multiple files)
app.delete("/api/files", async (req, res) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: "Keys array is required" });
    }

    // Security: Validate all keys
    for (const key of keys) {
      if (!key || key.includes("..") || key.includes("/")) {
        return res.status(400).json({ error: "Invalid key in array" });
      }
    }

    const results = await removeFiles(keys);
    res.json({
      message: "Files processed",
      results: results,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete files" });
  }
});

// Legacy single file delete endpoint for backward compatibility
app.delete("/api/files/:key", async (req, res) => {
  try {
    const key = req.params.key;

    // Security: Prevent directory traversal
    if (!key || key.includes("..") || key.includes("/")) {
      return res.status(400).json({ error: "Invalid key" });
    }

    const results = await removeFiles([key]);
    const result = results[0];

    if (result.success) {
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `File too large. Maximum size is ${Math.round(
          CLOUD_MAX_FILE_BYTES / (1024 * 1024)
        )}MB.`,
        maxSize: CLOUD_MAX_FILE_BYTES,
        maxSizeMB: Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024)),
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files. Maximum 10 files allowed per request.",
      });
    }
  }

  // Handle file filter errors
  if (error.message && error.message.includes("Invalid file type")) {
    return res.status(400).json({
      error: error.message,
      allowedTypes: getUploadConfig().allowedMimeTypes,
    });
  }

  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase bucket: ${process.env.SUPABASE_BUCKET || "files"}`);
});
