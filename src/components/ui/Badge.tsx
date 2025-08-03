import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  className?: string | undefined;
  'aria-label'?: string;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  primary: 'bg-primary-100 text-primary-800 border-primary-200',
  secondary: 'bg-gray-100 text-gray-600 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

const removeButtonClasses = {
  default: 'text-gray-500 hover:text-gray-700 focus:ring-gray-500',
  primary: 'text-primary-500 hover:text-primary-700 focus:ring-primary-500',
  secondary: 'text-gray-400 hover:text-gray-600 focus:ring-gray-500',
  success: 'text-green-500 hover:text-green-700 focus:ring-green-500',
  warning: 'text-yellow-500 hover:text-yellow-700 focus:ring-yellow-500',
  error: 'text-red-500 hover:text-red-700 focus:ring-red-500',
  info: 'text-blue-500 hover:text-blue-700 focus:ring-blue-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className={cn(
            'ml-0.5 -mr-1 p-0.5 rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            removeButtonClasses[variant]
          )}
          aria-label={`${children} 제거`}
          type="button"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
};

// Notification Badge (dot indicator)
interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  max = 99,
  showZero = false,
  dot = false,
  className,
  children,
}) => {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <div className="relative inline-flex">
      {children}
      {shouldShow && (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center',
            'bg-red-500 text-white text-xs font-medium rounded-full',
            'ring-2 ring-white',
            dot 
              ? 'h-2 w-2' 
              : count > 99 
                ? 'h-5 w-7 px-1' 
                : count > 9 
                  ? 'h-5 w-5' 
                  : 'h-4 w-4',
            className
          )}
          aria-label={`${count}개의 알림`}
        >
          {!dot && displayCount}
        </span>
      )}
    </div>
  );
};

// Status Badge for reviews, etc.
export type StatusType = 'draft' | 'published' | 'archived' | 'pending' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  draft: { variant: 'secondary' as BadgeVariant, label: '임시저장' },
  published: { variant: 'success' as BadgeVariant, label: '게시됨' },
  archived: { variant: 'default' as BadgeVariant, label: '보관됨' },
  pending: { variant: 'warning' as BadgeVariant, label: '대기중' },
  approved: { variant: 'success' as BadgeVariant, label: '승인됨' },
  rejected: { variant: 'error' as BadgeVariant, label: '거절됨' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      size="sm"
      className={className}
      aria-label={`상태: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
};