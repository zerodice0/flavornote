'use client';

import type { 
  Review, 
  CreateReviewInput, 
  UpdateReviewInput, 
  ApiResponse 
} from '@/types';

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'restaurantName';
  sortOrder?: 'asc' | 'desc';
  willRevisit?: boolean;
  search?: string;
}

export interface ReviewResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta: {
    sortBy: string;
    sortOrder: string;
  };
}

/**
 * Review API client with comprehensive CRUD operations
 * Features:
 * - Type-safe API calls
 * - Consistent error handling
 * - Request/response validation
 * - Performance optimizations
 */
export const reviewApi = {
  /**
   * Get paginated list of reviews with sorting and filtering
   */
  async getReviews(
    token: string, 
    params: ReviewQueryParams = {}
  ): Promise<ApiResponse<ReviewResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      // Add query parameters
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params.willRevisit !== undefined) searchParams.set('willRevisit', params.willRevisit.toString());
      if (params.search) searchParams.set('search', params.search);

      const response = await fetch(`/api/reviews?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Get a specific review by ID
   */
  async getReview(token: string, id: string): Promise<ApiResponse<Review>> {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Create a new review
   */
  async createReview(
    token: string, 
    reviewData: CreateReviewInput
  ): Promise<ApiResponse<Review>> {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Update an existing review
   */
  async updateReview(
    token: string, 
    id: string, 
    reviewData: UpdateReviewInput
  ): Promise<ApiResponse<Review>> {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(token: string, id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: { id },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },
};

/**
 * Review statistics API (for dashboard/analytics)
 */
export const reviewStatsApi = {
  /**
   * Get review statistics
   */
  async getStats(token: string): Promise<ApiResponse<{
    total: number;
    willRevisitCount: number;
    willNotRevisitCount: number;
    thisMonth: number;
    thisWeek: number;
  }>> {
    try {
      const response = await fetch('/api/reviews/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },
};