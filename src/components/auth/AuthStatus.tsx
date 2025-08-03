'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/Loading';
import type { UserProfile } from '@/types';

/**
 * AuthStatus component - displays current authentication status
 * Useful for development and debugging authentication flow
 */
export function AuthStatus() {
  const { user, token, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-600">인증 상태 확인 중...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-800">
            {user.nickname}님, 안녕하세요!
          </p>
          <p className="text-xs text-green-600 mt-1">
            {user.email}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-1 font-mono">
              토큰: {token ? `${token.substring(0, 20)}...` : '없음'}
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

/**
 * User profile info component
 */
export function UserProfile() {
  const { user, refreshUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">사용자 정보</h3>
        <button
          onClick={refreshUser}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          새로고침
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700">닉네임:</span>
          <span className="ml-2 text-sm text-gray-900">{user.nickname}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">이메일:</span>
          <span className="ml-2 text-sm text-gray-900">{user.email}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">가입일:</span>
          <span className="ml-2 text-sm text-gray-900">
            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
        
        {/* Show counts if available */}
        {('_count' in user) && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">
                위시리스트: <strong>{(user as UserProfile)._count.wishlists}개</strong>
              </span>
              <span className="text-gray-600">
                리뷰: <strong>{(user as UserProfile)._count.reviews}개</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}