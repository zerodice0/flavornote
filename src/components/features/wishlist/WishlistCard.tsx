'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import type { Wishlist } from '@/types';
import { cn } from '@/lib/utils';

interface WishlistCardProps {
  wishlist: Wishlist;
  onEdit?: (wishlist: Wishlist) => void;
  onDelete?: (id: string) => Promise<void>;
  className?: string;
}

/**
 * WishlistCard component for displaying wishlist items
 * Features:
 * - Edit/delete action buttons
 * - Delete confirmation dialog
 * - Loading states during actions
 * - Responsive design with touch-friendly interface
 */
export function WishlistCard({ 
  wishlist, 
  onEdit, 
  onDelete, 
  className 
}: WishlistCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Handle edit action
   */
  const handleEdit = () => {
    onEdit?.(wishlist);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * Execute delete action with loading state
   */
  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(wishlist.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancel delete action
   */
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * Format date for display
   */
  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), 'yyyy년 M월 d일', { locale: ko });
    } catch {
      return '날짜 없음';
    }
  };

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200',
          'hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20',
          className
        )}
      >
        {/* Header with restaurant name and actions */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate pr-2">
              {wishlist.restaurantName}
            </h3>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1 ml-2 flex-shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                aria-label={`${wishlist.restaurantName} 수정`}
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`${wishlist.restaurantName} 삭제`}
              >
                <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Address */}
        {wishlist.address && (
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">
              {wishlist.address}
            </p>
          </div>
        )}

        {/* Memo */}
        {wishlist.memo && (
          <div className="mb-3">
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
              {wishlist.memo}
            </p>
          </div>
        )}

        {/* Created date */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatDate(wishlist.createdAt)} 추가</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="위시리스트 삭제"
        message={`"${wishlist.restaurantName}"을(를) 위시리스트에서 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}