'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * AuthGuard component that protects routes requiring authentication
 * 
 * @param children - Content to render when authenticated
 * @param fallback - Optional fallback component while redirecting
 * @param redirectTo - Where to redirect unauthenticated users (default: /auth/login)
 * @param requireAuth - Whether authentication is required (default: true)
 */
export function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/auth/login',
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and auth is required
    if (!loading && requireAuth && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  // Show loading state while checking authentication
  if (loading) {
    return <Loading />;
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">로그인이 필요합니다</div>
          <div className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</div>
        </div>
      </div>
    );
  }

  // If auth is not required or user is authenticated, render children
  return <>{children}</>;
}

/**
 * Inverse AuthGuard for pages that should only be accessible to non-authenticated users
 * (like login/register pages)
 */
interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestGuard({ 
  children, 
  redirectTo = '/' 
}: GuestGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users away from auth pages
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return <Loading />;
  }

  // If user is authenticated, show redirect message
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">이미 로그인되어 있습니다</div>
          <div className="text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render children (auth forms)
  return <>{children}</>;
}

/**
 * Higher-Order Component version of AuthGuard for page-level protection
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Higher-Order Component version of GuestGuard for auth pages
 */
export function withGuestGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<GuestGuardProps, 'children'> = {}
) {
  return function GuestGuardedComponent(props: P) {
    return (
      <GuestGuard {...options}>
        <Component {...props} />
      </GuestGuard>
    );
  };
}