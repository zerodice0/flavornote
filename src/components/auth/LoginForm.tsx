'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * LoginForm component with React Hook Form and Zod validation
 * Handles user authentication with proper error handling and loading states
 */
export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginInput) => {
    try {
      setSubmitError('');
      
      // Call login function from AuthContext
      await login(data);
      
      // Clear form on success
      reset();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect behavior
        router.push(redirectTo);
      }
    } catch (error) {
      // Handle login errors
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('로그인 중 오류가 발생했습니다.');
      }
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <Input
            {...register('email')}
            type="email"
            label="이메일"
            placeholder="example@flavornote.com"
            leftIcon={Mail}
            error={errors.email?.message}
            required
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            leftIcon={Lock}
            error={errors.password?.message}
            required
            autoComplete="current-password"
            className="pr-10"
          />
          {/* Password visibility toggle button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>

        {/* Additional Actions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              회원가입
            </button>
          </p>
          
          {/* Future: Add password reset link */}
          {/* <p className="text-sm">
            <button
              type="button"
              onClick={() => router.push('/auth/forgot-password')}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </button>
          </p> */}
        </div>
      </form>
    </div>
  );
}