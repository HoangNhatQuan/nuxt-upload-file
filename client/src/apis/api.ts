const API_BASE_URL = 'http://localhost:3001/api';

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype?: string;
  uploadDate: string;
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

export interface FilesResponse {
  files: UploadedFile[];
  total: number;
  nextOffset: number;
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

  static async getFiles(params?: {
    prefix?: string;
    limit?: number;
    offset?: number;
  }): Promise<FilesResponse> {
    const url = new URL(`${API_BASE_URL}/files`);
    if (params?.prefix) url.searchParams.append('prefix', params.prefix);
    if (params?.limit)
      url.searchParams.append('limit', params.limit.toString());
    if (params?.offset)
      url.searchParams.append('offset', params.offset.toString());

    const response = await fetch(url.toString());

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

  static async deleteFiles(
    filenames: string[],
  ): Promise<{ message: string; results: any[] }> {
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys: filenames }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    }

    return response.json();
  }

  static async getFileUrl(
    filename: string,
    expiresIn?: number,
  ): Promise<string> {
    const url = new URL(`${API_BASE_URL}/files/${filename}/url`);
    if (expiresIn) url.searchParams.append('expiresIn', expiresIn.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Failed to get file URL');
    }

    const data = await response.json();
    return data.url;
  }
}
