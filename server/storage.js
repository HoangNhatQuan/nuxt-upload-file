const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

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

// Cloud storage configuration
const CLOUD_MAX_FILE_BYTES =
  parseInt(process.env.CLOUD_MAX_FILE_BYTES) || 50 * 1024 * 1024; // 50MB default
const CLOUD_PROVIDER = process.env.CLOUD_PROVIDER || "supabase";

// Get upload configuration for client
const getUploadConfig = () => {
  return {
    maxFileSize: CLOUD_MAX_FILE_BYTES,
    maxFileSizeMB: Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024)),
    provider: CLOUD_PROVIDER,
    allowedMimeTypes: {
      images: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        "image/ico",
      ],
      videos: [
        "video/mp4",
        "video/avi",
        "video/mov",
        "video/wmv",
        "video/flv",
        "video/webm",
        "video/mkv",
        "video/3gp",
        "video/ogg",
        "video/m4v",
      ],
      audio: [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/aac",
        "audio/flac",
        "audio/wma",
        "audio/m4a",
        "audio/opus",
      ],
      documents: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "application/rtf",
        "application/json",
        "application/xml",
        "text/xml",
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
      ],
    },
    maxFilesPerRequest: 10,
    bucketName: BUCKET_NAME,
  };
};

// Generate a stable key strategy: userId/yyyy/MM/uuid.ext
const generateKey = (originalName, userId = "anonymous") => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = path.extname(originalName);
  const uuid = uuidv4();

  return `${userId}/${year}/${month}/${uuid}${ext}`;
};

// Upload file to Supabase storage
const uploadFile = async ({
  file,
  contentType,
  userId = "anonymous",
  description = "",
  checksum = null,
}) => {
  try {
    const key = generateKey(file.originalname, userId);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(key, file.buffer, {
        contentType: contentType,
        metadata: {
          originalName: file.originalname,
          description: description,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          checksum: checksum,
        },
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get signed URL for immediate access
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(key, 15 * 60); // 15 minutes

    return {
      key: data.path,
      name: file.originalname,
      size: file.size,
      contentType: contentType,
      urlSigned: urlData?.signedUrl || null,
      description: description,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// Remove files from Supabase storage
const removeFiles = async (keys) => {
  try {
    const results = [];

    for (const key of keys) {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([key]);

      results.push({
        key,
        success: !error,
        error: error?.message || null,
      });
    }

    return results;
  } catch (error) {
    console.error("Remove files error:", error);
    throw error;
  }
};

// Get signed URL for file access
const getFileUrl = async (key, expiresIn = 15 * 60) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(key, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Get file URL error:", error);
    throw error;
  }
};

// List files with pagination and filtering
const listFiles = async ({
  prefix = "",
  limit = 50,
  offset = 0,
  sort = "created_at",
} = {}) => {
  try {
    let query = supabase.storage.from(BUCKET_NAME).list(prefix, {
      limit: limit,
      offset: offset,
      sortBy: { column: sort, order: "desc" },
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    // Transform the data to match our API contract
    const items = data.map((file) => ({
      key: file.name,
      name: file.name,
      size: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || "application/octet-stream",
      updatedAt: file.updated_at,
      originalName: file.metadata?.originalName || file.name,
      description: file.metadata?.description || "",
    }));

    return {
      items,
      total: items.length,
      nextOffset: offset + items.length,
    };
  } catch (error) {
    console.error("List files error:", error);
    throw error;
  }
};

// Get file metadata
const getFileMetadata = async (key) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(key);

    if (error) {
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }

    // Get additional metadata from the file
    const { data: listData } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path.dirname(key), {
        limit: 1,
        search: path.basename(key),
      });

    const fileInfo = listData?.[0];

    return {
      key,
      name: fileInfo?.name || path.basename(key),
      size: fileInfo?.metadata?.size || 0,
      contentType: fileInfo?.metadata?.mimetype || "application/octet-stream",
      updatedAt: fileInfo?.updated_at,
      originalName: fileInfo?.metadata?.originalName || path.basename(key),
      description: fileInfo?.metadata?.description || "",
    };
  } catch (error) {
    console.error("Get file metadata error:", error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  removeFiles,
  getFileUrl,
  listFiles,
  getFileMetadata,
  getUploadConfig,
  BUCKET_NAME,
};
