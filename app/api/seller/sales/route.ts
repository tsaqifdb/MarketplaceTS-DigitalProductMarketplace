import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { and, eq, desc, sql, count } from 'drizzle-orm';
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
    const countOnly = searchParams.get('countOnly');
    const productId = searchParams.get('productId');
    
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
        { error: 'Unauthorized to view this seller sales' },
        { status: 403 }
      );
    }

    // If countOnly is true, return the count of sales per product
    if (countOnly === 'true') {
      const salesCount = await db
        .select({
          productId: orders.productId,
          productName: products.title,
          totalSales: count(orders.id),
        })
        .from(orders)
        .innerJoin(products, eq(orders.productId, products.id))
        .where(and(
          eq(products.sellerId, sellerId),
          eq(orders.paymentStatus, 'completed') // Only completed orders
        ))
        .groupBy(orders.productId, products.title);
      
      // If productId is provided, filter for that specific product
      if (productId) {
        const specificProductSales = salesCount.find(item => item.productId === productId);
        return NextResponse.json(specificProductSales ? { count: specificProductSales.totalSales } : { count: 0 });
      }
      
      return NextResponse.json(salesCount);
    }
    
    // Get sales history from the orders table for this seller's products
    const salesHistory = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        productName: products.title,
        category: products.category,
        date: orders.createdAt,
        amount: orders.amount,
        paymentStatus: orders.paymentStatus,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(and(
        eq(products.sellerId, sellerId),
        eq(orders.paymentStatus, 'completed') // Only completed orders
      ))
      .orderBy(desc(orders.createdAt)) // Most recent first
      .limit(10);
    
    if (!salesHistory || salesHistory.length === 0) {
      return NextResponse.json([]);
    }
    
    // Format the data for the frontend
    const formattedSalesHistory = salesHistory.map(sale => {
      return {
        id: sale.id,
        productId: sale.productId,
        productName: sale.productName,
        category: sale.category,
        date: sale.date ? new Date(sale.date).toLocaleDateString('id-ID') : '-',
        amount: sale.amount ? Number(sale.amount) : 0,
        status: sale.paymentStatus === 'completed' ? 'Selesai' : 
                sale.paymentStatus === 'pending' ? 'Pending' : 'Dibatalkan'
      };
    });
    
    return NextResponse.json(formattedSalesHistory);
    
  } catch (error) {
    console.error('Error fetching seller sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller sales history' },
      { status: 500 }
    );
  }
}
