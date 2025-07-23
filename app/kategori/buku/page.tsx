'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KategoriBukuPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to produk page with category=ebook
    router.replace('/produk?category=ebook');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Mengarahkan ke halaman produk kategori buku...</p>
      </div>
    </div>
  );
}
