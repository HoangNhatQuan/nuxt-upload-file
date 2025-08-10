require("dotenv").config();
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE_URL = "http://localhost:3001/api";

// Test file upload with different field names
async function testUpload() {
  console.log("🧪 Testing file upload API...\n");

  // Test 1: Single file with 'file' field name
  console.log("Test 1: Single file upload with 'file' field name");
  try {
    const formData = new FormData();
    formData.append("file", "Hello World!", {
      filename: "test.txt",
      contentType: "text/plain",
    });
    formData.append("description", "Test file upload");

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Success:", result.message);
      console.log("   File ID:", result.files[0].id);
    } else {
      const error = await response.json();
      console.log("❌ Error:", error.error);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Multiple files with 'files' field name
  console.log("Test 2: Multiple files upload with 'files' field name");
  try {
    const formData = new FormData();
    formData.append("files", "File 1 content", {
      filename: "test1.txt",
      contentType: "text/plain",
    });
    formData.append("files", "File 2 content", {
      filename: "test2.txt",
      contentType: "text/plain",
    });
    formData.append("description", "Multiple files test");

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Success:", result.message);
      console.log("   Files uploaded:", result.files.length);
    } else {
      const error = await response.json();
      console.log("❌ Error:", error.error);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Health check
  console.log("Test 3: Health check");
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Server health:", result.status);
      console.log("   Config:", result.config);
    } else {
      console.log("❌ Health check failed");
    }
  } catch (error) {
    console.log("❌ Health check error:", error.message);
  }
}

// Test file size validation
async function testFileSizeValidation() {
  console.log("\n" + "=".repeat(50));
  console.log("Test 4: File size validation");
  
  try {
    const formData = new FormData();
    // Create a large buffer (51MB) to test size limit
    const largeBuffer = Buffer.alloc(51 * 1024 * 1024); // 51MB
    formData.append("file", largeBuffer, {
      filename: "large-file.bin",
      contentType: "application/octet-stream",
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.status === 400) {
      const error = await response.json();
      console.log("✅ File size validation working:", error.error);
    } else {
      console.log("❌ File size validation failed - should have rejected large file");
    }
  } catch (error) {
    console.log("❌ File size test error:", error.message);
  }
}

// Test file type validation
async function testFileTypeValidation() {
  console.log("\n" + "=".repeat(50));
  console.log("Test 5: File type validation");
  
  try {
    const formData = new FormData();
    formData.append("file", "executable content", {
      filename: "test.exe",
      contentType: "application/x-executable",
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.status === 400) {
      const error = await response.json();
      console.log("✅ File type validation working:", error.error);
    } else {
      console.log("❌ File type validation failed - should have rejected .exe file");
    }
  } catch (error) {
    console.log("❌ File type test error:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testUpload();
  await testFileSizeValidation();
  await testFileTypeValidation();
  
  console.log("\n" + "=".repeat(50));
  console.log("🎉 All tests completed!");
}

// Check if fetch is available (Node 18+)
if (typeof fetch === "undefined") {
  console.log("❌ This script requires Node.js 18+ for fetch support");
  console.log("   Please upgrade Node.js or install node-fetch");
  process.exit(1);
}

runAllTests().catch(console.error); 