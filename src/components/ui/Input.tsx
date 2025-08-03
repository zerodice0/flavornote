import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseInputProps {
  label?: string;
  error?: string | undefined;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  required?: boolean;
}

interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
}

interface TextareaProps extends BaseInputProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  type: 'textarea';
  rows?: number;
}

type CombinedInputProps = InputProps | TextareaProps;

export const Input: React.FC<CombinedInputProps> = ({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  required,
  className,
  type = 'text',
  ...props
}) => {
  const baseInputStyles = 'flex w-full rounded-md border border-gray-300 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  const errorStyles = 'border-red-500 focus:ring-red-500';
  
  const inputStyles = cn(
    baseInputStyles,
    type === 'textarea' ? 'p-3 min-h-[80px] resize-vertical' : 'h-10 px-3 py-2',
    LeftIcon && 'pl-10',
    RightIcon && 'pr-10',
    error && errorStyles,
    className
  );

  const renderInput = () => {
    if (type === 'textarea') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, rows = 4, ...textareaProps } = props as TextareaProps;
      return (
        <textarea
          className={inputStyles}
          rows={rows}
          {...textareaProps}
        />
      );
    }

    const { type: inputType = 'text', ...inputProps } = props as InputProps;
    return (
      <input
        type={inputType}
        className={inputStyles}
        {...inputProps}
      />
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        
        {renderInput()}
        
        {RightIcon && (
          <RightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};