import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Loading spinner component for authentication and general loading states
 */
export function Loading({ 
  size = 'md', 
  text = '로딩중...', 
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Spinner */}
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]} mb-4`} />
      
      {/* Loading text */}
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Full-screen loading overlay for page transitions
 */
export function LoadingOverlay({ text = '로딩중...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <Loading size="lg" text={text} />
    </div>
  );
}

/**
 * Inline loading spinner for buttons and forms
 */
export function LoadingSpinner({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
}