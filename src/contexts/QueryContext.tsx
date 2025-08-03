'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Create QueryClient with optimized configuration for performance
 */
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Caching configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this duration
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (was cacheTime)
      
      // Background updates
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true,   // Refetch when network reconnects
      refetchOnMount: true,       // Always refetch on component mount
      
      // Retry configuration
      retry: (failureCount, error: Error) => {
        // Don't retry on 4xx errors (client errors)
        const apiError = error as { status?: number };
        if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Performance optimizations
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error: Error) => {
        // Don't retry mutations on 4xx errors
        const apiError = error as { status?: number };
        if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// Global query client instance
let globalQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createQueryClient();
  } else {
    // Client-side: create once and reuse
    if (!globalQueryClient) {
      globalQueryClient = createQueryClient();
    }
    return globalQueryClient;
  }
}

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider with optimized configuration
 * Features:
 * - Performance-optimized caching
 * - Smart retry logic with exponential backoff
 * - Background updates and window focus refetching
 * - Development tools in dev mode
 * - Error boundary integration
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryErrorResetBoundary>
      {() => (
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Show React Query DevTools in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false} 
              position="bottom"
            />
          )}
        </QueryClientProvider>
      )}
    </QueryErrorResetBoundary>
  );
}

/**
 * Hook to get the current QueryClient instance
 * Useful for manual query manipulation
 */
export function useQueryClient() {
  return getQueryClient();
}