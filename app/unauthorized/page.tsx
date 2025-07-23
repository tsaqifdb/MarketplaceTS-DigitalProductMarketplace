// app/unauthorized/page.tsx
import UnauthorizedClient from './UnauthorizedClient';
import { Suspense } from 'react';

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <UnauthorizedClient />
    </Suspense>
  );
}