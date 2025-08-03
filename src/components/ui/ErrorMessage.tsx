import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorType = 'error' | 'warning' | 'info' | 'success';

interface ErrorMessageProps {
  children: React.ReactNode;
  type?: ErrorType;
  variant?: 'inline' | 'banner' | 'toast';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  id?: string;
  'aria-live'?: 'polite' | 'assertive';
}

const iconMap = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: AlertCircle,
};

const colorMap = {
  error: {
    banner: 'bg-red-50 border-red-200 text-red-800',
    inline: 'text-red-600',
    icon: 'text-red-500',
  },
  warning: {
    banner: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    inline: 'text-yellow-600',
    icon: 'text-yellow-500',
  },
  info: {
    banner: 'bg-blue-50 border-blue-200 text-blue-800',
    inline: 'text-blue-600',
    icon: 'text-blue-500',
  },
  success: {
    banner: 'bg-green-50 border-green-200 text-green-800',
    inline: 'text-green-600',
    icon: 'text-green-500',
  },
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  type = 'error',
  variant = 'inline',
  dismissible = false,
  onDismiss,
  className,
  id,
  'aria-live': ariaLive = type === 'error' ? 'assertive' : 'polite',
}) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-start space-x-2 text-sm',
          colors.inline,
          className
        )}
        role="alert"
        aria-live={ariaLive}
        id={id}
      >
        <Icon
          className={cn('h-4 w-4 mt-0.5 flex-shrink-0', colors.icon)}
          aria-hidden="true"
        />
        <span>{children}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'rounded-md border p-4',
          colors.banner,
          className
        )}
        role="alert"
        aria-live={ariaLive}
        id={id}
      >
        <div className="flex items-start">
          <Icon
            className={cn('h-5 w-5 mt-0.5 flex-shrink-0 mr-3', colors.icon)}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {children}
            </div>
          </div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className={cn(
                'ml-3 -mr-1.5 -mt-1.5 p-1.5 rounded-md transition-colors',
                'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'error' && 'focus:ring-red-500',
                type === 'warning' && 'focus:ring-yellow-500',
                type === 'info' && 'focus:ring-blue-500',
                type === 'success' && 'focus:ring-green-500'
              )}
              aria-label="메시지 닫기"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Toast variant
  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg',
        colors.banner,
        'animate-in slide-in-from-top-2 duration-300',
        className
      )}
      role="alert"
      aria-live={ariaLive}
      id={id}
    >
      <div className="flex items-start">
        <Icon
          className={cn('h-5 w-5 mt-0.5 flex-shrink-0 mr-3', colors.icon)}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn(
              'ml-3 -mr-1.5 -mt-1.5 p-1.5 rounded-md transition-colors',
              'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              type === 'error' && 'focus:ring-red-500',
              type === 'warning' && 'focus:ring-yellow-500',
              type === 'info' && 'focus:ring-blue-500',
              type === 'success' && 'focus:ring-green-500'
            )}
            aria-label="메시지 닫기"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};