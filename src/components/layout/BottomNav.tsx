'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Star, User, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '홈', href: '/', icon: Home },
  { id: 'wishlist', label: '위시리스트', href: '/wishlist', icon: Heart },
  { id: 'reviews', label: '내 리뷰', href: '/reviews', icon: Star },
  { id: 'profile', label: '프로필', href: '/profile', icon: User },
];

interface BottomNavProps {
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200',
      'pb-safe-bottom', // Tailwind v4 safe area support
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1',
                'transition-colors duration-200',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-1',
                  isActive ? 'fill-current' : ''
                )} 
              />
              <span className={cn(
                'text-xs font-medium leading-none',
                'truncate max-w-full'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};