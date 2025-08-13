const fileService = require("../services/fileService");

/**
 * Upload multiple files
 */
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        message: "Please select at least one file to upload",
      });
    }

    const { results, uploadErrors } = await fileService.uploadMultipleFiles(
      req.files
    );

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

/**
 * Upload single file (legacy endpoint)
 */
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await fileService.uploadSingleFile(
      req.file,
      req.body.description || ""
    );

    res.status(201).json({
      message: "File uploaded successfully",
      file: result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

module.exports = {
  uploadFiles,
  uploadSingleFile,
};
