'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CuratorDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual curator dashboard page
    router.replace('/curator');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
}