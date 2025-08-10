require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Test Supabase connection
async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase environment variables");
    console.log(
      "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
    );
    return false;
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test bucket access
    const bucketName = process.env.SUPABASE_BUCKET || "files";
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Failed to connect to Supabase:", error.message);
      return false;
    }

    const bucketExists = data.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      console.error(`❌ Bucket '${bucketName}' not found`);
      console.log("Please create the bucket in your Supabase dashboard");
      return false;
    }

    console.log("✅ Supabase connection successful");
    console.log(`✅ Bucket '${bucketName}' found`);
    return true;
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message);
    return false;
  }
}

// Test file upload
async function testFileUpload() {
  console.log("\nTesting file upload...");

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const bucketName = process.env.SUPABASE_BUCKET || "files";
    const testKey = "test/hello.txt";
    const testContent = "Hello, Supabase!";

    // Upload test file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testKey, testContent, {
        contentType: "text/plain",
      });

    if (error) {
      console.error("❌ File upload failed:", error.message);
      return false;
    }

    console.log("✅ Test file uploaded successfully");

    // Clean up test file
    await supabase.storage.from(bucketName).remove([testKey]);

    console.log("✅ Test file cleaned up");
    return true;
  } catch (error) {
    console.error("❌ File upload test failed:", error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log("🧪 Running Supabase integration tests...\n");

  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  const uploadOk = await testFileUpload();
  if (!uploadOk) {
    process.exit(1);
  }

  console.log(
    "\n🎉 All tests passed! Supabase integration is working correctly."
  );
}

runTests().catch(console.error);
