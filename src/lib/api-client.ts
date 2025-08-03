import type { ApiResponse, CreateUserInput, LoginInput } from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

/**
 * API client for authentication endpoints
 */
export class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user
   */
  async register(userData: CreateUserInput): Promise<ApiResponse<{ user: object; token: string }>> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return response.json();
  }

  /**
   * Login user
   */
  async login(credentials: LoginInput): Promise<ApiResponse<{ user: object; token: string }>> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return response.json();
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: 'POST',
    });

    return response.json();
  }

  /**
   * Get current user profile
   */
  async getProfile(token: string): Promise<ApiResponse<{ user: object }>> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }
}

// Export default instance
export const authApi = new AuthApiClient();