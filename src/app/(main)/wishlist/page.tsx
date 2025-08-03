'use client';

import React, { useState } from 'react';
import { Plus, Heart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';
import { WishlistEmptyState, ErrorEmptyState } from '@/components/ui/EmptyState';
import { WishlistListSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton';
import { WishlistCard } from '@/components/features/wishlist/WishlistCard';
import { WishlistForm } from '@/components/features/wishlist/WishlistForm';
import { useWishlists } from '@/hooks/useWishlists';
import { useToast } from '@/contexts/ToastContext';
import { createWishlistSchema } from '@/lib/validations';
import type { Wishlist, CreateWishlistInput } from '@/types';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 8;

/**
 * Complete Wishlist Page with full CRUD functionality
 * Features:
 * - Add/Edit/Delete wishlists via modals
 * - Pagination with page info
 * - Empty states and loading skeletons
 * - Success/Error toast notifications
 * - Responsive design
 * - Optimistic updates via React Query
 */
export default function WishlistPage() {
  // State for UI interactions
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);

  // Toast notifications
  const { showSuccess, showError } = useToast();

  // Data fetching and mutations with React Query
  const {
    wishlists,
    pagination,
    isLoading,
    isError,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    createWishlist,
    updateWishlist,
    deleteWishlist,
  } = useWishlists({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  /**
   * Handle adding a new wishlist
   */
  const handleAddWishlist = async (formData: ReturnType<typeof createWishlistSchema.parse>) => {
    try {
      const data: CreateWishlistInput = {
        restaurantName: formData.restaurantName,
        ...(formData.address && { address: formData.address }),
        ...(formData.memo && { memo: formData.memo }),
      };
      await createWishlist(data);
      setShowAddModal(false);
      showSuccess(
        '위시리스트 추가 완료',
        `"${data.restaurantName}"이(가) 위시리스트에 추가되었습니다.`
      );
    } catch (error) {
      console.error('Add wishlist error:', error);
      showError(
        '추가 실패',
        '위시리스트 추가 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  };

  /**
   * Handle editing an existing wishlist
   */
  const handleEditWishlist = async (formData: ReturnType<typeof createWishlistSchema.parse>) => {
    if (!editingWishlist) return;

    try {
      const data: CreateWishlistInput = {
        restaurantName: formData.restaurantName,
        ...(formData.address && { address: formData.address }),
        ...(formData.memo && { memo: formData.memo }),
      };
      await updateWishlist({
        id: editingWishlist.id,
        data,
      });
      setEditingWishlist(null);
      showSuccess(
        '위시리스트 수정 완료',
        `"${data.restaurantName}"이(가) 수정되었습니다.`
      );
    } catch (error) {
      console.error('Edit wishlist error:', error);
      showError(
        '수정 실패',
        '위시리스트 수정 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  };

  /**
   * Handle deleting a wishlist
   */
  const handleDeleteWishlist = async (id: string) => {
    const wishlistToDelete = wishlists.find(w => w.id === id);
    
    try {
      await deleteWishlist(id);
      showSuccess(
        '위시리스트 삭제 완료',
        `"${wishlistToDelete?.restaurantName || '항목'}"이(가) 삭제되었습니다.`
      );
    } catch (error) {
      console.error('Delete wishlist error:', error);
      showError(
        '삭제 실패',
        '위시리스트 삭제 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  };

  /**
   * Handle page changes
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle modal close actions
   */
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCloseEditModal = () => {
    setEditingWishlist(null);
  };

  const handleEditClick = (wishlist: Wishlist) => {
    setEditingWishlist(wishlist);
  };

  /**
   * Handle retry on error
   */
  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <PageHeaderSkeleton />
          <WishlistListSkeleton count={6} />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">위시리스트</h1>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
          <ErrorEmptyState onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  const hasWishlists = wishlists && wishlists.length > 0;
  const totalWishlists = pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">위시리스트</h1>
              <p className="text-sm text-gray-600">
                가고 싶은 맛집들을 관리해보세요
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-center"
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" />
            맛집 추가
          </Button>
        </div>

        {/* Content */}
        {!hasWishlists ? (
          <WishlistEmptyState 
            onAddWishlist={() => setShowAddModal(true)}
          />
        ) : (
          <>
            {/* Pagination Info */}
            {pagination && (
              <div className="mb-4">
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={totalWishlists}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {wishlists.map((wishlist) => (
                <WishlistCard
                  key={wishlist.id}
                  wishlist={wishlist}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteWishlist}
                  className={cn(
                    'transition-opacity duration-200',
                    isDeleting && 'opacity-50 pointer-events-none'
                  )}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  총 {totalWishlists}개의 맛집
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  disabled={isCreating || isUpdating || isDeleting}
                />
              </div>
            )}
          </>
        )}

        {/* Add Wishlist Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          title="새 맛집 추가"
          size="lg"
          closeOnOverlayClick={!isCreating}
          closeOnEscape={!isCreating}
        >
          <WishlistForm
            onSubmit={handleAddWishlist}
            onCancel={handleCloseAddModal}
            loading={isCreating}
            submitText="위시리스트에 추가"
          />
        </Modal>

        {/* Edit Wishlist Modal */}
        <Modal
          isOpen={!!editingWishlist}
          onClose={handleCloseEditModal}
          title="맛집 정보 수정"
          size="lg"
          closeOnOverlayClick={!isUpdating}
          closeOnEscape={!isUpdating}
        >
          {editingWishlist && (
            <WishlistForm
              initialData={editingWishlist}
              onSubmit={handleEditWishlist}
              onCancel={handleCloseEditModal}
              loading={isUpdating}
              submitText="수정 완료"
            />
          )}
        </Modal>
      </div>
    </div>
  );
}