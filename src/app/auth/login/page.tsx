import React from 'react';
import Link from 'next/link';
import { GuestGuard } from '@/components/auth/AuthGuard';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Login Page
 * Protected by GuestGuard to redirect authenticated users
 */
export default function LoginPage() {
  return (
    <GuestGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                FlavorNote
              </h1>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              맛집을 찾고, 기록하고, 공유하는 플랫폼
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              FlavorNote에 처음 오셨나요?
            </p>
            <Link 
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              회원가입하러 가기 →
            </Link>
          </div>

          {/* Demo Credentials for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                개발용 테스트 계정
              </h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>이메일:</strong> test@flavornote.com</p>
                <p><strong>비밀번호:</strong> password123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GuestGuard>
  );
}

// Page metadata
export const metadata = {
  title: '로그인 | FlavorNote',
  description: 'FlavorNote에 로그인하여 맛집을 탐색하고 리뷰를 남겨보세요',
};