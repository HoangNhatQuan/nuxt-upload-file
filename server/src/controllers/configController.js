const configService = require("../services/configService");

/**
 * Get server health status
 */
const getHealth = (req, res) => {
  try {
    const healthStatus = configService.getHealthStatus();
    res.json(healthStatus);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "ERROR", 
      message: "Server health check failed" 
    });
  }
};

/**
 * Get upload configuration for client
 */
const getConfig = (req, res) => {
  try {
    const config = configService.getUploadConfiguration();
    res.json(config);
  } catch (error) {
    console.error("Config error:", error);
    res.status(500).json({ error: "Failed to get upload configuration" });
  }
};

module.exports = {
  getHealth,
  getConfig,
};
