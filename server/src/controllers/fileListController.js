const fileService = require("../services/fileService");

/**
 * Get all uploaded files with pagination and filtering
 */
const getFiles = async (req, res) => {
  try {
    const { prefix = "", limit = 50, offset = 0 } = req.query;

    const result = await fileService.getFiles({
      prefix,
      limit,
      offset,
    });

    res.json({
      files: result.files,
      total: result.total,
      nextOffset: result.nextOffset,
    });
  } catch (error) {
    console.error("Error reading files:", error);
    res.status(500).json({ error: "Failed to retrieve files" });
  }
};

/**
 * Get signed URL for file access
 */
const getFileSignedUrl = async (req, res) => {
  try {
    const key = req.params.key;
    const expiresIn = parseInt(req.query.expiresIn) || 15 * 60; // Default 15 minutes

    const signedUrl = await fileService.getSignedUrl(key, expiresIn);
    res.json({ url: signedUrl });
  } catch (error) {
    console.error("Get file URL error:", error);
    if (error.message === "Invalid key") {
      res.status(400).json({ error: "Invalid key" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  }
};

module.exports = {
  getFiles,
  getFileSignedUrl,
};
