import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  className,
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button */}
      {showBackButton && (
        <header className="flex items-center p-4 pt-safe-top">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </header>
      )}

      {/* Main Content Container */}
      <div className={cn(
        'flex-1 flex flex-col justify-center px-6 py-12',
        !showBackButton && 'pt-safe-top',
        'pb-safe-bottom',
        className
      )}>
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Content */}
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>

        {/* Footer space for additional links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">
            맛집을 찾고, 기록하고, 공유하세요
          </p>
        </div>
      </div>
    </div>
  );
};