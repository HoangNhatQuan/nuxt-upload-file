const API_BASE_URL = 'http://localhost:3001/api';

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadDate: string;
  description: string;
  url: string;
}

export interface UploadResponse {
  message: string;
  file: UploadedFile;
}

export interface FilesResponse {
  files: UploadedFile[];
}

export class ApiService {
  static async uploadFile(
    file: File,
    description?: string,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  static async getFiles(): Promise<FilesResponse> {
    const response = await fetch(`${API_BASE_URL}/files`);

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  }

  static async deleteFile(filename: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/files/${filename}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    }

    return response.json();
  }

  static getFileUrl(filename: string): string {
    return `${API_BASE_URL}/files/${filename}`;
  }
} 