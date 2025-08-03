'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { wishlistApi } from '@/lib/wishlist-api';
import type { 
  Wishlist, 
  CreateWishlistInput, 
  UpdateWishlistInput, 
  WishlistQueryParams
} from '@/types';

// Query keys for consistent caching
export const wishlistKeys = {
  all: ['wishlists'] as const,
  lists: () => [...wishlistKeys.all, 'list'] as const,
  list: (params: Partial<WishlistQueryParams>) => [...wishlistKeys.lists(), params] as const,
  detail: (id: string) => [...wishlistKeys.all, 'detail', id] as const,
  infinite: (params: Partial<WishlistQueryParams>) => [...wishlistKeys.all, 'infinite', params] as const,
};

export interface UseWishlistsOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
  // Performance options
  keepPreviousData?: boolean;
  // Infinite scroll options
  infinite?: boolean;
}

interface WishlistResponse {
  wishlists: Wishlist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * High-performance useWishlists hook with React Query
 * Features:
 * - Intelligent caching with background updates
 * - Optimistic updates for all CRUD operations
 * - Comprehensive error handling and retry logic
 * - Performance optimizations (pagination, infinite scroll)
 * - Data synchronization across components
 * - Offline support and network state management
 */
export function useWishlists(options: UseWishlistsOptions = {}) {
  const { 
    page = 1, 
    limit = 10, 
    enabled = true,
    keepPreviousData = true,
    infinite = false
  } = options;
  
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Query parameters
  const queryParams: Partial<WishlistQueryParams> = { page, limit };
  const queryKey = infinite ? wishlistKeys.infinite(queryParams) : wishlistKeys.list(queryParams);

  // Standard paginated query
  const listQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      
      const response = await wishlistApi.getWishlists(token, queryParams);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch wishlists');
      }
      return response.data;
    },
    enabled: enabled && !!token && !infinite,
    ...(keepPreviousData && { placeholderData: (previousData: WishlistResponse | undefined) => previousData }),
    staleTime: 2 * 60 * 1000, // 2 minutes - wishlists can be cached longer
    select: (data: WishlistResponse | undefined) => ({
      wishlists: data?.wishlists || [],
      pagination: data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    }),
  });

  // Infinite query for infinite scroll
  const infiniteQuery = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await wishlistApi.getWishlists(token, { 
        ...queryParams, 
        page: pageParam as number 
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch wishlists');
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      return lastPage.pagination.hasNextPage 
        ? lastPage.pagination.page + 1 
        : undefined;
    },
    enabled: enabled && !!token && infinite,
    staleTime: 2 * 60 * 1000,
    initialPageParam: 1,
  });

  // Choose appropriate query based on mode
  const activeQuery = infinite ? infiniteQuery : listQuery;

  // Flatten infinite query data
  const flatWishlists = infinite && infiniteQuery.data 
    ? infiniteQuery.data.pages.flatMap(page => page?.wishlists || [])
    : (listQuery.data as { wishlists: Wishlist[] })?.wishlists || [];

  // Create wishlist mutation with optimistic updates
  const createMutation = useMutation({
    mutationFn: async (data: CreateWishlistInput) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await wishlistApi.createWishlist(token, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create wishlist');
      }
      return response.data;
    },
    onMutate: async (newWishlist) => {
      // Cancel outgoing queries to avoid conflicts
      await queryClient.cancelQueries({ queryKey: wishlistKeys.lists() });

      // Snapshot previous values
      const previousWishlists = queryClient.getQueriesData({ queryKey: wishlistKeys.lists() });

      // Optimistically update all list queries
      queryClient.setQueriesData<WishlistResponse>({ queryKey: wishlistKeys.lists() }, (old) => {
        if (!old) return old;

        const optimisticWishlist: Wishlist = {
          id: `temp-${Date.now()}`, // Temporary ID
          ...newWishlist,
          address: newWishlist.address || null,
          memo: newWishlist.memo || null,
          userId: 'temp-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          ...old,
          wishlists: [optimisticWishlist, ...old.wishlists],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          }
        };
      });

      return { previousWishlists };
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousWishlists) {
        context.previousWishlists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (newWishlist) => {
      if (!newWishlist) return;
      
      // Update all list queries with real data
      queryClient.setQueriesData<WishlistResponse>({ queryKey: wishlistKeys.lists() }, (old) => {
        if (!old) return old;

        // Remove temporary item and add real one
        const filteredWishlists = old.wishlists.filter(w => !w.id.startsWith('temp-'));
        
        return {
          ...old,
          wishlists: [newWishlist, ...filteredWishlists],
        };
      });

      // Set individual wishlist cache
      queryClient.setQueryData(wishlistKeys.detail(newWishlist.id), newWishlist);
    },
    onSettled: () => {
      // Invalidate and refetch affected queries
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
  });

  // Update wishlist mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWishlistInput }) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await wishlistApi.updateWishlist(token, id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update wishlist');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: wishlistKeys.lists() });
      await queryClient.cancelQueries({ queryKey: wishlistKeys.detail(id) });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: wishlistKeys.lists() });
      const previousDetail = queryClient.getQueryData(wishlistKeys.detail(id));

      // Optimistically update lists
      queryClient.setQueriesData<WishlistResponse>({ queryKey: wishlistKeys.lists() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          wishlists: old.wishlists.map(wishlist => 
            wishlist.id === id 
              ? { 
                  ...wishlist, 
                  ...data,
                  address: data.address || null,
                  memo: data.memo || null,
                  updatedAt: new Date() 
                }
              : wishlist
          ),
        };
      });

      // Optimistically update detail
      queryClient.setQueryData(wishlistKeys.detail(id), (old: Wishlist | undefined) => {
        if (!old) return old;
        return { 
          ...old, 
          ...data,
          address: data.address || null,
          memo: data.memo || null,
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
        queryClient.setQueryData(wishlistKeys.detail(id), context.previousDetail);
      }
    },
    onSuccess: (updatedWishlist) => {
      if (!updatedWishlist) return;
      
      // Update with real data
      queryClient.setQueriesData<WishlistResponse>({ queryKey: wishlistKeys.lists() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          wishlists: old.wishlists.map(wishlist => 
            wishlist.id === updatedWishlist.id ? updatedWishlist : wishlist
          ),
        };
      });

      queryClient.setQueryData(wishlistKeys.detail(updatedWishlist.id), updatedWishlist);
    },
    onSettled: (_data, _error, { id }) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.detail(id) });
    },
  });

  // Delete wishlist mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await wishlistApi.deleteWishlist(token, id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete wishlist');
      }
      return { id };
    },
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: wishlistKeys.lists() });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: wishlistKeys.lists() });

      // Optimistically remove from lists
      queryClient.setQueriesData<WishlistResponse>({ queryKey: wishlistKeys.lists() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          wishlists: old.wishlists.filter(wishlist => wishlist.id !== id),
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
      queryClient.removeQueries({ queryKey: wishlistKeys.detail(id) });
    },
    onSettled: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
  });

  // Helper functions for cache management
  const prefetchWishlist = async (id: string) => {
    if (!token) return;
    
    await queryClient.prefetchQuery({
      queryKey: wishlistKeys.detail(id),
      queryFn: async () => {
        const response = await wishlistApi.getWishlist(token, id);
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch wishlist');
        }
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const invalidateWishlists = () => {
    queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
  };

  const resetWishlists = () => {
    queryClient.resetQueries({ queryKey: wishlistKeys.all });
  };

  // Return comprehensive hook interface
  return {
    // Data
    wishlists: infinite ? flatWishlists : ((listQuery.data as WishlistResponse)?.wishlists || []),
    pagination: infinite ? undefined : (listQuery.data as WishlistResponse)?.pagination,
    
    // Loading states
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isRefetching: activeQuery.isRefetching,
    
    // Error states
    error: activeQuery.error,
    isError: activeQuery.isError,
    
    // Infinite scroll specific
    hasNextPage: infinite ? infiniteQuery.hasNextPage : false,
    isFetchingNextPage: infinite ? infiniteQuery.isFetchingNextPage : false,
    fetchNextPage: infinite ? infiniteQuery.fetchNextPage : undefined,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Mutation functions
    createWishlist: createMutation.mutateAsync,
    updateWishlist: updateMutation.mutateAsync,
    deleteWishlist: deleteMutation.mutateAsync,
    
    // Cache management
    refetch: activeQuery.refetch,
    prefetchWishlist,
    invalidateWishlists,
    resetWishlists,
    
    // Network state
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    
    // Performance helpers
    dataUpdatedAt: activeQuery.dataUpdatedAt,
    errorUpdatedAt: activeQuery.errorUpdatedAt,
  };
}

/**
 * Hook to get a single wishlist by ID with caching
 */
export function useWishlist(id: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const { token } = useAuth();

  return useQuery({
    queryKey: wishlistKeys.detail(id),
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      
      const response = await wishlistApi.getWishlist(token, id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch wishlist');
      }
      return response.data;
    },
    enabled: enabled && !!token && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual items can be cached longer
  });
}

/**
 * Hook for prefetching wishlists (useful for hover effects)
 */
export function usePrefetchWishlist() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return (id: string) => {
    if (!token || !id) return;

    queryClient.prefetchQuery({
      queryKey: wishlistKeys.detail(id),
      queryFn: async () => {
        const response = await wishlistApi.getWishlist(token, id);
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch wishlist');
        }
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}