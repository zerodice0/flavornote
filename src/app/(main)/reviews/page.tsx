'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  SortAsc, 
  RefreshCw
} from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { ReviewCard } from '@/components/features/review/ReviewCard';
import { ReviewForm } from '@/components/features/review/ReviewForm';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Review, CreateReviewInput } from '@/types';
import { cn } from '@/lib/utils';

export default function ReviewsPage() {
  // State for UI controls
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'restaurantName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  
  // Data fetching with comprehensive options
  const {
    reviews,
    pagination,
    isLoading,
    isError,
    error,
    createReview,
    updateReview,
    deleteReview,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    stats,
  } = useReviews({
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
    enabled: true,
    keepPreviousData: true,
  });

  // Event handlers
  const handleCreateReview = async (data: CreateReviewInput) => {
    try {
      await createReview(data);
      setShowCreateModal(false);
    } catch (error) {
      // Error is handled by the hook and displayed via createError
      console.error('Create review failed:', error);
    }
  };

  const handleEditReview = async (data: CreateReviewInput) => {
    if (!editingReview) return;
    
    try {
      await updateReview({
        id: editingReview.id,
        data,
      });
      setEditingReview(null);
    } catch (error) {
      console.error('Update review failed:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    
    try {
      await deleteReview(deletingReview.id);
      setDeletingReview(null);
    } catch (error) {
      console.error('Delete review failed:', error);
    }
  };

  const handleSort = (newSortBy: 'createdAt' | 'restaurantName') => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // Change field and default to desc
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton component
  const ReviewCardSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2 ml-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-28" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                내 리뷰
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                작성한 모든 리뷰를 확인하고 관리하세요
              </p>
              {stats && (
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>전체 {stats.total}개</span>
                  <span>재방문 희망 {stats.willRevisitCount}개</span>
                  <span>재방문 비희망 {stats.willNotRevisitCount}개</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="hidden sm:flex"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                리뷰 작성
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {isError && (
          <div className="mb-6">
            <ErrorMessage variant="banner">
              <div className="flex justify-between items-center">
                <span>{error?.message || '리뷰를 불러오는데 실패했습니다.'}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-4"
                >
                  다시 시도
                </Button>
              </div>
            </ErrorMessage>
          </div>
        )}

        {/* Controls Section */}
        {!isError && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  정렬:
                </span>
                <Button
                  variant={sortBy === 'createdAt' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  최신순
                  {sortBy === 'createdAt' && (
                    <SortAsc className={cn(
                      'w-3 h-3 transition-transform',
                      sortOrder === 'desc' && 'rotate-180'
                    )} />
                  )}
                </Button>
                <Button
                  variant={sortBy === 'restaurantName' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('restaurantName')}
                  className="flex items-center gap-1"
                >
                  가나다순
                  {sortBy === 'restaurantName' && (
                    <SortAsc className={cn(
                      'w-3 h-3 transition-transform',
                      sortOrder === 'desc' && 'rotate-180'
                    )} />
                  )}
                </Button>
              </div>

              {/* Pagination Info */}
              {pagination && pagination.total > 0 && (
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  className="text-sm text-gray-600"
                />
              )}
            </div>
          </div>
        )}

        {/* Content Section */}
        {isLoading ? (
          /* Loading State */
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <ReviewCardSkeleton key={index} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <EmptyState
            variant="search"
            title="작성한 리뷰가 없습니다"
            description="첫 번째 리뷰를 작성하고 맛집 경험을 공유해보세요!"
            action={{
              label: "첫 리뷰 작성하기",
              onClick: () => setShowCreateModal(true)
            }}
          />
        ) : (
          /* Reviews List */
          <>
            <div className="space-y-4 mb-8">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={(review) => setEditingReview(review)}
                  onDelete={(id) => {
                    const reviewToDelete = reviews.find(r => r.id === id);
                    if (reviewToDelete) {
                      setDeletingReview(reviewToDelete);
                    }
                  }}
                  showActions
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  disabled={isLoading}
                  size="md"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Review Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새 리뷰 작성"
        size="lg"
        closeOnOverlayClick={!isCreating}
      >
        <ReviewForm
          onSubmit={handleCreateReview}
          onCancel={() => setShowCreateModal(false)}
          loading={isCreating}
        />
        {createError && (
          <div className="mt-4">
            <ErrorMessage>
              {createError.message || '리뷰 작성에 실패했습니다.'}
            </ErrorMessage>
          </div>
        )}
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        title="리뷰 수정"
        size="lg"
        closeOnOverlayClick={!isUpdating}
      >
        {editingReview && (
          <>
            <ReviewForm
              initialData={editingReview}
              onSubmit={handleEditReview}
              onCancel={() => setEditingReview(null)}
              loading={isUpdating}
            />
            {updateError && (
              <div className="mt-4">
                <ErrorMessage>
                  {updateError.message || '리뷰 수정에 실패했습니다.'}
                </ErrorMessage>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingReview}
        onClose={() => setDeletingReview(null)}
        onConfirm={handleConfirmDelete}
        title="리뷰 삭제"
        message={`"${deletingReview?.restaurantName}" 리뷰를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        loading={isDeleting}
      />
      {deleteError && deletingReview && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <ErrorMessage variant="toast">
            {deleteError.message || '리뷰 삭제에 실패했습니다.'}
          </ErrorMessage>
        </div>
      )}
    </div>
  );
}