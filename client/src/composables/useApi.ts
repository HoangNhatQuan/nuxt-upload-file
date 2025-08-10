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

export const useApi = () => {
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;
  
  const endpoints = {
    UPLOAD: '/upload',
    FILES: '/files',
    HEALTH: '/health',
    CONFIG: '/upload/config',
  } as const;
  
  const buildUrl = (endpoint: string): string => {
    return `${apiBaseUrl}${endpoint}`;
  };

  const uploadFile = async (file: File, description?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(buildUrl(endpoints.UPLOAD), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  };

  const getFiles = async (params?: {
    prefix?: string;
    limit?: number;
    offset?: number;
  }): Promise<FilesResponse> => {
    const url = new URL(buildUrl(endpoints.FILES));
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
  };

  const deleteFile = async (filename: string): Promise<{ message: string }> => {
    const response = await fetch(buildUrl(`${endpoints.FILES}/${filename}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    }

    return response.json();
  };

  const deleteFiles = async (
    filenames: string[],
  ): Promise<{ message: string; results: unknown[] }> => {
    const response = await fetch(buildUrl(endpoints.FILES), {
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
  };

  const getFileUrl = async (filename: string, expiresIn?: number): Promise<string> => {
    const url = new URL(buildUrl(`${endpoints.FILES}/${filename}/url`));
    if (expiresIn) url.searchParams.append('expiresIn', expiresIn.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Failed to get file URL');
    }

    const data = await response.json();
    return data.url;
  };

  return {
    uploadFile,
    getFiles,
    deleteFile,
    deleteFiles,
    getFileUrl,
    apiBaseUrl,
    endpoints,
  };
}; 