const fileService = require("../services/fileService");

/**
 * Delete multiple files
 */
const deleteFiles = async (req, res) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: "Keys array is required" });
    }

    const results = await fileService.deleteFiles(keys);
    res.json({
      message: "Files processed",
      results: results,
    });
  } catch (error) {
    console.error("Delete error:", error);
    if (error.message === "Invalid key in array") {
      res.status(400).json({ error: "Invalid key in array" });
    } else {
      res.status(500).json({ error: "Failed to delete files" });
    }
  }
};

/**
 * Delete single file (legacy endpoint)
 */
const deleteSingleFile = async (req, res) => {
  try {
    const key = req.params.key;

    const result = await fileService.deleteSingleFile(key);

    if (result.success) {
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    if (error.message === "Invalid key") {
      res.status(400).json({ error: "Invalid key" });
    } else {
      res.status(500).json({ error: "Failed to delete file" });
    }
  }
};

module.exports = {
  deleteFiles,
  deleteSingleFile,
};
