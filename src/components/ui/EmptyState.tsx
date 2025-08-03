'use client';

import React from 'react';
import { Plus, Search, Heart, AlertCircle, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  variant?: 'wishlist' | 'search' | 'error' | 'generic';
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  } | undefined;
  className?: string | undefined;
}

const variantConfig = {
  wishlist: {
    icon: Heart,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-50',
  },
  search: {
    icon: Search,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-50',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-50',
  },
  generic: {
    icon: FileX,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-50',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'generic',
  title,
  description,
  icon: CustomIcon,
  action,
  className,
}) => {
  const config = variantConfig[variant];
  const IconComponent = CustomIcon || config.icon;

  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <div
        className={cn(
          'mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6',
          config.bgColor
        )}
      >
        <IconComponent className={cn('h-8 w-8', config.iconColor)} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          className="inline-flex items-center"
        >
          {variant === 'wishlist' && <Plus className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Specific empty state components for common use cases
export const WishlistEmptyState: React.FC<{
  onAddWishlist: () => void;
  className?: string;
}> = ({ onAddWishlist, className }) => (
  <EmptyState
    variant="wishlist"
    title="아직 위시리스트가 없습니다"
    description="가고 싶은 맛집을 위시리스트에 추가해보세요. 나중에 쉽게 찾아볼 수 있어요."
    action={{
      label: '첫 번째 맛집 추가하기',
      onClick: onAddWishlist,
    }}
    className={className}
  />
);

export const SearchEmptyState: React.FC<{
  searchTerm: string;
  className?: string;
}> = ({ searchTerm, className }) => (
  <EmptyState
    variant="search"
    title="검색 결과가 없습니다"
    description={`"${searchTerm}"에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`}
    className={className}
  />
);

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <EmptyState
    variant="error"
    title="데이터를 불러올 수 없습니다"
    description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    action={onRetry ? {
      label: '다시 시도',
      onClick: onRetry,
      variant: 'secondary' as const,
    } : undefined}
    className={className}
  />
);