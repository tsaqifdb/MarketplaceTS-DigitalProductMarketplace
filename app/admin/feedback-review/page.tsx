// app/admin/feedback-review/page.tsx
import FeedbackReviewPage from './FeedbackReviewPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading review...</div>}>
      <FeedbackReviewPage />
    </Suspense>
  );
}