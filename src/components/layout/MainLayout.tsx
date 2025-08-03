import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
  className?: string;
  headerLeftButton?: React.ReactNode;
  headerRightButton?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'FlavorNote',
  showBackButton = false,
  showBottomNav = true,
  className,
  headerLeftButton,
  headerRightButton,
}) => {
  const backButton = showBackButton ? (
    <button
      onClick={() => window.history.back()}
      className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
      aria-label="뒤로 가기"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        title={title}
        leftButton={headerLeftButton || backButton}
        rightButton={headerRightButton}
        className="flex-shrink-0"
      />

      {/* Main Content */}
      <main className={cn(
        'flex-1 overflow-auto',
        // Add bottom padding when bottom nav is shown
        showBottomNav && 'pb-16',
        // Add safe area padding for mobile
        'pt-safe-top',
        className
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};