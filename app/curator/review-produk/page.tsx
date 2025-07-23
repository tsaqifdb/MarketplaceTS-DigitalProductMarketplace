"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

export default function ReviewProdukPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to search page if trying to access this page directly
    router.push('/curator/cari-produk');
  }, [router]);

  return (
    <RoleGuard requiredRole="curator">
      <Layout showSidebar={true}>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
