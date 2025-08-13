require("dotenv").config();
const { connectDB } = require("../src/config/mongodb");
const User = require("../src/models/user");

const testMongoDB = async () => {
  console.log("🧪 Testing MongoDB Connection...\n");

  try {
    // Test 1: Connect to MongoDB
    console.log("1. Testing MongoDB connection...");
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    // Test 2: Create a test user
    console.log("\n2. Testing user creation...");
    const testUser = new User({
      username: "testuser_mongodb",
      passwordHash: "test_hash_123",
    });

    await testUser.save();
    console.log("✅ Test user created successfully");

    // Test 3: Find the test user
    console.log("\n3. Testing user retrieval...");
    const foundUser = await User.findByUsername("testuser_mongodb");
    if (foundUser) {
      console.log("✅ Test user retrieved successfully");
    } else {
      throw new Error("User not found");
    }

    // Test 4: Add a test file to user
    console.log("\n4. Testing file addition...");
    const testFile = {
      id: "test-file-123",
      path: "test/path/file.jpg",
      bucket: "test-bucket",
      size: 1024,
      mimeType: "image/jpeg",
      name: "test-file.jpg",
      createdAt: new Date(),
      metadata: { test: true },
    };

    await foundUser.addFile(testFile);
    console.log("✅ Test file added successfully");

    // Test 5: Verify file was added
    console.log("\n5. Testing file retrieval...");
    const updatedUser = await User.findByUsername("testuser_mongodb");
    if (updatedUser.files.length === 1) {
      console.log("✅ Test file retrieved successfully");
    } else {
      throw new Error("File not found in user files");
    }

    // Test 6: Remove test file
    console.log("\n6. Testing file removal...");
    await updatedUser.removeFile("test-file-123");
    console.log("✅ Test file removed successfully");

    // Test 7: Clean up - remove test user
    console.log("\n7. Cleaning up test data...");
    await User.deleteOne({ username: "testuser_mongodb" });
    console.log("✅ Test user removed successfully");

    console.log("\n🎉 All MongoDB tests passed!");
  } catch (error) {
    console.error("❌ MongoDB test failed:", error.message);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testMongoDB();
}

module.exports = { testMongoDB };
