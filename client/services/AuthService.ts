export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    username: string;
  };
  message: string;
}

export interface IAuthService {
  signIn(request: SignInRequest): Promise<AuthResponse>;
  signUp(request: SignUpRequest): Promise<AuthResponse>;
}

export class AuthService implements IAuthService {
  private getBaseUrl(): string {
    return process.env.NUXT_API_BASE_URL || "http://localhost:3001/api";
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    return this.makeRequest(this.buildUrl("/auth/signin"), {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    return this.makeRequest(this.buildUrl("/auth/signup"), {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

export const authService = new AuthService();
