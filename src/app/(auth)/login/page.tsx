import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <form className="space-y-4">
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
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
        >
          로그인
        </Button>
      </form>

      <div className="text-center space-y-4">
        <Link 
          href="/forgot-password" 
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          비밀번호를 잊으셨나요?
        </Link>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            아직 계정이 없으신가요?
          </p>
          <Link href="/register">
            <Button variant="outline" size="lg" fullWidth>
              회원가입
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}