'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'seller' | 'curator' | 'admin';
  allowedRoles?: ('client' | 'seller' | 'curator' | 'admin')[];
  fallback?: React.ReactNode;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    <div className="text-center mt-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tunggu Sebentar...</h1>
      <p className="text-gray-600 mb-4">
        Saya sedang memeriksa akses Anda.
      </p>
      <p className="text-sm text-gray-500">
        Kamu akan sampai di halaman yang kamu tuju dalam beberapa detik.
      </p>
    </div>
  </div>
);

const UnauthorizedMessage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner />
    </div>
  </div>
);

export default function RoleGuard({ 
  children, 
  requiredRole, 
  allowedRoles, 
  fallback 
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated, requireAuth } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (requiredRole) {
        requireAuth([requiredRole]);
      } else if (allowedRoles) {
        requireAuth(allowedRoles);
      } else {
        requireAuth();
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, allowedRoles, requireAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // Show unauthorized message if not authenticated
  if (!isAuthenticated) {
    return fallback || <UnauthorizedMessage />;
  }

  // Check role permissions
  if (user) {
    if (requiredRole && user.role !== requiredRole) {
      return fallback || <UnauthorizedMessage />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return fallback || <UnauthorizedMessage />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}
