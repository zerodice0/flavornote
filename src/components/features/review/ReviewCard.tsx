'use client';

import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WillRevisitBadge } from './WillRevisitBadge';
import { cn } from '@/lib/utils';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * ReviewCard - 리뷰 정보를 카드 형태로 표시하는 컴포넌트
 * 
 * Features:
 * - 식당명, 주소, 리뷰 내용 표시
 * - 재방문 의사 배지
 * - 작성일, 수정일 표시
 * - 편집/삭제 액션 버튼
 * - 반응형 디자인
 * - 호버 효과 및 상태 관리
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  showActions = true,
  className,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    onEdit?.(review);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(
      `"${review.restaurantName}" 리뷰를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(review.id);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };

  // Reserved for future use
  // const formatTime = (date: string | Date) => {
  //   return new Intl.DateTimeFormat('ko-KR', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   }).format(new Date(date));
  // };

  const isEdited = review.updatedAt !== review.createdAt;

  return (
    <div 
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        isDeleting && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Header: 식당명, 주소, 액션 버튼 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
            {review.restaurantName}
          </h3>
          {review.address && (
            <p className="text-gray-600 text-sm mb-2 flex items-center">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{review.address}</span>
            </p>
          )}
        </div>
        
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-1 ml-4">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-gray-500 hover:text-gray-700"
                disabled={isDeleting}
                title="리뷰 수정"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-600"
                loading={isDeleting}
                disabled={isDeleting}
                title="리뷰 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 재방문 의사 배지 */}
      <div className="mb-3">
        <WillRevisitBadge willRevisit={review.willRevisit} />
      </div>

      {/* 리뷰 내용 */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {review.content}
        </p>
      </div>

      {/* Footer: 날짜 정보 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span>
            {formatDate(review.createdAt)} 방문
          </span>
        </div>
        
        {isEdited && (
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {formatDate(review.updatedAt)} 수정
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ReviewCardSkeleton - 로딩 상태를 위한 스켈레톤 컴포넌트
 */
export const ReviewCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex gap-1 ml-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Badge */}
        <div className="mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
        
        {/* Content */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};