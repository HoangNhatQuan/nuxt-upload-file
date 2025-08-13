const STORAGE_KEY = 'app.auth.username';

export interface AuthStorage {
  getUsername(): string | null;
  setUsername(username: string): void;
  clear(): void;
  isAuthenticated(): boolean;
}

class AuthStorageImpl implements AuthStorage {
  getUsername(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to get username from storage:', error);
      return null;
    }
  }

  setUsername(username: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, username);
    } catch (error) {
      console.error('Failed to set username in storage:', error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.getUsername() !== null;
  }
}

export const authStorage = new AuthStorageImpl();
