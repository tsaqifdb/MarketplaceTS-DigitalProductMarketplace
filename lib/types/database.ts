import { ProductSubmissionStatus } from "./product-submission";

// Database schema definitions (for reference)
export interface Product {
  id: string;
  name: string;
  sellerId: string;
  category: string;
  submissionDate: string;
  status: ProductSubmissionStatus;  // Overall product status
  isPublished: boolean;             // Whether it's visible to customers
  price: number;
  description: string;
  imageUrl?: string;
  // Other product fields...
}

export interface ProductReview {
  id: string;
  productId: string;         // References Product.id
  curatorId: string;         // Who performed the review
  reviewDate: string;        // When the review was completed
  reviewStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'; // Review process status
  decision: 'APPROVED' | 'REJECTED' | null;  // Final decision
  rating: number | null;     // Curator rating (1-5)
  comment: string | null;    // Curator feedback
  revisionRequested: boolean;// Whether revision is requested
  revisionComment: string | null; // Specific revision requests
}

// Combined type for API responses
export interface ProductSubmissionWithReview {
  // Product details
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  category: string;
  submissionDate: string;
  status: ProductSubmissionStatus;
  isPublished: boolean;
  
  // Review details
  reviewId: string | null;
  reviewStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  curatorId: string | null;
  curatorName: string | null;
  reviewDate: string | null;
  decision: 'APPROVED' | 'REJECTED' | null;
  rating: number | null;
  comment: string | null;
  revisionRequested: boolean;
  revisionComment: string | null;
}
