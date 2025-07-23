import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, products, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const transactionId = (await params).transactionId;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const orderDetails = await db
      .select({
        order: orders,
        product: products,
        customer: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.transactionId, transactionId))
      .limit(1);

    if (orderDetails.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: orderDetails[0],
    });

  } catch (error) {
    console.error('Get order by transaction ID error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the order' },
      { status: 500 }
    );
  }
}