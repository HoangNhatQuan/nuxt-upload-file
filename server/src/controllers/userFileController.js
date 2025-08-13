const userService = require("../services/userService");
const { uploadFile, removeFiles, getFileUrl } = require("../models/file");
const { supabase, BUCKET_NAME } = require("../config/database");
/**
 * Upload file for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadUserFile = async (req, res) => {
  try {
    const { username } = req.body;

    console.log("username", username);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Upload to Supabase
        const uploadResult = await uploadFile({
          file,
          contentType: file.mimetype,
          userId: username,
          description: req.body.description || "",
        });

        // Create file item for user
        const fileItem = {
          id: uploadResult.key.split(".")[0], // Use the UUID part as ID
          path: uploadResult.key,
          bucket: BUCKET_NAME,
          size: uploadResult.size,
          mimeType: uploadResult.contentType,
          name: uploadResult.name,
          createdAt: new Date(),
          publicURL: uploadResult.urlSigned,
          metadata: {
            originalName: uploadResult.name,
            description: uploadResult.description,
            uploadedBy: username,
          },
        };

        // Add file to user's files array
        await userService.addFileToUser(username, fileItem);

        results.push({
          ...uploadResult,
          id: fileItem.id,
        });
      } catch (error) {
        console.error(`Upload error for file ${file.originalname}:`, error);
        errors.push({
          file: file.originalname,
          error: error.message,
        });
      }
    }

    if (results.length > 0) {
      res.status(201).json({
        success: true,
        data: {
          files: results,
          uploaded: results.length,
          total: req.files.length,
        },
        message: `Successfully uploaded ${results.length} file(s)`,
        ...(errors.length > 0 && { errors }),
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No files were uploaded successfully",
        errors,
      });
    }
  } catch (error) {
    console.error("Upload user file error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload files",
    });
  }
};

/**
 * Get files for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserFiles = async (req, res) => {
  try {
    const { username } = req.query;

    const userFiles = await userService.getUserFiles(username);
    const existingFiles = [];

    for (const file of userFiles) {
      try {
        // Check if file exists in Supabase
        const { data: fileExists } = await supabase.storage
          .from(file.bucket)
          .list("", {
            limit: 1,
            search: file.path,
          });

        if (fileExists && fileExists.length > 0) {
          // Get fresh signed URL
          const signedUrl = await getFileUrl(file.path, 15 * 60);

          existingFiles.push({
            ...(file.toObject ? file.toObject() : file),
            urlSigned: signedUrl,
          });
        }
      } catch (error) {
        console.error(`Error verifying file ${file.path}:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        files: existingFiles,
        total: existingFiles.length,
      },
    });
  } catch (error) {
    console.error("Get user files error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve files",
      data: {
        files: [],
        total: 0,
      },
    });
  }
};

/**
 * Delete file for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUserFile = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;

    const fileItem = await userService.findUserFileById(username, id);
    if (!fileItem) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const deleteResults = await removeFiles([fileItem.path]);
    const deleteResult = deleteResults[0];

    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to delete file from storage: ${deleteResult.error}`,
      });
    }

    await userService.removeFileFromUser(username, id);

    res.json({
      success: true,
      data: {
        deleted: true,
        fileId: id,
      },
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete user file error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete file",
    });
  }
};

/**
 * Get signed URL for user's file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserFileUrl = async (req, res) => {
  try {
    const { username } = req.query;
    const { id } = req.params;
    const expiresIn = parseInt(req.query.expiresIn) || 15 * 60;

    // Find file in user's files
    const fileItem = await userService.findUserFileById(username, id);

    if (!fileItem) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Get signed URL
    const signedUrl = await getFileUrl(fileItem.path, expiresIn);

    res.json({
      success: true,
      data: {
        url: signedUrl,
        expiresIn,
      },
    });
  } catch (error) {
    console.error("Get user file URL error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate file URL",
    });
  }
};

module.exports = {
  uploadUserFile,
  getUserFiles,
  deleteUserFile,
  getUserFileUrl,
};
