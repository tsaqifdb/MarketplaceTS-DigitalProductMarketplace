import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ProductSubmissionStatus, ProductReviewStatus, ProductReviewDecision } from '@/lib/types/product-submission';
import { getProductSubmissions, updateProductReview } from '@/lib/services/product-submissions';

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Login required' }),
        { status: 401 }
      );
    }

    // Only curators and admins can access this endpoint
    if (session.user.role !== 'curator' && session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Only curators and admins can access this endpoint' }),
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') as ProductSubmissionStatus | null;
    const sellerId = searchParams.get('sellerId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Use our helper function to get submissions
    const submissions = await getProductSubmissions({
      sellerId,
      status: statusParam,
      // Only filter by curator if not admin
      curatorId: session.user.role === 'admin' ? undefined : session.user.id,
      limit
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions for curator:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch submissions' }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Login required' }),
        { status: 401 }
      );
    }

    // Only curators and admins can access this endpoint
    if (session.user.role !== 'curator' && session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Only curators and admins can access this endpoint' }),
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { 
      productId, 
      decision, 
      rating, 
      comment, 
      revisionRequested, 
      revisionComment 
    } = body;

    // Validate required fields
    if (!productId || !decision) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: productId and decision are required' }),
        { status: 400 }
      );
    }

    // Validate decision value
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid decision value. Must be APPROVED or REJECTED' }),
        { status: 400 }
      );
    }

    // Update the product review
    const review = await updateProductReview({
      productId,
      curatorId: session.user.id,
      decision: decision as ProductReviewDecision,
      rating,
      comment,
      revisionRequested,
      revisionComment
    });
    
    return NextResponse.json({
      success: true,
      message: `Product review for ${productId} has been ${decision.toLowerCase()}`,
      review
    });
  } catch (error) {
    console.error('Error updating product review:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update product review' }),
      { status: 500 }
    );
  }
}
