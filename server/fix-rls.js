require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

console.log("🔧 RLS Policy Diagnostic Tool\n");

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase environment variables");
  console.log(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function diagnoseRLS() {
  try {
    console.log("1. Testing Supabase connection...");

    // Test basic connection
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Connection failed:", bucketsError.message);
      return;
    }

    console.log("✅ Connection successful");

    const bucketName = process.env.SUPABASE_BUCKET || "files";
    const bucket = buckets.find((b) => b.name === bucketName);

    if (!bucket) {
      console.error(`❌ Bucket '${bucketName}' not found`);
      console.log("Available buckets:", buckets.map((b) => b.name).join(", "));
      return;
    }

    console.log(`✅ Bucket '${bucketName}' found`);
    console.log(`   Public: ${bucket.public}`);
    console.log(`   File size limit: ${bucket.file_size_limit} bytes`);

    // Test upload with service role
    console.log("\n2. Testing upload with service role...");

    const testKey = `test/rls-test-${Date.now()}.txt`;
    const testContent = "RLS test content";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testKey, testContent, {
        contentType: "text/plain",
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError.message);

      if (uploadError.message.includes("row-level security policy")) {
        console.log("\n🔧 RLS Policy Issue Detected!");
        console.log("\nTo fix this, choose one of these options:");
        console.log("\nOption A (Recommended): Disable RLS");
        console.log("1. Go to Supabase Dashboard → Storage → Buckets");
        console.log(`2. Click on bucket '${bucketName}'`);
        console.log("3. Toggle off 'Row Level Security (RLS)'");

        console.log("\nOption B: Add service role policy");
        console.log("Run this SQL in your Supabase SQL editor:");
        console.log(`
-- Allow service role to bypass RLS
CREATE POLICY "Service role bypass" ON storage.objects
FOR ALL USING (auth.role() = 'service_role');
        `);
      }
      return;
    }

    console.log("✅ Upload successful with service role");

    // Clean up test file
    await supabase.storage.from(bucketName).remove([testKey]);
    console.log("✅ Test file cleaned up");

    console.log("\n🎉 RLS is working correctly!");
    console.log("Your service role key has proper permissions.");
  } catch (error) {
    console.error("❌ Diagnostic failed:", error.message);
  }
}

diagnoseRLS();
