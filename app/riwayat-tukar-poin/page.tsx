'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function RiwayatTukarPoinRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to penukar-poin page with my-products tab active
    router.push('/curator/penukar-poin?tab=my-products');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}