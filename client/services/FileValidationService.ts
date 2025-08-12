import { FileValidationResult, FileUploadConfig } from "~/types/file";

export interface IFileValidationService {
  validateFile(
    file: File,
    config?: Partial<FileUploadConfig>
  ): FileValidationResult;
  validateFiles(
    files: File[],
    config?: Partial<FileUploadConfig>
  ): FileValidationResult[];
  areAllFilesValid(files: File[], config?: Partial<FileUploadConfig>): boolean;
}

export class FileValidationService implements IFileValidationService {
  private defaultConfig: FileUploadConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "image/",
      "video/",
      "application/pdf",
      "text/",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    maxFiles: 10,
    autoUpload: false,
  };

  validateFile(
    file: File,
    config: Partial<FileUploadConfig> = {}
  ): FileValidationResult {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Check file size
    if (file.size > finalConfig.maxFileSize) {
      return {
        isValid: false,
        error: `File size must be less than ${this.formatFileSize(
          finalConfig.maxFileSize
        )}`,
      };
    }

    // Check file type
    const isAllowedType = finalConfig.allowedTypes.some(
      (type) => file.type.startsWith(type) || file.type === type
    );

    if (!isAllowedType) {
      return {
        isValid: false,
        error: "File type not supported",
      };
    }

    return { isValid: true };
  }

  validateFiles(
    files: File[],
    config: Partial<FileUploadConfig> = {}
  ): FileValidationResult[] {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Check max files limit
    if (files.length > finalConfig.maxFiles) {
      return files.map(() => ({
        isValid: false,
        error: `Maximum ${finalConfig.maxFiles} files allowed`,
      }));
    }

    return files.map((file) => this.validateFile(file, config));
  }

  areAllFilesValid(
    files: File[],
    config: Partial<FileUploadConfig> = {}
  ): boolean {
    return files.every((file) => this.validateFile(file, config).isValid);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const fileValidationService = new FileValidationService();
