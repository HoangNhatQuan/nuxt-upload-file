// File upload types
export enum FileStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface QueuedFile {
  id: string;
  file: File;
  preview?: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// API response types
export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype?: string;
  uploadDate: string;
  updatedAt: string;
  description: string;
  url: string;
}

export interface FilesResponse {
  files: UploadedFile[];
  total: number;
  nextOffset: number;
}

export interface UploadResponse {
  message: string;
  file: UploadedFile;
}

// File upload events
export interface FileUploadEvents {
  'add-files': File[];
  remove: string;
  clear: void;
  delete: string;
}
