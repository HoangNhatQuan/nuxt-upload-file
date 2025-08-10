const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key (bypasses RLS)
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

const BUCKET_NAME = process.env.SUPABASE_BUCKET || "files";

module.exports = {
  supabase,
  BUCKET_NAME,
};
