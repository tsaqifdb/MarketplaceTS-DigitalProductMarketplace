"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/guards/RoleGuard';

export default function ProductCreatePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main product registration page
    router.replace('/seller/produk/daftarkan');
  }, [router]);

  return (
    <RoleGuard requireRole="seller">
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-700">Mengalihkan ke halaman pendaftaran produk...</p>
        </div>
      </div>
    </RoleGuard>
  );
}
