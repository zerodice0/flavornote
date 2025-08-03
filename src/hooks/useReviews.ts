'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { reviewApi, type ReviewQueryParams, type ReviewResponse } from '@/lib/review-api';
import type { 
  Review, 
  CreateReviewInput, 
  UpdateReviewInput 
} from '@/types';

// Query keys for consistent caching and invalidation
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: Partial<ReviewQueryParams>) => [...reviewKeys.lists(), params] as const,
  detail: (id: string) => [...reviewKeys.all, 'detail', id] as const,
  infinite: (params: Partial<ReviewQueryParams>) => [...reviewKeys.all, 'infinite', params] as const,
  stats: () => [...reviewKeys.all, 'stats'] as const,
  filtered: (filter: string) => [...reviewKeys.all, 'filtered', filter] as const,
};

export interface UseReviewsOptions {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'restaurantName';
  sortOrder?: 'asc' | 'desc';
  
  // Filtering
  willRevisit?: boolean;
  search?: string;
  
  // Performance options
  enabled?: boolean;
  keepPreviousData?: boolean;
  
  // Infinite scroll options
  infinite?: boolean;
  
  // Advanced options
  staleTime?: number;
  refetchInterval?: number;
}

/**
 * Comprehensive useReviews hook with React Query
 * 
 * Features:
 * - ✅ Sorting: createdAt, updatedAt, restaurantName
 * - ✅ Filtering: willRevisit, search text
 * - ✅ Pagination & Infinite scroll
 * - ✅ Optimistic updates for all CRUD operations
 * - ✅ Intelligent cache invalidation
 * - ✅ Background refetching and sync
 * - ✅ Offline support and error recovery
 * - ✅ Performance optimizations
 * - ✅ Type safety throughout
 */
