import VerifyOtpPage from './VerifyOtpPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}