import { ProductSubmissionStatus, ProductReviewDecision } from '@/lib/types/product-submission';
import { ProductSubmissionWithReview } from '@/lib/types/database';
import { db } from '@/lib/db';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { products, productReviews, users } from '@/lib/db/schema';
// In a real app, you would import your schema directly:
// import { products, productReviews } from '@/lib/db/schema';

export async function getProductSubmissions(options: {
  sellerId?: string | null;
  curatorId?: string | null;
  status?: ProductSubmissionStatus | null;
  limit?: number;
  productId?: string | null;
}) {
  const { sellerId, curatorId, status, limit, productId } = options;
  
  // Real database query with proper schema references
  // First get products
  const productList = await db.select().from(products)
    .where(and(
      sellerId ? eq(products.sellerId, sellerId) : undefined,
      status ? eq(products.status, status.toLowerCase() as 'pending' | 'approved' | 'rejected') : undefined,
      productId ? eq(products.id, productId) : undefined
    ))
    .orderBy(desc(products.createdAt))
    .limit(limit || 100);

  // Get seller IDs and product IDs
  const sellerIds = productList.map(p => p.sellerId).filter((id): id is string => !!id);
  const productIds = productList.map(p => p.id);

  // Get sellers
  const sellers = sellerIds.length > 0
    ? await db.select().from(users).where(inArray(users.id, sellerIds))
    : [];

  // Get reviews for these products
  const reviews = productIds.length > 0
    ? await db.select().from(productReviews)
        .where(and(
          inArray(productReviews.productId, productIds),
          curatorId ? eq(productReviews.curatorId, curatorId) : undefined
        ))
        .orderBy(desc(productReviews.createdAt))
    : [];

  // Group reviews by product ID
  const reviewsByProduct: Record<string, typeof productReviews.$inferSelect[]> = {};
  reviews.forEach(review => {
    if (!reviewsByProduct[review.productId]) {
      reviewsByProduct[review.productId] = [];
    }
    reviewsByProduct[review.productId].push(review);
  });

  return productList.map(product => {
    const productReviewsList = reviewsByProduct[product.id] || [];
    const latestReview = productReviewsList[0] || null;
    const curator = latestReview && latestReview.curatorId
      ? sellers.find(s => s.id === latestReview.curatorId)
      : null;

    // Map database status to ProductSubmissionStatus
    const mappedStatus = product.status === 'approved'
      ? 'APPROVED' as ProductSubmissionStatus
      : product.status === 'rejected'
        ? 'REJECTED' as ProductSubmissionStatus
        : 'PENDING' as ProductSubmissionStatus;
    
    // Format status for frontend display (used in curator-review page)
    const displayStatus = product.status === 'approved'
      ? 'Disetujui'
      : product.status === 'rejected'
        ? 'Ditolak'
        : 'Menunggu';

    // Map review status to decision
    const reviewDecision = latestReview?.status === 'completed'
      ? (product.status === 'approved' ? 'APPROVED' : 'REJECTED') as ProductReviewDecision
      : null;

    // Format dates for frontend display
    const submissionDate = product.createdAt 
      ? new Date(product.createdAt).toLocaleDateString('id-ID')
      : '';
    
    const reviewDate = latestReview?.createdAt
      ? new Date(latestReview.createdAt).toLocaleDateString('id-ID')
      : null;

    // Check if review is available
    const hasReview = !!latestReview && latestReview.status === 'completed';

    // Check if this is a request for a specific product (curator-review page)
    const isSingleProductRequest = productId !== undefined && productId !== null;
    
    return {
      id: product.id,
      productId: product.id,
      productName: product.title,
      sellerId: product.sellerId,
      sellerName: sellers.find(s => s.id === product.sellerId)?.name || 'Seller tidak diketahui',
      category: product.category,
      submissionDate: submissionDate,
      submittedDate: submissionDate, // Alternative field name used in some components
      // Use displayStatus for curator-review page, otherwise use mappedStatus
      status: isSingleProductRequest ? displayStatus : mappedStatus,
      displayStatus: displayStatus, // Formatted status for curator-review page
      isPublished: product.isActive,
      price: Number(product.price) || 0,
      description: product.description,
      
      // Review details
      reviewId: latestReview?.id,
      reviewStatus: latestReview?.status === 'completed' ? 'COMPLETED' : 'NOT_STARTED',
      curatorId: latestReview?.curatorId,
      curatorName: curator?.name,
      reviewDate: reviewDate,
      approvedOrRejectedDate: reviewDate, // Alternative field name used in some components
      approvalDate: reviewDate, // Alternative field name used in some components
      decision: reviewDecision,
      rating: latestReview?.averageScore ? Number(latestReview.averageScore) : null,
      curatorRating: latestReview?.averageScore ? Number(latestReview.averageScore) : null, // Alternative field name used in some components
      comment: latestReview?.comments || null,
      curatorComment: latestReview?.comments || null, // Alternative field name used in some components
      review: latestReview?.comments || null, // Added for curator-review page
      revisionRequested: false, // Not in schema, defaulting to false
      revisionComment: null, // Not in schema, defaulting to null
      hasReview: hasReview // Additional field for frontend
    };
  });
}

function mapDecisionToStatus(decision: ProductReviewDecision): 'approved' | 'rejected' | 'pending' {
  if (decision === 'APPROVED') return 'approved';
  if (decision === 'REJECTED') return 'rejected';
  return 'pending';
}

/**
 * Creates or updates a product review
 */
export async function updateProductReview(params: {
  productId: string;
  curatorId: string;
  decision: ProductReviewDecision;
  rating?: number | null;
  comment?: string | null;
  revisionRequested?: boolean;
  revisionComment?: string | null;
}) {
  const { 
    productId, 
    curatorId, 
    decision, 
    rating, 
    comment, 
    revisionRequested, 
    revisionComment 
  } = params;

  // In a real application, you would:
  // 1. First check if a review exists for this product and curator
  // 2. Update the existing review or insert a new one
  // 3. Update the product status based on the review decision
  // 4. Return the updated review

  const reviewDate = new Date();
  const score = rating || 0;
  
  // Update/insert the review - convert numbers to strings for decimal fields
  const reviewData = {
    productId,
    curatorId,
    question1Score: score,
    question2Score: score,
    question3Score: score,
    question4Score: score,
    question5Score: score,
    question6Score: score,
    question7Score: score,
    question8Score: score,
    totalScore: String(score * 8), // Convert to string for decimal field
    averageScore: String(score),   // Convert to string for decimal field
    comments: comment || null,
    status: 'completed' as const,
    pointsEarned: 10, // Default points
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert or update the review
  await db.insert(productReviews).values(reviewData)
    .onConflictDoUpdate({
      target: [productReviews.productId, productReviews.curatorId],
      set: reviewData
    });
  
  // Update the product status based on the review decision
  const newStatus = mapDecisionToStatus(decision);
  await db.update(products)
    .set({
      status: newStatus as 'pending' | 'approved' | 'rejected',
      updatedAt: new Date()
    })
    .where(eq(products.id, productId));
  
  // Fetch and return the updated review
  const [updatedReview] = await db.select()
    .from(productReviews)
    .where(and(
      eq(productReviews.productId, productId),
      eq(productReviews.curatorId, curatorId)
    ))
    .limit(1);
  
  return updatedReview;
}
