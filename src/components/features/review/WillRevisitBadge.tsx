import React from 'react';
import { Heart, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WillRevisitBadgeProps {
  willRevisit: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'bold';
  className?: string;
}

/**
 * WillRevisitBadge - 재방문 의사를 시각적으로 표현하는 배지 컴포넌트
 * 
 * Features:
 * - 명확한 색상 구분 (긍정: 초록색, 부정: 빨간색)
 * - 직관적인 아이콘과 텍스트
 * - 다양한 크기와 스타일 옵션
 * - 반응형 디자인
 */
export const WillRevisitBadge: React.FC<WillRevisitBadgeProps> = ({
  willRevisit,
  size = 'md',
  variant = 'default',
  className,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getStyles = () => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
    
    if (willRevisit) {
      switch (variant) {
        case 'subtle':
          return cn(
            baseClasses,
            'bg-green-50 text-green-700 border border-green-200',
            sizeClasses[size]
          );
        case 'bold':
          return cn(
            baseClasses,
            'bg-green-500 text-white shadow-sm',
            sizeClasses[size]
          );
        default:
          return cn(
            baseClasses,
            'bg-green-100 text-green-800',
            sizeClasses[size]
          );
      }
    } else {
      switch (variant) {
        case 'subtle':
          return cn(
            baseClasses,
            'bg-red-50 text-red-700 border border-red-200',
            sizeClasses[size]
          );
        case 'bold':
          return cn(
            baseClasses,
            'bg-red-500 text-white shadow-sm',
            sizeClasses[size]
          );
        default:
          return cn(
            baseClasses,
            'bg-red-100 text-red-800',
            sizeClasses[size]
          );
      }
    }
  };

  const IconComponent = willRevisit ? Heart : XCircle;
  const text = willRevisit ? '또 가고 싶어요' : '다시는 안 갈래요';

  return (
    <span className={cn(getStyles(), className)}>
      <IconComponent className={cn(iconSizes[size], 'mr-1')} />
      {text}
    </span>
  );
};

/**
 * WillRevisitIndicator - 간단한 아이콘만 표시하는 인디케이터
 * 공간이 제한적일 때 사용
 */
export const WillRevisitIndicator: React.FC<{
  willRevisit: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ willRevisit, size = 'md', className }) => {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (willRevisit) {
    return (
      <Heart 
        className={cn(
          iconSizes[size], 
          'text-green-600 fill-current',
          className
        )} 
      />
    );
  }

  return (
    <XCircle 
      className={cn(
        iconSizes[size], 
        'text-red-600',
        className
      )} 
    />
  );
};