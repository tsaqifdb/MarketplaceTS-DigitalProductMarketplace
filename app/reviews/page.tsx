'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the curator review page
    router.replace('/curator/review-produk');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
}