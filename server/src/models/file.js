const { supabase, BUCKET_NAME } = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Generate a stable key strategy: uuid.ext
const generateKey = (originalName) => {
  const ext = path.extname(originalName);
  const uuid = uuidv4();
  return `${uuid}${ext}`;
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
    const key = generateKey(file.originalname);

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
  generateKey,
};
