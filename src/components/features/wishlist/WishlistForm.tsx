'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createWishlistSchema, type CreateWishlistInput } from '@/lib/validations';
import type { Wishlist } from '@/types';
import { cn } from '@/lib/utils';

interface WishlistFormProps {
  initialData?: Partial<Wishlist>;
  onSubmit: (data: CreateWishlistInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  submitText?: string;
}

/**
 * WishlistForm component for creating and editing wishlist items
 * Features:
 * - React Hook Form with Zod validation
 * - Loading states and error handling
 * - Auto-focus and keyboard navigation
 * - Responsive design
 * - Clear visual feedback
 */
export function WishlistForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  className,
  submitText,
}: WishlistFormProps) {
  const isEditing = !!initialData?.id;

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setFocus,
    control,
  } = useForm<CreateWishlistInput>({
    resolver: zodResolver(createWishlistSchema),
    defaultValues: {
      restaurantName: initialData?.restaurantName || '',
      address: initialData?.address || '',
      memo: initialData?.memo || '',
    },
  });

  // Watch memo field for character count
  const memoValue = useWatch({
    control,
    name: 'memo',
    defaultValue: '',
  });

  // Auto-focus the first field when form loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setFocus('restaurantName');
    }, 100);
    return () => clearTimeout(timer);
  }, [setFocus]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        restaurantName: initialData.restaurantName || '',
        address: initialData.address || '',
        memo: initialData.memo || '',
      });
    }
  }, [initialData, reset]);

  /**
   * Handle form submission with error handling
   */
  const handleFormSubmit = async (data: CreateWishlistInput) => {
    try {
      await onSubmit(data);
      
      // Only reset form if not editing (for new items)
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      // Error is handled by parent component
      console.error('Form submission error:', error);
    }
  };

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      reset();
    }
  };

  const isLoading = loading || isSubmitting;
  const buttonText = submitText || (isEditing ? '수정하기' : '위시리스트에 추가');

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Restaurant Name - Required */}
        <div>
          <Input
            {...register('restaurantName')}
            type="text"
            label="식당명"
            placeholder="어떤 식당을 가고 싶으신가요?"
            leftIcon={Store}
            error={errors.restaurantName?.message}
            required
            maxLength={255}
            autoComplete="off"
            disabled={isLoading}
          />
        </div>

        {/* Address - Optional */}
        <div>
          <Input
            {...register('address')}
            type="text"
            label="주소"
            placeholder="식당 주소를 입력하세요 (선택사항)"
            leftIcon={MapPin}
            error={errors.address?.message}
            maxLength={500}
            autoComplete="off"
            disabled={isLoading}
          />
        </div>

        {/* Memo - Optional */}
        <div>
          <Input
            {...register('memo')}
            type="textarea"
            label="메모"
            placeholder="가고 싶은 이유나 특별한 메모를 남겨보세요 (선택사항)"
            leftIcon={FileText}
            error={errors.memo?.message}
            rows={3}
            maxLength={1000}
            disabled={isLoading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="sm:flex-1"
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading || (!isDirty && isEditing)}
            className={onCancel ? 'sm:flex-1' : 'w-full'}
          >
            {buttonText}
          </Button>
        </div>

        {/* Character count for memo */}
        {memoValue && (
          <div className="text-xs text-gray-500 text-right">
            <span>
              메모: {memoValue.length}/1000
            </span>
          </div>
        )}
      </form>

      {/* Helper text for new users */}
      {!isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">위시리스트 활용 팁</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 가고 싶은 식당의 이름만 입력해도 저장할 수 있어요</li>
                <li>• 주소를 함께 저장하면 나중에 찾기 쉬워요</li>
                <li>• 메모에는 추천받은 메뉴나 특별한 이유를 적어보세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}