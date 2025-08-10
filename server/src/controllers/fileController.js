const crypto = require("crypto");
const path = require("path");
const {
  uploadFile,
  removeFiles,
  getFileUrl,
  listFiles,
} = require("../models/file");
const { getUploadConfig } = require("../config/upload");

// Get server health status
const getHealth = (req, res) => {
  const { CLOUD_MAX_FILE_BYTES, CLOUD_PROVIDER } = require("../config/upload");

  res.json({
    status: "OK",
    message: "Server is running",
    config: {
      maxFileSize: `${Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024))}MB`,
      maxFilesPerRequest: 10,
      provider: CLOUD_PROVIDER,
      bucket: process.env.SUPABASE_BUCKET || "files",
    },
  });
};

// Get upload configuration for client
const getConfig = (req, res) => {
  try {
    const config = getUploadConfig();
    res.json(config);
  } catch (error) {
    console.error("Config error:", error);
    res.status(500).json({ error: "Failed to get upload configuration" });
  }
};

// Get all uploaded files with pagination and filtering
const getFiles = async (req, res) => {
  try {
    const { prefix = "", limit = 50, offset = 0 } = req.query;

    const result = await listFiles({
      prefix: prefix,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Transform the data to match the client's expected format
    const transformedFiles = result.items.map((item) => ({
      filename: item.key || item.name,
      originalName: item.originalName || item.name,
      size: item.size,
      mimetype: item.contentType,
      uploadDate: item.updatedAt,
      updatedAt: item.updatedAt,
      description: item.description || "",
      url: `https://ougcutnevvvrbucgxgla.supabase.co/storage/v1/object/public/kinobi/${
        item.key || item.name
      }`,
    }));

    res.json({
      files: transformedFiles,
      total: result.total,
      nextOffset: result.nextOffset,
    });
  } catch (error) {
    console.error("Error reading files:", error);
    res.status(500).json({ error: "Failed to retrieve files" });
  }
};

// Upload multiple files
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        message: "Please select at least one file to upload",
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
        const sanitizedFilename = path.basename(file.originalname);

        // Upload to cloud storage
        const result = await uploadFile({
          file: {
            ...file,
            originalname: sanitizedFilename,
          },
          contentType: file.mimetype,
          description: sanitizedFilename,
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
};

// Upload single file (legacy endpoint)
const uploadSingleFile = async (req, res) => {
  try {
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
};

// Get signed URL for file access
const getFileSignedUrl = async (req, res) => {
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
};

// Delete multiple files
const deleteFiles = async (req, res) => {
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
};

// Delete single file (legacy endpoint)
const deleteSingleFile = async (req, res) => {
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
};

module.exports = {
  getHealth,
  getConfig,
  getFiles,
  uploadFiles,
  uploadSingleFile,
  getFileSignedUrl,
  deleteFiles,
  deleteSingleFile,
};
