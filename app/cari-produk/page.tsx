'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function CariProdukRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/curator/cari-produk');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}