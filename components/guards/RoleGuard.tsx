"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ('client' | 'seller' | 'curator' | 'admin')[];
  requireRole?: 'client' | 'seller' | 'curator' | 'admin';
}

export default function RoleGuard({ 
  children, 
  allowedRoles = ['client', 'seller', 'curator', 'admin'],
  requireRole 
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      const userRole = user.role;
      let hasAccess = false;

      // Check specific role requirement
      if (requireRole) {
        hasAccess = userRole === requireRole || userRole === 'admin';
      } else {
        // Check if user role is in allowed roles (admin always has access)
        hasAccess = allowedRoles.includes(userRole) || userRole === 'admin';
      }

      // Define role-based route restrictions
      const roleBasedAccess = {
        '/seller': ['seller', 'admin'],
        '/curator': ['curator', 'admin'],
        '/admin': ['admin'],
        '/seller/produk/daftarkan': ['seller', 'admin'],
        '/seller/produk/galeri': ['seller', 'admin'],
        '/reviews': ['curator', 'admin'],
        '/vouchers': ['curator', 'admin'],
        '/analytics': ['admin'],
        '/user-management': ['admin'],
        '/pesanan-saya': ['client', 'admin'],
        '/customer-reviews': ['client', 'admin'],
        '/keranjang': ['client', 'admin'],
        '/setelan-akun': ['client', 'admin'],
      };

      // Check path-based access
      for (const [path, roles] of Object.entries(roleBasedAccess)) {
        if (pathname.startsWith(path)) {
          hasAccess = roles.includes(userRole);
          break;
        }
      }

      if (!hasAccess) {
        const unauthorizedUrl = `/unauthorized?role=${userRole}&path=${encodeURIComponent(pathname)}`;
        router.replace(unauthorizedUrl);
      }
    }
  }, [user, isLoading, router, pathname, allowedRoles, requireRole]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show unauthorized if no user
  if (!user) {
    router.replace('/masuk');
    return null;
  }

  return <>{children}</>;
}
