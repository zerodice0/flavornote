'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, XCircle, MapPin, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createReviewSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';
import type { Review, CreateReviewInput } from '@/types';

interface ReviewFormProps {
  initialData?: Partial<Review>;
  onSubmit: (data: CreateReviewInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  className?: string;
}

/**
 * ReviewForm - 리뷰 작성/수정 폼 컴포넌트
 * 
 * Features:
 * - 직관적인 재방문 의사 선택 UI
 * - 실시간 유효성 검증
 * - 반응형 디자인
 * - 접근성 고려
 * - 로딩 상태 처리
 * - 한국어 UX 최적화
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      restaurantName: initialData?.restaurantName || '',
      address: initialData?.address || '',
      content: initialData?.content || '',
      willRevisit: initialData?.willRevisit ?? true,
    },
  });

  const watchedWillRevisit = form.watch('willRevisit');

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData: CreateReviewInput = {
        restaurantName: data.restaurantName as string,
        content: data.content as string,
        willRevisit: data.willRevisit as boolean,
      };
      
      if (data.address) {
        submitData.address = data.address as string;
      }
      await onSubmit(submitData);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!initialData?.id;
  const finalSubmitText = submitText || (isEditing ? '리뷰 수정하기' : '리뷰 작성하기');
  const finalLoading = loading || isSubmitting;

  return (
    <form 
      onSubmit={form.handleSubmit(handleSubmit)} 
      className={cn('space-y-6', className)}
    >
      {/* 식당명 입력 */}
      <div>
        <Input
          label="식당명"
          placeholder="방문한 식당 이름을 입력하세요"
          leftIcon={PenTool}
          required
          {...form.register('restaurantName')}
          error={form.formState.errors.restaurantName?.message}
          disabled={finalLoading}
        />
      </div>

      {/* 주소 입력 */}
      <div>
        <Input
          label="주소"
          placeholder="식당 주소를 입력하세요 (선택사항)"
          leftIcon={MapPin}
          {...form.register('address')}
          error={form.formState.errors.address?.message}
          disabled={finalLoading}
          helperText="정확한 위치를 기억하는 데 도움이 됩니다"
        />
      </div>

      {/* 리뷰 내용 입력 */}
      <div>
        <Input
          type="textarea"
          label="리뷰"
          placeholder="식당에 대한 솔직한 후기를 작성해주세요&#10;&#10;• 음식의 맛은 어땠나요?&#10;• 서비스는 만족스러웠나요?&#10;• 분위기는 어떤가요?&#10;• 가격대는 적절한가요?"
          rows={6}
          required
          {...form.register('content')}
          error={form.formState.errors.content?.message}
          disabled={finalLoading}
          helperText={`${form.watch('content')?.length || 0} / 5000자`}
        />
      </div>

      {/* 재방문 의사 선택 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          재방문 의사 <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600">
          이 식당을 다른 사람에게 추천하고 싶나요?
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 긍정적 선택 */}
          <label className="cursor-pointer">
            <input
              type="radio"
              value="true"
              {...form.register('willRevisit', { 
                setValueAs: (value) => value === 'true' 
              })}
              className="sr-only"
              disabled={finalLoading}
            />
            <div
              className={cn(
                'flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-opacity-50',
                watchedWillRevisit === true
                  ? 'bg-green-50 border-green-300 text-green-800 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300',
                finalLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Heart 
                className={cn(
                  'w-5 h-5 mr-3',
                  watchedWillRevisit === true ? 'fill-current text-green-600' : 'text-gray-400'
                )} 
              />
              <div className="text-center">
                <div className="font-medium">또 가고 싶어요</div>
                <div className="text-xs mt-1 opacity-75">추천하고 싶은 맛집이에요</div>
              </div>
            </div>
          </label>

          {/* 부정적 선택 */}
          <label className="cursor-pointer">
            <input
              type="radio"
              value="false"
              {...form.register('willRevisit', { 
                setValueAs: (value) => value === 'false' 
              })}
              className="sr-only"
              disabled={finalLoading}
            />
            <div
              className={cn(
                'flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-sm focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-opacity-50',
                watchedWillRevisit === false
                  ? 'bg-red-50 border-red-300 text-red-800 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300',
                finalLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <XCircle 
                className={cn(
                  'w-5 h-5 mr-3',
                  watchedWillRevisit === false ? 'text-red-600' : 'text-gray-400'
                )} 
              />
              <div className="text-center">
                <div className="font-medium">다시는 안 갈래요</div>
                <div className="text-xs mt-1 opacity-75">아쉬웠던 경험이었어요</div>
              </div>
            </div>
          </label>
        </div>

        {form.formState.errors.willRevisit && (
          <p className="text-sm text-red-600">
            {form.formState.errors.willRevisit.message}
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={finalLoading}
            className="order-2 sm:order-1"
            fullWidth
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={finalLoading}
          disabled={finalLoading}
          className="order-1 sm:order-2"
          fullWidth
        >
          {finalSubmitText}
        </Button>
      </div>
    </form>
  );
};

/**
 * ReviewFormSkeleton - 로딩 상태를 위한 스켈레톤 컴포넌트
 */
export const ReviewFormSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="animate-pulse">
        {/* 식당명 */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* 주소 */}
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* 리뷰 내용 */}
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-gray-200 rounded w-10"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>

        {/* 재방문 의사 */}
        <div className="space-y-3 mt-6">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
};