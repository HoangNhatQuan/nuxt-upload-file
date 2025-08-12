// File-related types and interfaces

export enum FileStatus {
  PENDING = "pending",
  UPLOADING = "uploading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  description?: string;
  url?: string;
  updatedAt: string;
}

export interface QueuedFile {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles: number;
  autoUpload: boolean;
}

export interface FileUploadState {
  uploadedFiles: UploadedFile[];
  queuedFiles: QueuedFile[];
  isUploading: boolean;
  error: string | null;
  success: string | null;
  isLoading: boolean;
}

export interface FileUploadOptions {
  description?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
}
