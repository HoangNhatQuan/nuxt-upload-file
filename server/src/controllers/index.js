const { getHealth, getConfig } = require("./configController");
const { getFiles, getFileSignedUrl } = require("./fileListController");
const { uploadFiles, uploadSingleFile } = require("./fileUploadController");
const { deleteFiles, deleteSingleFile } = require("./fileDeleteController");

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
