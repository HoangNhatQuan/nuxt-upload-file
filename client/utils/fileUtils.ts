// File utility functions that mirror the client's useFileUtils composable

interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const fileUtils = {
  // File validation
  validateFile(file: File): FileValidationResult {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File size must be less than 5MB",
      };
    }

    // Check file type (optional - you can customize this)
    const allowedTypes = [
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
    ];

    const isAllowedType = allowedTypes.some(
      (type) => file.type.startsWith(type) || file.type === type
    );

    if (!isAllowedType) {
      return {
        isValid: false,
        error: "File type not supported",
      };
    }

    return { isValid: true };
  },

  // Generate preview for images and videos
  generatePreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve((e.target?.result as string) || "");
        };
        reader.onerror = () => {
          resolve("");
        };
        reader.readAsDataURL(file);
      } else {
        resolve("");
      }
    });
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Generate unique file name
  generateUniqueFileName(originalName: string): string {
    const nameParts = originalName.split(".");
    const ext = nameParts.pop();
    const baseName = nameParts.join(".");
    return `${baseName}_${Date.now()}.${ext}`;
  },

  // Get file icon based on type
  getFileIcon(mimeType: string): string {
    if (!mimeType) return "mdi-file";
    if (mimeType.startsWith("image/")) return "mdi-image";
    if (mimeType.startsWith("video/")) return "mdi-video";
    if (mimeType === "application/pdf") return "mdi-file-pdf-box";
    if (mimeType.startsWith("text/")) return "mdi-file-document";
    if (mimeType.includes("word")) return "mdi-file-word-box";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "mdi-file-excel-box";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "mdi-file-powerpoint-box";
    return "mdi-file";
  },

  // Validate multiple files
  validateFiles(files: File[]): FileValidationResult[] {
    return files.map(this.validateFile);
  },

  // Check if all files are valid
  areAllFilesValid(files: File[]): boolean {
    return files.every((file) => this.validateFile(file).isValid);
  },
};
