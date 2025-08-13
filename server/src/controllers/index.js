const { getHealth, getConfig } = require("./configController");
const {
  deleteUserFile,
  getUserFileUrl,
  getUserFiles,
  uploadUserFile,
} = require("./userFileController");
const { signin, signup } = require("./authController");

module.exports = {
  getHealth,
  getConfig,
  deleteUserFile,
  getUserFileUrl,
  getUserFiles,
  uploadUserFile,
  signin,
  signup,
};
