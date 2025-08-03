import type { 
  ApiResponse, 
  CreateWishlistInput, 
  UpdateWishlistInput,
  Wishlist,
  WishlistQueryParams
} from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

// Enhanced error class for better error handling
export class WishlistApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WishlistApiError';
  }
}

/**
 * Enhanced API client for wishlist endpoints
 * Optimized for React Query with better error handling and performance
 */
export class WishlistApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Enhanced fetch wrapper with better error handling
   */
  private async fetchWithErrorHandling<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new WishlistApiError(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data.code,
          data.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof WishlistApiError) {
        throw error;
      }
      
      // Network or parsing errors
      throw new WishlistApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0, // 0 indicates network error
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Get user's wishlists with pagination
   */
  async getWishlists(
    token: string, 
    params: Partial<WishlistQueryParams> = {}
  ): Promise<ApiResponse<{
    wishlists: Wishlist[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return this.fetchWithErrorHandling(`${this.baseUrl}/api/wishlists?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Get a specific wishlist by ID
   */
  async getWishlist(token: string, id: string): Promise<ApiResponse<Wishlist>> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/wishlists/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Create a new wishlist item
   */
  async createWishlist(
    token: string, 
    data: CreateWishlistInput
  ): Promise<ApiResponse<Wishlist>> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/wishlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing wishlist item
   */
  async updateWishlist(
    token: string, 
    id: string, 
    data: UpdateWishlistInput
  ): Promise<ApiResponse<Wishlist>> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/wishlists/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a wishlist item
   */
  async deleteWishlist(
    token: string, 
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/api/wishlists/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// Export default instance
export const wishlistApi = new WishlistApiClient();