export function useReviews(options: UseReviewsOptions = {}) {
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt',
    sortOrder = 'desc',
    willRevisit,
    search,
    enabled = true,
    keepPreviousData = true,
    infinite = false,
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchInterval,
  } = options;
  
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Query parameters for caching
  const queryParams: Partial<ReviewQueryParams> = { 
    page, 
    limit, 
    sortBy, 
    sortOrder,
    ...(willRevisit !== undefined && { willRevisit }),
    ...(search && { search }),
  };
  
  const queryKey = infinite ? reviewKeys.infinite(queryParams) : reviewKeys.list(queryParams);

  // Standard paginated query
  const listQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      
      const response = await reviewApi.getReviews(token, queryParams);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch reviews');
      }
      return response.data;
    },
    enabled: enabled && !!token && !infinite,
    ...(keepPreviousData && { placeholderData: (previousData: ReviewResponse | undefined) => previousData }),
    staleTime,
    ...(refetchInterval && { refetchInterval }),
    select: (data: ReviewResponse | undefined) => ({
      reviews: data?.reviews || [],
      pagination: data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      meta: data?.meta || {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    }),
  });

  // Infinite query for infinite scroll
  const infiniteQuery = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await reviewApi.getReviews(token, { 
        ...queryParams, 
        page: pageParam as number 
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch reviews');
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      return lastPage.pagination.hasNextPage 
        ? lastPage.pagination.page + 1 
        : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage?.pagination) return undefined;
      return firstPage.pagination.hasPreviousPage 
        ? firstPage.pagination.page - 1 
        : undefined;
    },
    enabled: enabled && !!token && infinite,
    staleTime,
    initialPageParam: 1,
    maxPages: 10, // Limit memory usage for infinite scroll
  });

  // Choose appropriate query based on mode
  const activeQuery = infinite ? infiniteQuery : listQuery;

  // Flatten infinite query data
  const flatReviews = infinite && infiniteQuery.data 
    ? infiniteQuery.data.pages.flatMap(page => page?.reviews || [])
    : (listQuery.data as { reviews: Review[] })?.reviews || [];

  // Create review mutation with optimistic updates
  const createMutation = useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await reviewApi.createReview(token, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create review');
      }
      return response.data;
    },
    onMutate: async (newReview) => {
      // Cancel outgoing queries to avoid conflicts
      await queryClient.cancelQueries({ queryKey: reviewKeys.lists() });

      // Snapshot previous values
      const previousReviews = queryClient.getQueriesData({ queryKey: reviewKeys.lists() });

      // Create optimistic review
      const optimisticReview: Review = {
        id: `temp-${Date.now()}`, // Temporary ID
        ...newReview,
        address: newReview.address || null,
        userId: 'temp-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically update all list queries
      queryClient.setQueriesData<ReviewResponse>({ queryKey: reviewKeys.lists() }, (old) => {
        if (!old) return old;

        // Insert at the beginning for newest-first ordering
        const newReviews = sortOrder === 'desc' && sortBy === 'createdAt'
          ? [optimisticReview, ...old.reviews]
          : [...old.reviews, optimisticReview];

        return {
          ...old,
          reviews: newReviews,
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          }
        };
      });

      return { previousReviews };
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousReviews) {
        context.previousReviews.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (newReview) => {
      if (!newReview) return;
      
      // Update all list queries with real data
      queryClient.setQueriesData<ReviewResponse>({ queryKey: reviewKeys.lists() }, (old) => {
        if (!old) return old;

        // Remove temporary item and add real one
        const filteredReviews = old.reviews.filter(r => !r.id.startsWith('temp-'));
        
        // Insert new review in correct position based on sort
        let newReviews: Review[];
        if (sortOrder === 'desc' && sortBy === 'createdAt') {
          newReviews = [newReview, ...filteredReviews];
        } else if (sortOrder === 'asc' && sortBy === 'createdAt') {
          newReviews = [...filteredReviews, newReview];
        } else {
          // For other sorts, add and let server re-sort on next fetch
          newReviews = [newReview, ...filteredReviews];
        }

        return {
          ...old,
          reviews: newReviews,
        };
      });

      // Set individual review cache
      queryClient.setQueryData(reviewKeys.detail(newReview.id), newReview);
    },
    onSettled: () => {
      // Invalidate and refetch affected queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });

  // Update review mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewInput }) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await reviewApi.updateReview(token, id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update review');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: reviewKeys.lists() });
      await queryClient.cancelQueries({ queryKey: reviewKeys.detail(id) });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: reviewKeys.lists() });
      const previousDetail = queryClient.getQueryData(reviewKeys.detail(id));

      // Optimistically update lists
      queryClient.setQueriesData<ReviewResponse>({ queryKey: reviewKeys.lists() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          reviews: old.reviews.map(review => 
            review.id === id 
              ? { 
                  ...review, 
                  ...data,
                  address: data.address || null,
                  updatedAt: new Date() 
                }
              : review
          ),
        };
      });

      // Optimistically update detail
      queryClient.setQueryData(reviewKeys.detail(id), (old: Review | undefined) => {
        if (!old) return old;
        return { 
          ...old, 
          ...data,
          address: data.address || null,
          updatedAt: new Date() 
        };
      });

      return { previousLists, previousDetail };
    },
    onError: (_error, { id }, context) => {
      // Rollback optimistic updates
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(reviewKeys.detail(id), context.previousDetail);
      }
    },
    onSuccess: (updatedReview) => {
      if (!updatedReview) return;
      
      // Update with real data
      queryClient.setQueriesData<ReviewResponse>({ queryKey: reviewKeys.lists() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          reviews: old.reviews.map(review => 
            review.id === updatedReview.id ? updatedReview : review
          ),
        };
      });

      queryClient.setQueryData(reviewKeys.detail(updatedReview.id), updatedReview);
    },
    onSettled: (_data, _error, { id }) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });

  // Delete review mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await reviewApi.deleteReview(token, id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete review');
      }
      return { id };
    },
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: reviewKeys.lists() });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: reviewKeys.lists() });

      // Optimistically remove from lists
      queryClient.setQueriesData<ReviewResponse>({ queryKey: reviewKeys.lists() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          reviews: old.reviews.filter(review => review.id !== id),
          pagination: {
            ...old.pagination,
            total: Math.max(0, old.pagination.total - 1),
          }
        };
      });

      return { previousLists };
    },
    onError: (_error, _id, context) => {
      // Rollback optimistic updates
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: reviewKeys.detail(id) });
    },
    onSettled: () => {
      // Invalidate list queries and stats
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });

  // Helper functions for cache management
  const prefetchReview = async (id: string) => {
    if (!token) return;
    
    await queryClient.prefetchQuery({
      queryKey: reviewKeys.detail(id),
      queryFn: async () => {
        const response = await reviewApi.getReview(token, id);
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch review');
        }
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const invalidateReviews = () => {
    queryClient.invalidateQueries({ queryKey: reviewKeys.all });
  };

  const resetReviews = () => {
    queryClient.resetQueries({ queryKey: reviewKeys.all });
  };

  // Optimized filtering functions
  const getFilteredReviews = (filter: (review: Review) => boolean) => {
    const currentReviews = infinite ? flatReviews : ((listQuery.data as ReviewResponse)?.reviews || []);
    return currentReviews.filter(filter);
  };

  const getReviewsByWillRevisit = (willRevisitFilter: boolean) => {
    return getFilteredReviews(review => review.willRevisit === willRevisitFilter);
  };

  const searchReviews = (searchTerm: string) => {
    if (!searchTerm.trim()) return infinite ? flatReviews : ((listQuery.data as ReviewResponse)?.reviews || []);
    
    const term = searchTerm.toLowerCase();
    return getFilteredReviews(review => 
      review.restaurantName.toLowerCase().includes(term) ||
      review.content.toLowerCase().includes(term) ||
      (review.address !== null && review.address.toLowerCase().includes(term))
    );
  };

  // Return comprehensive hook interface
  return {
    // Data
    reviews: infinite ? flatReviews : ((listQuery.data as ReviewResponse)?.reviews || []),
    pagination: infinite ? undefined : (listQuery.data as ReviewResponse)?.pagination,
    meta: infinite ? undefined : (listQuery.data as ReviewResponse)?.meta,
    
    // Loading states
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isRefetching: activeQuery.isRefetching,
    isLoadingError: activeQuery.isLoadingError,
    
    // Error states
    error: activeQuery.error,
    isError: activeQuery.isError,
    
    // Infinite scroll specific
    hasNextPage: infinite ? infiniteQuery.hasNextPage : false,
    hasPreviousPage: infinite ? infiniteQuery.hasPreviousPage : false,
    isFetchingNextPage: infinite ? infiniteQuery.isFetchingNextPage : false,
    isFetchingPreviousPage: infinite ? infiniteQuery.isFetchingPreviousPage : false,
    fetchNextPage: infinite ? infiniteQuery.fetchNextPage : undefined,
    fetchPreviousPage: infinite ? infiniteQuery.fetchPreviousPage : undefined,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Mutation functions
    createReview: createMutation.mutateAsync,
    updateReview: updateMutation.mutateAsync,
    deleteReview: deleteMutation.mutateAsync,
    
    // Cache management
    refetch: activeQuery.refetch,
    prefetchReview,
    invalidateReviews,
    resetReviews,
    
    // Filtering helpers
    getFilteredReviews,
    getReviewsByWillRevisit,
    searchReviews,
    
    // Current query state
    currentSort: { sortBy, sortOrder },
    currentFilters: { willRevisit, search },
    queryParams,
    
    // Network state
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    
    // Performance helpers
    dataUpdatedAt: activeQuery.dataUpdatedAt,
    errorUpdatedAt: activeQuery.errorUpdatedAt,
    
    // Statistics (from cache if available)
    stats: {
      total: infinite ? flatReviews.length : ((listQuery.data as ReviewResponse)?.pagination?.total || 0),
      willRevisitCount: getReviewsByWillRevisit(true).length,
      willNotRevisitCount: getReviewsByWillRevisit(false).length,
    },
  };
}

/**
 * Hook to get a single review by ID with caching
 */
export function useReview(id: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const { token } = useAuth();

  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      
      const response = await reviewApi.getReview(token, id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch review');
      }
      return response.data;
    },
    enabled: enabled && !!token && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual items can be cached longer
  });
}

