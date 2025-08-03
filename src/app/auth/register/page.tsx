import React from 'react';
import Link from 'next/link';
import { GuestGuard } from '@/components/auth/AuthGuard';
import { RegisterForm } from '@/components/auth/RegisterForm';

/**
 * Register Page
 * Protected by GuestGuard to redirect authenticated users
 */
export default function RegisterPage() {
  return (
    <GuestGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-green-600 hover:text-green-700 transition-colors">
                FlavorNote
              </h1>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              회원가입
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              지금 바로 시작해서 맛집을 기록해보세요
            </p>
          </div>

          {/* Register Form Card */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            <RegisterForm />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              이미 FlavorNote 회원이신가요?
            </p>
            <Link 
              href="/auth/login"
              className="text-green-600 hover:text-green-700 font-medium hover:underline"
            >
              로그인하러 가기 →
            </Link>
          </div>

          {/* Benefits Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              FlavorNote와 함께하면
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                가고 싶은 맛집을 위시리스트에 저장
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                방문한 맛집에 대한 솔직한 리뷰 작성
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                개인화된 맛집 추천과 발견
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                친구들과 맛집 정보 공유
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              🔒 모든 개인정보는 안전하게 암호화되어 보호됩니다
            </p>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}

// Page metadata
export const metadata = {
  title: '회원가입 | FlavorNote',
  description: 'FlavorNote에 가입하고 나만의 맛집 리스트를 만들어보세요',
};