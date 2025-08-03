'use client';

import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/Button';

/**
 * Demo page to showcase authentication forms
 * For development and testing purposes
 */
export default function FormsDemo() {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            인증 폼 데모
          </h1>
          <p className="text-lg text-gray-600">
            React Hook Form + Zod 검증을 사용한 로그인/회원가입 폼
          </p>
        </div>

        {/* Form Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 border border-gray-200">
            <Button
              variant={activeForm === 'login' ? 'primary' : 'ghost'}
              onClick={() => setActiveForm('login')}
              className="mr-1"
            >
              로그인 폼
            </Button>
            <Button
              variant={activeForm === 'register' ? 'primary' : 'ghost'}
              onClick={() => setActiveForm('register')}
            >
              회원가입 폼
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Display */}
          <div>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 text-center">
                {activeForm === 'login' ? '로그인' : '회원가입'}
              </h2>
              
              {activeForm === 'login' ? (
                <LoginForm 
                  onSuccess={() => alert('로그인 성공!')}
                  redirectTo="/forms-demo"
                />
              ) : (
                <RegisterForm 
                  onSuccess={() => alert('회원가입 성공!')}
                  redirectTo="/forms-demo"
                />
              )}
            </div>
          </div>

          {/* Features and Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">구현된 기능</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  React Hook Form을 사용한 폼 상태 관리
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Zod를 사용한 실시간 검증
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  로딩 상태 및 에러 처리
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  비밀번호 가시성 토글
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  비밀번호 강도 표시 (회원가입)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  접근성 고려 설계
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">검증 규칙</h3>
              <div className="text-sm space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">이메일</h4>
                  <p className="text-gray-600">유효한 이메일 형식 필수</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">닉네임 (회원가입)</h4>
                  <p className="text-gray-600">2-20자, 한글/영문/숫자 사용 가능</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">비밀번호</h4>
                  <p className="text-gray-600">8자 이상, 영문과 숫자 포함 필수</p>
                </div>
              </div>
            </div>

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
      </div>
    </div>
  );
}