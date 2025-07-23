"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PenukarPoinRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/curator/penukar-poin');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
}