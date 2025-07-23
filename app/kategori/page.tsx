'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KategoriPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to produk page
    router.replace('/produk');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Mengarahkan ke halaman produk...</p>
      </div>
    </div>
  );
}
