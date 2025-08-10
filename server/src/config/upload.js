// Cloud storage configuration
const CLOUD_MAX_FILE_BYTES =
  parseInt(process.env.CLOUD_MAX_FILE_BYTES) || 50 * 1024 * 1024; // 50MB default
const CLOUD_PROVIDER = process.env.CLOUD_PROVIDER || "supabase";

// Allowed MIME types by category
const allowedMimeTypes = {
  // Images
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
  // Videos
  videos: [
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/quicktime",
    "video/wmv",
    "video/flv",
    "video/webm",
    "video/mkv",
    "video/3gp",
    "video/ogg",
    "video/m4v",
    "video/x-msvideo",
    "video/x-matroska",
  ],
  // Audio
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
    "audio/x-wav",
    "audio/x-m4a",
  ],
  // Documents
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
};

// Flatten all allowed types
const allAllowedTypes = [
  ...allowedMimeTypes.images,
  ...allowedMimeTypes.videos,
  ...allowedMimeTypes.audio,
  ...allowedMimeTypes.documents,
];

// Get upload configuration for client
const getUploadConfig = () => {
  return {
    maxFileSize: CLOUD_MAX_FILE_BYTES,
    maxFileSizeMB: Math.round(CLOUD_MAX_FILE_BYTES / (1024 * 1024)),
    provider: CLOUD_PROVIDER,
    allowedMimeTypes,
    maxFilesPerRequest: 10,
    bucketName: process.env.SUPABASE_BUCKET || "files",
  };
};

module.exports = {
  CLOUD_MAX_FILE_BYTES,
  CLOUD_PROVIDER,
  allowedMimeTypes,
  allAllowedTypes,
  getUploadConfig,
};
