export interface IFileUtilsService {
  generatePreview(file: File): Promise<string>;
  formatFileSize(bytes: number): string;
  generateUniqueFileName(originalName: string): string;
  getFileIcon(mimeType: string): string;
  generateUniqueId(): string;
}

export class FileUtilsService implements IFileUtilsService {
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
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  generateUniqueFileName(originalName: string): string {
    const nameParts = originalName.split(".");
    const ext = nameParts.pop();
    const baseName = nameParts.join(".");
    return `${baseName}_${Date.now()}.${ext}`;
  }

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
  }

  generateUniqueId(): string {
    return `${Date.now()}-${Math.random()}`;
  }
}

export const fileUtilsService = new FileUtilsService();
