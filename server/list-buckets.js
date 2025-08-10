require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

console.log("📦 Supabase Bucket Manager\n");

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase environment variables");
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

async function manageBuckets() {
  try {
    console.log("1. Testing connection...");

    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Failed to list buckets:", error.message);
      return;
    }

    console.log("✅ Connection successful");
    console.log(`\n2. Available buckets (${buckets.length}):`);

    if (buckets.length === 0) {
      console.log("   No buckets found");
      console.log("\n3. Creating default bucket...");

      const bucketName = "files";
      const { data: newBucket, error: createError } =
        await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: null, // Allow all types
        });

      if (createError) {
        console.error("❌ Failed to create bucket:", createError.message);
        return;
      }

      console.log(`✅ Created bucket: ${bucketName}`);
      console.log(`   Public: ${newBucket.public}`);
      console.log(`   File size limit: ${newBucket.file_size_limit} bytes`);

      // Update .env file suggestion
      console.log("\n📝 Update your .env file with:");
      console.log(`SUPABASE_BUCKET=${bucketName}`);
    } else {
      buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket.name}`);
        console.log(`      Public: ${bucket.public}`);
        console.log(`      File size limit: ${bucket.file_size_limit} bytes`);
        console.log(`      Created: ${bucket.created_at}`);
        console.log("");
      });

      console.log("3. Current .env bucket setting:");
      console.log(
        `   SUPABASE_BUCKET=${process.env.SUPABASE_BUCKET || "not set"}`
      );

      const currentBucket = buckets.find(
        (b) => b.name === process.env.SUPABASE_BUCKET
      );
      if (currentBucket) {
        console.log("✅ Current bucket found in Supabase");
      } else {
        console.log("❌ Current bucket not found in Supabase");
        console.log(
          "   Update SUPABASE_BUCKET in your .env file to match one of the available buckets"
        );
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

manageBuckets();
