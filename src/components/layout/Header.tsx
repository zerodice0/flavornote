import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  className?: string;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  className,
  leftButton,
  rightButton,
}) => {
  return (
    <header className={cn(
      'flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white',
      className
    )}>
      <div className="flex items-center">
        {leftButton}
      </div>
      
      <h1 className="text-lg font-semibold text-gray-900 truncate">
        {title}
      </h1>
      
      <div className="flex items-center">
        {rightButton}
      </div>
    </header>
  );
};