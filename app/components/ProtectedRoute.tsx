// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (user === null) return null;

  return <>{children}</>;
};