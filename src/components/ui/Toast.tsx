'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: 'text-green-500',
    button: 'text-green-600 hover:text-green-700',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
    button: 'text-red-600 hover:text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
    button: 'text-yellow-600 hover:text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    button: 'text-blue-600 hover:text-blue-700',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = iconMap[type];
  const colors = colorMap[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, handleClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'max-w-sm w-full rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        colors.bg,
        'transition-all duration-300 ease-in-out',
        isExiting 
          ? 'animate-out slide-out-to-right-full fade-out' 
          : 'animate-in slide-in-from-right-full fade-in'
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start">
        <Icon
          className={cn('h-5 w-5 mt-0.5 flex-shrink-0', colors.icon)}
          aria-hidden="true"
        />
        
        <div className="ml-3 flex-1">
          <div className={cn('text-sm font-medium', colors.text)}>
            {title}
          </div>
          {message && (
            <div className={cn('mt-1 text-sm', colors.text, 'opacity-90')}>
              {message}
            </div>
          )}
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className={cn(
                  'text-sm font-medium rounded-md px-2 py-1',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  colors.button,
                  type === 'success' && 'focus:ring-green-500',
                  type === 'error' && 'focus:ring-red-500',
                  type === 'warning' && 'focus:ring-yellow-500',
                  type === 'info' && 'focus:ring-blue-500'
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className={cn(
            'ml-4 -mr-1.5 -mt-1.5 p-1.5 rounded-md transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            colors.button,
            type === 'success' && 'focus:ring-green-500',
            type === 'error' && 'focus:ring-red-500',
            type === 'warning' && 'focus:ring-yellow-500',
            type === 'info' && 'focus:ring-blue-500'
          )}
          aria-label="알림 닫기"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

// Toast Container for managing multiple toasts
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  className,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        positionClasses[position],
        className
      )}
      aria-live="polite"
      aria-label="알림"
    >
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};