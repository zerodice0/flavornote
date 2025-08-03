import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  variant?: 'login' | 'register';
}

/**
 * AuthLayout component for consistent authentication page layouts
 */
export function AuthLayout({ 
  children, 
  title, 
  subtitle,
  variant = 'login'
}: AuthLayoutProps) {
  const gradientClass = variant === 'login' 
    ? 'bg-gradient-to-br from-blue-50 to-indigo-100'
    : 'bg-gradient-to-br from-green-50 to-emerald-100';
    
  const logoColorClass = variant === 'login'
    ? 'text-blue-600 hover:text-blue-700'
    : 'text-green-600 hover:text-green-700';

  return (
    <div className={`min-h-screen ${gradientClass} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className={`text-4xl font-bold ${logoColorClass} transition-colors`}>
              FlavorNote
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}