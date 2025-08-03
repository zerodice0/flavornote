'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  disabled = false,
  size = 'md',
  className,
}) => {
  // Generate page numbers array
  const getPageNumbers = () => {
    const delta = siblingCount;
    const range = [];

    // Calculate range around current page
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    // Always show first page
    if (totalPages > 1) {
      range.push(1);
    }

    // Add ellipsis if there's a gap after first page
    if (left > 2) {
      range.push('...');
    }

    // Add pages around current page
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i);
      }
    }

    // Add ellipsis if there's a gap before last page
    if (right < totalPages - 1) {
      range.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const sizeClasses = {
    sm: 'h-8 min-w-8 text-xs',
    md: 'h-10 min-w-10 text-sm',
    lg: 'h-12 min-w-12 text-base',
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  return (
    <nav
      className={cn('flex items-center justify-center', className)}
      aria-label="페이지네이션"
    >
      <ul className="flex items-center space-x-1">
        {/* First page button */}
        {showFirstLast && currentPage > 2 && (
          <li>
            <button
              onClick={() => onPageChange(1)}
              disabled={disabled}
              className={cn(
                'flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size]
              )}
              aria-label="첫 페이지로"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-1" />
            </button>
          </li>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className={cn(
                'flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size]
              )}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </li>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => (
          <li key={index}>
            {pageNumber === '...' ? (
              <span
                className={cn(
                  'flex items-center justify-center text-gray-500',
                  sizeClasses[size]
                )}
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(pageNumber as number)}
                disabled={disabled}
                className={cn(
                  'flex items-center justify-center rounded-md border font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                  sizeClasses[size],
                  pageNumber === currentPage
                    ? 'border-primary-500 bg-primary-600 text-white hover:bg-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                )}
                aria-label={`페이지 ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )}
          </li>
        ))}

        {/* Next page button */}
        {showPrevNext && (
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className={cn(
                'flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size]
              )}
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>
        )}

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages - 1 && (
          <li>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={disabled}
              className={cn(
                'flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size]
              )}
              aria-label="마지막 페이지로"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-1" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

// Simple pagination info component
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('text-sm text-gray-700', className)}>
      <span className="font-medium">{startItem}</span>
      {'-'}
      <span className="font-medium">{endItem}</span>
      {' / '}
      <span className="font-medium">{totalItems}</span>개 결과
    </div>
  );
};