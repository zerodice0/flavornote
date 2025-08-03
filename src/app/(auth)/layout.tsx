import React from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';

interface AuthRouteLayoutProps {
  children: React.ReactNode;
}

export default function AuthRouteLayout({ children }: AuthRouteLayoutProps) {
  return (
    <AuthLayout title="FlavorNote">
      {children}
    </AuthLayout>
  );
}