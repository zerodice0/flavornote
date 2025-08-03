import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'current';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  primary: 'text-primary-600',
  secondary: 'text-gray-400',
  white: 'text-white',
  current: 'text-current',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  'aria-label': ariaLabel = '로딩 중',
}) => {
  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={ariaLabel}
      role="status"
      aria-hidden="false"
    />
  );
};

// Overlay Spinner for full page loading
interface SpinnerOverlayProps {
  visible: boolean;
  message?: string;
  backdrop?: boolean;
  className?: string;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  visible,
  message = '로딩 중...',
  backdrop = true,
  className,
}) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-black/50 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-4 bg-white rounded-lg p-6 shadow-lg">
        <Spinner size="lg" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Inline Spinner with text
interface InlineSpinnerProps {
  text?: string;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

export const InlineSpinner: React.FC<InlineSpinnerProps> = ({
  text = '로딩 중...',
  size = 'sm',
  variant = 'current',
  className,
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Spinner size={size} variant={variant} />
      <span className="text-sm text-current">{text}</span>
    </div>
  );
};

// Dots Spinner (alternative animation)
interface DotsSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  'aria-label'?: string;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  'aria-label': ariaLabel = '로딩 중',
}) => {
  const dotSizeClasses = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  return (
    <div
      className={cn('flex space-x-1', className)}
      role="status"
      aria-label={ariaLabel}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full animate-pulse',
            dotSizeClasses[size],
            variantClasses[variant],
            'bg-current'
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Pulse Spinner (for buttons and inline use)
interface PulseSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

export const PulseSpinner: React.FC<PulseSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-full animate-ping',
        sizeClasses[size],
        variantClasses[variant],
        'bg-current opacity-75',
        className
      )}
      role="status"
      aria-label="로딩 중"
    />
  );
};