export type ProductSubmissionStatus = 
  | 'PENDING' // Initial state when product is submitted by seller
  | 'IN_REVIEW' // When curator starts reviewing
  | 'APPROVED' // When curator approves the product
  | 'REJECTED'; // When curator rejects the product

// Review status in the product_reviews table
export type ProductReviewStatus = 
  | 'NOT_STARTED' // Initial state - no review started
  | 'IN_PROGRESS' // Curator is reviewing
  | 'COMPLETED';  // Review is complete (with decision)

// Review decision (only relevant when reviewStatus is COMPLETED)
export type ProductReviewDecision = 
  | 'APPROVED' 
  | 'REJECTED' 
  | null; // null when review not completed

/**
 * Helper function to derive the combined ProductSubmissionStatus 
 * from both the product status and review status/decision
 */
export function deriveSubmissionStatus(
  productStatus: ProductSubmissionStatus | null, 
  reviewStatus: ProductReviewStatus | null,
  reviewDecision: ProductReviewDecision
): ProductSubmissionStatus {
  // If product has a definitive status, use it
  if (productStatus === 'APPROVED' || productStatus === 'REJECTED') {
    return productStatus;
  }

  // Otherwise derive from review status
  if (reviewStatus === 'COMPLETED') {
    return reviewDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  } else if (reviewStatus === 'IN_PROGRESS') {
    return 'IN_REVIEW';
  } else {
    // Default to PENDING if no review started
    return 'PENDING';
  }
}

// This is the simplified representation of product submission status
// that combines data from both products and product_reviews tables
export interface ProductSubmission {
  id: string;                  // Product ID
  productId?: string;          // Optional field if needed
  productName: string;
  sellerId: string;
  sellerName: string;
  category: string;
  submittedDate: string;       // When product was submitted
  status: ProductSubmissionStatus; // Combined status (derived from both tables)
  
  // Review-related fields
  reviewDate?: string | null;  // When review was completed
  approvedOrRejectedDate?: string | null; // Same as reviewDate if completed
  curatorId?: string | null;
  curatorName?: string | null;
  curatorRating?: number | null;
  curatorComment?: string | null;
  revisionRequested?: boolean;
  revisionComment?: string | null;
  
  // Product status
  isPublished?: boolean; // After approval, seller can decide to publish or not
}

// Helper function to get user-friendly status text
export function getStatusDisplayText(status: ProductSubmissionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pengajuan';
    case 'IN_REVIEW':
      return 'Diproses';
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    default:
      return 'Unknown';
  }
}

// Helper function to get appropriate status color class
export function getStatusColorClass(status: ProductSubmissionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-blue-100 text-blue-800';
    case 'IN_REVIEW':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get text color for status
export function getStatusTextColorClass(status: ProductSubmissionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'text-blue-600';
    case 'IN_REVIEW':
      return 'text-yellow-600';
    case 'APPROVED':
      return 'text-green-600';
    case 'REJECTED':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
