const { app, PORT, initializeApp } = require("./app");

const startServer = async () => {
  try {
    console.log("🚀 Starting server...");

    // Initialize the app (including DB connection)
    const initialized = await initializeApp();

    if (!initialized) {
      console.error("❌ Failed to initialize application");
      process.exit(1);
    }

    // Start the server only after successful initialization
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(
        `📦 Supabase bucket: ${process.env.SUPABASE_BUCKET || "files"}`
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();
