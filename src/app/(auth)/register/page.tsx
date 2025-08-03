import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <form className="space-y-4">
        <Input
          type="text"
          label="닉네임"
          placeholder="닉네임을 입력하세요"
          leftIcon={User}
          helperText="2-20자 사이의 닉네임"
          required
        />
        
        <Input
          type="email"
          label="이메일"
          placeholder="이메일을 입력하세요"
          leftIcon={Mail}
          required
        />
        
        <Input
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          leftIcon={Lock}
          helperText="8자 이상, 영문/숫자/특수문자 포함"
          required
        />

        <Input
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력하세요"
          leftIcon={Lock}
          required
        />

        <div className="pt-2">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              required
            />
            <span className="text-sm text-gray-600">
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                이용약관
              </Link>
              {' 및 '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                개인정보처리방침
              </Link>
              에 동의합니다.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
        >
          회원가입
        </Button>
      </form>

      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">
          이미 계정이 있으신가요?
        </p>
        <Link href="/login">
          <Button variant="outline" size="lg" fullWidth>
            로그인
          </Button>
        </Link>
      </div>
    </div>
  );
}