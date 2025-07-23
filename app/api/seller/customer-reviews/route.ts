import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, customerReviews, users, sellerResponses } from '@/lib/db/schema';
import { and, eq, inArray, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET: Fetch all customer reviews for a seller's products
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const sellerId = searchParams.get('sellerId');
    
    // Validate the seller ID
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
    // Ensure the user is the seller or an admin
    if (session.user.id !== sellerId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to view these reviews' },
        { status: 403 }
      );
    }
    
    // Get all products for this seller
    const sellerProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sellerId, sellerId));
    
    if (!sellerProducts || sellerProducts.length === 0) {
      return NextResponse.json([]);
    }
    
    const productIds = sellerProducts.map(product => product.id);
    
    // Get customer reviews for these products
    const reviews = await db
      .select({
        id: customerReviews.id,
        productId: customerReviews.productId,
        customerId: customerReviews.customerId,
        rating: customerReviews.rating,
        comment: customerReviews.comment,
        createdAt: customerReviews.createdAt,
      })
      .from(customerReviews)
      .where(inArray(customerReviews.productId, productIds))
      .orderBy(desc(customerReviews.createdAt));
    
    if (!reviews || reviews.length === 0) {
      return NextResponse.json([]);
    }
    
    // Get customer IDs and product IDs
    const customerIds = reviews.map(review => review.customerId);
    const reviewProductIds = reviews.map(review => review.productId);
    
    // Get customer details
    const customers = await db
      .select({
        id: users.id,
        name: users.name,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(inArray(users.id, customerIds));
    
    // Get product details
    const productsDetails = await db
      .select({
        id: products.id,
        title: products.title,
      })
      .from(products)
      .where(inArray(products.id, reviewProductIds));
    
    // Get seller responses
    const responses = await db
      .select({
        reviewId: sellerResponses.reviewId,
        response: sellerResponses.response,
        createdAt: sellerResponses.createdAt,
      })
      .from(sellerResponses)
      .where(inArray(sellerResponses.reviewId, reviews.map(r => r.id)));
    
    // Map responses by review ID
    const responsesByReviewId: Record<string, { response: string, createdAt: Date | null }> = {};
    responses.forEach(response => {
      responsesByReviewId[response.reviewId] = {
        response: response.response,
        createdAt: response.createdAt
      };
    });
    
    // Format the reviews with customer, product, and response data
    const formattedReviews = reviews.map(review => {
      const customer = customers.find(c => c.id === review.customerId);
      const product = productsDetails.find(p => p.id === review.productId);
      const responseData = responsesByReviewId[review.id];
      
      return {
        id: review.id,
        customerName: customer?.name || 'Customer',
        customerId: review.customerId,
        productName: product?.title || 'Product',
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : '',
        verified: customer?.isEmailVerified || false,
        helpful: 0, // This could be implemented with a separate table
        response: responseData?.response || null,
        responseDate: responseData?.createdAt ? new Date(responseData.createdAt).toISOString().split('T')[0] : null,
      };
    });
    
    return NextResponse.json(formattedReviews);
    
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer reviews' },
      { status: 500 }
    );
  }
}

// POST: Add a seller response to a customer review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only sellers can respond to reviews
    if (session.user.role !== 'seller' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only sellers can respond to reviews' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    if (!body.reviewId || !body.response) {
      return NextResponse.json(
        { error: 'Review ID and response text are required' },
        { status: 400 }
      );
    }
    
    // Verify the review is for a product owned by this seller
    const review = await db
      .select({
        id: customerReviews.id,
        productId: customerReviews.productId,
      })
      .from(customerReviews)
      .where(eq(customerReviews.id, body.reviewId))
      .limit(1);
    
    if (!review || review.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    const product = await db
      .select({ sellerId: products.sellerId })
      .from(products)
      .where(eq(products.id, review[0].productId))
      .limit(1);
    
    if (!product || product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Ensure the seller owns the product
    if (product[0].sellerId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this review' },
        { status: 403 }
      );
    }
    
    // Check if a response already exists
    const existingResponse = await db
      .select({ id: sellerResponses.id })
      .from(sellerResponses)
      .where(eq(sellerResponses.reviewId, body.reviewId))
      .limit(1);
    
    let result;
    
    if (existingResponse && existingResponse.length > 0) {
      // Update existing response
      result = await db
        .update(sellerResponses)
        .set({
          response: body.response,
          updatedAt: new Date(),
        })
        .where(eq(sellerResponses.id, existingResponse[0].id))
        .returning();
    } else {
      // Create new response
      result = await db
        .insert(sellerResponses)
        .values({
          sellerId: session.user.id,
          reviewId: body.reviewId,
          response: body.response,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Response added successfully',
      response: result[0],
    });
    
  } catch (error) {
    console.error('Error adding response to review:', error);
    return NextResponse.json(
      { error: 'Failed to add response' },
      { status: 500 }
    );
  }
}
