const { getUploadConfig } = require("../config/upload");

class ConfigService {
  /**
   * Get server health status
   */
  getHealthStatus() {
    const {
      CLOUD_MAX_FILE_BYTES,
      CLOUD_PROVIDER,
    } = require("../config/upload");

    return {
      status: "OK",
      message: "Server is running",
      config: {
        maxFileSize: `${Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024))}MB`,
        maxFilesPerRequest: 10,
        provider: CLOUD_PROVIDER,
        bucket: process.env.SUPABASE_BUCKET || "files",
      },
    };
  }

  /**
   * Get upload configuration for client
   */
  getUploadConfiguration() {
    try {
      return getUploadConfig();
    } catch (error) {
      console.error("Config error:", error);
      throw new Error("Failed to get upload configuration");
    }
  }
}

module.exports = new ConfigService();
