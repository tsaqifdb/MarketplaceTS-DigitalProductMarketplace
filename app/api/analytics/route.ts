import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, products, orders, productReviews, customerReviews } from '@/lib/db/schema';
import { eq, count, sum, avg, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    // Base analytics for all roles
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalProducts = await db.select({ count: count() }).from(products);
    const totalOrders = await db.select({ count: count() }).from(orders);
    
    // Products by status
    const pendingProducts = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.status, 'pending'));
    
    const approvedProducts = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.status, 'approved'));
    
    const rejectedProducts = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.status, 'rejected'));

    // Revenue analytics
    const totalRevenue = await db
      .select({ 
        total: sum(orders.amount) 
      })
      .from(orders)
      .where(eq(orders.paymentStatus, 'completed'));

    // Products by category
    const productsByCategory = await db
      .select({
        category: products.category,
        count: count()
      })
      .from(products)
      .groupBy(products.category);

    let roleSpecificData = {};

    // Role-specific analytics
    if (role === 'seller' && userId) {
      // Seller analytics
      const sellerProducts = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.sellerId, userId));

      const sellerRevenue = await db
        .select({ 
          total: sum(orders.amount) 
        })
        .from(orders)
        .innerJoin(products, eq(orders.productId, products.id))
        .where(
          sql`${products.sellerId} = ${userId} AND ${orders.paymentStatus} = 'completed'`
        );

      const sellerProductsByStatus = await db
        .select({
          status: products.status,
          count: count()
        })
        .from(products)
        .where(eq(products.sellerId, userId))
        .groupBy(products.status);

      roleSpecificData = {
        sellerProducts: sellerProducts[0]?.count || 0,
        sellerRevenue: sellerRevenue[0]?.total || 0,
        sellerProductsByStatus,
      };

    } else if (role === 'curator' && userId) {
      // Curator analytics
      const curatorReviews = await db
        .select({ count: count() })
        .from(productReviews)
        .where(eq(productReviews.curatorId, userId));

      const curatorPoints = await db
        .select({ 
          points: users.curatorPoints 
        })
        .from(users)
        .where(eq(users.id, userId));

      const curatorAvgScore = await db
        .select({ 
          avgScore: avg(productReviews.averageScore) 
        })
        .from(productReviews)
        .where(eq(productReviews.curatorId, userId));

      const reviewsByScore = await db
        .select({
          scoreRange: sql<string>`
            CASE 
              WHEN ${productReviews.averageScore} >= 4 THEN 'Excellent (4-5)'
              WHEN ${productReviews.averageScore} >= 3 THEN 'Good (3-4)'
              WHEN ${productReviews.averageScore} >= 2 THEN 'Fair (2-3)'
              ELSE 'Poor (1-2)'
            END
          `,
          count: count()
        })
        .from(productReviews)
        .where(eq(productReviews.curatorId, userId))
        .groupBy(sql`
          CASE 
            WHEN ${productReviews.averageScore} >= 4 THEN 'Excellent (4-5)'
            WHEN ${productReviews.averageScore} >= 3 THEN 'Good (3-4)'
            WHEN ${productReviews.averageScore} >= 2 THEN 'Fair (2-3)'
            ELSE 'Poor (1-2)'
          END
        `);

      roleSpecificData = {
        curatorReviews: curatorReviews[0]?.count || 0,
        curatorPoints: curatorPoints[0]?.points || 0,
        curatorAvgScore: curatorAvgScore[0]?.avgScore || 0,
        reviewsByScore,
      };

    } else if (role === 'client' && userId) {
      // Client analytics
      const clientOrders = await db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.customerId, userId));

      const clientSpending = await db
        .select({ 
          total: sum(orders.amount) 
        })
        .from(orders)
        .where(
          sql`${orders.customerId} = ${userId} AND ${orders.paymentStatus} = 'completed'`
        );

      const clientReviews = await db
        .select({ count: count() })
        .from(customerReviews)
        .where(eq(customerReviews.customerId, userId));

      const clientOrdersByStatus = await db
        .select({
          status: orders.paymentStatus,
          count: count()
        })
        .from(orders)
        .where(eq(orders.customerId, userId))
        .groupBy(orders.paymentStatus);

      roleSpecificData = {
        clientOrders: clientOrders[0]?.count || 0,
        clientSpending: clientSpending[0]?.total || 0,
        clientReviews: clientReviews[0]?.count || 0,
        clientOrdersByStatus,
      };
    }

    // Recent activity (last 7 days)
    const recentOrders = await db
      .select()
      .from(orders)
      .where(sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(10);

    const recentReviews = await db
      .select()
      .from(productReviews)
      .where(sql`${productReviews.createdAt} >= NOW() - INTERVAL '7 days'`)
      .orderBy(sql`${productReviews.createdAt} DESC`)
      .limit(10);

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers[0]?.count || 0,
        totalProducts: totalProducts[0]?.count || 0,
        totalOrders: totalOrders[0]?.count || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingProducts: pendingProducts[0]?.count || 0,
        approvedProducts: approvedProducts[0]?.count || 0,
        rejectedProducts: rejectedProducts[0]?.count || 0,
      },
      charts: {
        productsByCategory,
      },
      roleSpecific: roleSpecificData,
      recentActivity: {
        orders: recentOrders,
        reviews: recentReviews,
      },
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data analytics' },
      { status: 500 }
    );
  }
}
