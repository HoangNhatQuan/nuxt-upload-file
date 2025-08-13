const crypto = require("crypto");
const path = require("path");
const {
  uploadFile,
  removeFiles,
  getFileUrl,
  listFiles,
} = require("../models/file");

class FileService {
  /**
   * Calculate MD5 checksum for file integrity
   */
  calculateChecksum(buffer) {
    return crypto.createHash("md5").update(buffer).digest("hex");
  }

  /**
   * Sanitize filename to prevent security issues
   */
  sanitizeFilename(filename) {
    return path.basename(filename);
  }

  /**
   * Get all files with pagination and filtering
   */
  async getFiles(options = {}) {
    const { prefix = "", limit = 50, offset = 0 } = options;

    const result = await listFiles({
      prefix,
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

    return {
      files: transformedFiles,
      total: result.total,
      nextOffset: result.nextOffset,
    };
  }

  /**
   * Upload a single file
   */
  async uploadSingleFile(file, description = "") {
    // Calculate checksum for file integrity
    const checksum = this.calculateChecksum(file.buffer);

    // Sanitize filename
    const sanitizedFilename = this.sanitizeFilename(file.originalname);

    // Upload to cloud storage
    const result = await uploadFile({
      file: {
        ...file,
        originalname: sanitizedFilename,
      },
      contentType: file.mimetype,
      description: description || sanitizedFilename,
      checksum: checksum,
    });

    return {
      id: result.key,
      filename: sanitizedFilename,
      originalName: result.name,
      size: result.size,
      mimetype: result.contentType,
      uploadDate: result.uploadedAt,
      description: result.description,
      url: result.urlSigned,
      checksum: checksum,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files) {
    const results = [];
    const uploadErrors = [];

    // Process each file
    for (const file of files) {
      try {
        const result = await this.uploadSingleFile(file);
        results.push({
          id: result.id,
          filename: result.filename,
          mimeType: result.mimetype,
          size: result.size,
          url: result.url,
          checksum: result.checksum,
          uploadedAt: result.uploadDate,
        });
      } catch (error) {
        console.error(`Upload error for ${file.originalname}:`, error);
        uploadErrors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    return {
      results,
      uploadErrors,
    };
  }

  /**
   * Get signed URL for file access
   */
  async getSignedUrl(key, expiresIn = 15 * 60) {
    // Security: Prevent directory traversal
    if (!key || key.includes("..") || key.includes("/")) {
      throw new Error("Invalid key");
    }

    return await getFileUrl(key, expiresIn);
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys) {
    // Security: Validate all keys
    for (const key of keys) {
      if (!key || key.includes("..") || key.includes("/")) {
        throw new Error("Invalid key in array");
      }
    }

    return await removeFiles(keys);
  }

  /**
   * Delete a single file
   */
  async deleteSingleFile(key) {
    // Security: Prevent directory traversal
    if (!key || key.includes("..") || key.includes("/")) {
      throw new Error("Invalid key");
    }

    const results = await removeFiles([key]);
    return results[0];
  }
}

module.exports = new FileService();
