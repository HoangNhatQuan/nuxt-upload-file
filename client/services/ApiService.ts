import { UploadedFile, FileUploadOptions } from "~/types/file";

export interface IApiService {
  uploadFile(file: File, options?: FileUploadOptions): Promise<UploadedFile>;
  getFiles(params?: GetFilesParams): Promise<UploadedFile[]>;
  deleteFile(filename: string): Promise<void>;
  deleteFiles(filenames: string[]): Promise<void>;
  getFileUrl(filename: string, expiresIn?: number): Promise<string>;
  getHealth(): Promise<any>;
  getConfig(): Promise<any>;
}

export interface GetFilesParams {
  prefix?: string;
  limit?: number;
  offset?: number;
}

export interface ApiEndpoints {
  UPLOAD: string;
  FILES: string;
  HEALTH: string;
  CONFIG: string;
}

export class ApiService implements IApiService {
  private readonly endpoints: ApiEndpoints = {
    UPLOAD: "/upload",
    FILES: "/files",
    HEALTH: "/health",
    CONFIG: "/upload/config",
  };

  private getBaseUrl(): string {
    return process.env.API_BASE_URL || "http://localhost:3001/api";
  }

  private buildUrl(endpoint: string): string {
    return `${this.getBaseUrl()}${endpoint}`;
  }

  private async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async uploadFile(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);

    if (options.description) {
      formData.append("description", options.description);
    }

    const response = await fetch(this.buildUrl(this.endpoints.UPLOAD), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    return response.json();
  }

  async getFiles(params: GetFilesParams = {}): Promise<UploadedFile[]> {
    const url = new URL(this.buildUrl(this.endpoints.FILES));

    if (params.prefix) url.searchParams.append("prefix", params.prefix);
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.offset)
      url.searchParams.append("offset", params.offset.toString());

    const response = await this.makeRequest(url.toString());

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.files)) {
      return response.files;
    } else if (response && response.files) {
      return [response.files];
    }

    return [];
  }

  async deleteFile(filename: string): Promise<void> {
    await this.makeRequest(
      this.buildUrl(`${this.endpoints.FILES}/${filename}`),
      {
        method: "DELETE",
      }
    );
  }

  async deleteFiles(filenames: string[]): Promise<void> {
    await this.makeRequest(this.buildUrl(this.endpoints.FILES), {
      method: "DELETE",
      body: JSON.stringify({ keys: filenames }),
    });
  }

  async getFileUrl(filename: string, expiresIn?: number): Promise<string> {
    const url = new URL(
      this.buildUrl(`${this.endpoints.FILES}/${filename}/url`)
    );
    if (expiresIn) url.searchParams.append("expiresIn", expiresIn.toString());

    const response = await this.makeRequest(url.toString());
    return response.url;
  }

  async getHealth(): Promise<any> {
    return this.makeRequest(this.buildUrl(this.endpoints.HEALTH));
  }

  async getConfig(): Promise<any> {
    return this.makeRequest(this.buildUrl(this.endpoints.CONFIG));
  }
}

export const apiService = new ApiService();
