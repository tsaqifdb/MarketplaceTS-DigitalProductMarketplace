// app/curator/penukar-poin/page.tsx
import PenukarPoinPage from './PenukarPoinPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <PenukarPoinPage />
    </Suspense>
  );
}