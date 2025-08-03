import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

interface MainRouteLayoutProps {
  children: React.ReactNode;
}

export default function MainRouteLayout({ children }: MainRouteLayoutProps) {
  return (
    <MainLayout showBottomNav>
      {children}
    </MainLayout>
  );
}