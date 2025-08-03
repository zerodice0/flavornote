'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createUserSchema, type CreateUserInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * RegisterForm component with React Hook Form and Zod validation
 * Handles user registration with comprehensive validation and error handling
 */
export function RegisterForm({ onSuccess, redirectTo = '/' }: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      nickname: '',
      password: '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  // Watch password for strength indicator
  const password = watch('password');

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateUserInput) => {
    try {
      setSubmitError('');
      
      // Call register function from AuthContext
      await registerUser(data);
      
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
      // Handle registration errors
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Password strength checker
   */
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    Object.values(checks).forEach(check => {
      if (check) score++;
    });
    
    if (score < 2) return { score, label: '약함', color: 'text-red-500 bg-red-100' };
    if (score < 4) return { score, label: '보통', color: 'text-yellow-600 bg-yellow-100' };
    return { score, label: '강함', color: 'text-green-600 bg-green-100' };
  };

  const passwordStrength = getPasswordStrength(password);

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

        {/* Nickname Field */}
        <div>
          <Input
            {...register('nickname')}
            type="text"
            label="닉네임"
            placeholder="2-20자의 닉네임을 입력하세요"
            leftIcon={User}
            error={errors.nickname?.message}
            helperText="다른 사용자에게 표시될 이름입니다"
            required
            autoComplete="username"
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="비밀번호"
            placeholder="영문, 숫자 포함 8자 이상"
            leftIcon={Lock}
            error={errors.password?.message}
            required
            autoComplete="new-password"
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
          
          {/* Password strength indicator */}
          {password && password.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score < 2 ? 'bg-red-500' :
                      passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
              
              {/* Password requirements */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle 
                    className={`h-3 w-3 ${password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`}
                  />
                  <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    8자 이상
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle 
                    className={`h-3 w-3 ${/[a-zA-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`}
                  />
                  <span className={/[a-zA-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    영문 포함
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle 
                    className={`h-3 w-3 ${/\d/.test(password) ? 'text-green-500' : 'text-gray-300'}`}
                  />
                  <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    숫자 포함
                  </span>
                </div>
              </div>
            </div>
          )}
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
          {isSubmitting ? '회원가입 중...' : '회원가입'}
        </Button>

        {/* Additional Actions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              로그인
            </button>
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            회원가입을 진행하면{' '}
            <a href="#" className="text-blue-600 hover:underline">이용약관</a>과{' '}
            <a href="#" className="text-blue-600 hover:underline">개인정보처리방침</a>에{' '}
            동의하는 것으로 간주됩니다.
          </p>
        </div>
      </form>
    </div>
  );
}