/**
 * Hook for prefetching reviews (useful for hover effects and preloading)
 */
export function usePrefetchReview() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return (id: string) => {
    if (!token || !id) return;

    queryClient.prefetchQuery({
      queryKey: reviewKeys.detail(id),
      queryFn: async () => {
        const response = await reviewApi.getReview(token, id);
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch review');
        }
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook for advanced filtering and sorting
 */
export function useReviewFilters() {
  const queryClient = useQueryClient();

  const applyComplexFilter = (
    predicate: (review: Review) => boolean
  ) => {
    // Get all cached review lists
    const cachedQueries = queryClient.getQueriesData({ queryKey: reviewKeys.lists() });
    
    const results: Review[] = [];
    cachedQueries.forEach(([, data]) => {
      if (data && typeof data === 'object' && 'reviews' in data) {
        const reviewData = data as ReviewResponse;
        results.push(...reviewData.reviews.filter(predicate));
      }
    });

    // Remove duplicates by ID
    const uniqueReviews = results.filter((review, index, self) => 
      index === self.findIndex(r => r.id === review.id)
    );

    return uniqueReviews;
  };

  return {
    applyComplexFilter,
    // Predefined filters
    getRecentReviews: (days: number = 7) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return applyComplexFilter(review => 
        new Date(review.createdAt) > cutoff
      );
    },
    getReviewsByRestaurant: (restaurantName: string) => {
      return applyComplexFilter(review => 
        review.restaurantName.toLowerCase().includes(restaurantName.toLowerCase())
      );
    },
    getLongReviews: (minLength: number = 100) => {
      return applyComplexFilter(review => 
        review.content.length >= minLength
      );
    },
  };
}