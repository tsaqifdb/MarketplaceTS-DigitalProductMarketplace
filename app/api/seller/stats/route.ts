import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productReviews, users, customerReviews, orders } from '@/lib/db/schema';
import { and, eq, count, avg, sum } from 'drizzle-orm';
import { auth } from '@/lib/auth';

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
        { error: 'Unauthorized to view this seller stats' },
        { status: 403 }
      );
    }
    
    // Get seller info
    const sellerInfo = await db.query.users.findFirst({
      where: and(
        eq(users.id, sellerId),
        eq(users.role, 'seller')
      ),
    });
    
    if (!sellerInfo) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }
    
    // Get product count
    const productsResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.sellerId, sellerId));
    
    const totalProducts = productsResult[0]?.count || 0;
    
    // Get active products count (approved)
    const activeProductsResult = await db
      .select({ count: count() })
      .from(products)
      .where(and(
        eq(products.sellerId, sellerId),
        eq(products.status, 'approved')
      ));
    
    const activeProducts = activeProductsResult[0]?.count || 0;
    
    // Get average product review score
    const productReviewsResult = await db
      .select({ average: avg(products.reviewScore) })
      .from(products)
      .where(eq(products.sellerId, sellerId));
    
    const productReviews = productReviewsResult[0]?.average ? 
      parseFloat(productReviewsResult[0].average) : 0;
    
    // Get total products sold and revenue from orders table
    const productsOrdersResult = await db
      .select({ count: count() })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(and(
        eq(products.sellerId, sellerId),
        eq(orders.paymentStatus, 'completed')
      ));
    
    const productsSold = productsOrdersResult[0]?.count || 0;
    
    // Calculate total revenue from completed orders
    const revenueResult = await db
      .select({ total: sum(orders.amount) })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(and(
        eq(products.sellerId, sellerId),
        eq(orders.paymentStatus, 'completed')
      ));
    
    const totalRevenue = revenueResult[0]?.total ? 
      parseFloat(revenueResult[0].total) : 0;
    
    // Get seller rating and count total reviews from customer reviews
    const customerReviewsResult = await db
      .select({ average: avg(customerReviews.rating) })
      .from(customerReviews)
      .innerJoin(products, eq(customerReviews.productId, products.id))
      .where(eq(products.sellerId, sellerId));
    
    const sellerRating = customerReviewsResult[0]?.average ? 
      parseFloat(customerReviewsResult[0].average) : 0; // Default if no reviews

    // Count total customer reviews
    const customerReviewsCountResult = await db
      .select({ count: count() })
      .from(customerReviews)
      .innerJoin(products, eq(customerReviews.productId, products.id))
      .where(eq(products.sellerId, sellerId));
    
    const totalReviews = customerReviewsCountResult[0]?.count || 0;

    // Calculate activeness points based on product submissions and updates
    const activenessPoints = sellerInfo.sellerPoints || 0;
    
    return NextResponse.json({
      productsSold,
      totalRevenue,
      sellerRating: sellerRating.toFixed(1),
      productReviews: productReviews.toFixed(1),
      totalProducts,
      activenessPoints,
      totalReviews
    });
    
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller stats' },
      { status: 500 }
    );
  }
}
