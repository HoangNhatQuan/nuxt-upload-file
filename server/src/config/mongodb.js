const mongoose = require("mongoose");

let isConnected = false;
let connectionPromise = null;

const connectDB = async (retries = 3, delay = 2000) => {
  // If already connected, return immediately
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("❌ MONGODB_URI environment variable is required");
  }

  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(
          `🔄 Connecting to MongoDB... (Attempt ${attempt}/${retries})`
        );

        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 10000,
          family: 4,
          maxPoolSize: 10,
          minPoolSize: 2,
          maxIdleTimeMS: 30000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log("✅ MongoDB connected successfully");

        // Handle connection events
        mongoose.connection.on("error", (err) => {
          console.error("❌ MongoDB connection error:", err);
          isConnected = false;
          connectionPromise = null;
        });

        mongoose.connection.on("disconnected", () => {
          console.log("⚠️ MongoDB disconnected");
          isConnected = false;
          connectionPromise = null;
        });

        mongoose.connection.on("reconnected", () => {
          console.log("🔄 MongoDB reconnected");
          isConnected = true;
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
          console.log("🔄 Closing MongoDB connection...");
          await mongoose.connection.close();
          console.log("✅ MongoDB connection closed through app termination");
          process.exit(0);
        });

        return;
      } catch (error) {
        console.error(
          `❌ MongoDB connection attempt ${attempt} failed:`,
          error.message
        );

        if (attempt === retries) {
          console.error("❌ All MongoDB connection attempts failed");
          connectionPromise = null;
          throw error;
        }

        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  })();

  return connectionPromise;
};

const getConnectionStatus = () => isConnected;

const waitForConnection = async (timeout = 30000) => {
  const startTime = Date.now();

  while (!isConnected && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!isConnected) {
    throw new Error("Database connection timeout");
  }

  return true;
};

module.exports = {
  connectDB,
  getConnectionStatus,
  waitForConnection,
};
