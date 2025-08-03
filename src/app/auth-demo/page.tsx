'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthStatus, UserProfile } from '@/components/auth/AuthStatus';

/**
 * Demo page showing authentication system in action
 * This page is protected by AuthGuard and will redirect to login if not authenticated
 */
export default function AuthDemoPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              인증 시스템 데모
            </h1>
            <p className="text-lg text-gray-600">
              이 페이지는 로그인이 필요한 보호된 페이지입니다
            </p>
          </div>

          <div className="space-y-6">
            {/* Authentication Status */}
            <div>
              <h2 className="text-xl font-semibold mb-4">인증 상태</h2>
              <AuthStatus />
            </div>

            {/* User Profile */}
            <div>
              <h2 className="text-xl font-semibold mb-4">사용자 프로필</h2>
              <UserProfile />
            </div>

            {/* Features Available After Authentication */}
            <div>
              <h2 className="text-xl font-semibold mb-4">보호된 기능들</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">위시리스트 관리</h3>
                  <p className="text-gray-600 mb-4">
                    가고 싶은 맛집을 저장하고 관리할 수 있습니다.
                  </p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    위시리스트 보기
                  </button>
                </div>
                
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">리뷰 작성</h3>
                  <p className="text-gray-600 mb-4">
                    방문한 맛집에 대한 리뷰를 작성할 수 있습니다.
                  </p>
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                    리뷰 작성하기
                  </button>
                </div>
              </div>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">개발 정보</h2>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    AuthGuard 작동 확인
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>✅ 로그인하지 않은 사용자는 이 페이지에 접근할 수 없습니다</li>
                    <li>✅ 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트됩니다</li>
                    <li>✅ 새로고침 시에도 인증 상태가 유지됩니다 (localStorage)</li>
                    <li>✅ 토큰이 만료되거나 유효하지 않으면 자동 로그아웃됩니다</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}