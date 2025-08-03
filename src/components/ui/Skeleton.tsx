'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              'h-4 mb-2 last:mb-0',
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={index === lines - 1 ? { width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
};

// Wishlist Card Skeleton
export const WishlistCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
    <div className="flex justify-between items-start mb-2">
      <Skeleton variant="text" className="h-6 w-48" />
      <div className="flex gap-2">
        <Skeleton variant="circular" className="h-8 w-8" />
        <Skeleton variant="circular" className="h-8 w-8" />
      </div>
    </div>
    
    <Skeleton variant="text" className="h-4 w-64 mb-2" />
    <Skeleton variant="text" lines={2} className="mb-3" />
    <Skeleton variant="text" className="h-3 w-32" />
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex justify-between items-center mb-6', className)}>
    <Skeleton variant="text" className="h-8 w-32" />
    <Skeleton variant="rectangular" className="h-10 w-20" />
  </div>
);

// List Skeleton
export const WishlistListSkeleton: React.FC<{ 
  count?: number;
  className?: string;
}> = ({ count = 5, className }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <WishlistCardSkeleton key={index} />
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div>
      <Skeleton variant="text" className="h-4 w-16 mb-2" />
      <Skeleton variant="rectangular" className="h-10 w-full" />
    </div>
    <div>
      <Skeleton variant="text" className="h-4 w-12 mb-2" />
      <Skeleton variant="rectangular" className="h-10 w-full" />
    </div>
    <div>
      <Skeleton variant="text" className="h-4 w-14 mb-2" />
      <Skeleton variant="rectangular" className="h-20 w-full" />
    </div>
    <div className="flex gap-3 pt-4">
      <Skeleton variant="rectangular" className="h-10 flex-1" />
      <Skeleton variant="rectangular" className="h-10 flex-1" />
    </div>
  </div>
);

// Pagination Skeleton
export const PaginationSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center justify-center space-x-1', className)}>
    {Array.from({ length: 7 }).map((_, index) => (
      <Skeleton 
        key={index} 
        variant="rectangular" 
        className="h-10 w-10" 
      />
    ))}
  </div>
);