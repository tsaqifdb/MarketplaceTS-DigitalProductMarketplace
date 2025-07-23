// app/curator/penukar-poin/page.tsx
import ProdukPage from './ProdukPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <ProdukPage />
    </Suspense>
  );
}