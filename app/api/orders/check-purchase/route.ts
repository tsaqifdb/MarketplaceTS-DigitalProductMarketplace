import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');

    if (!productId || !customerId) {
      return NextResponse.json(
        { error: 'Product ID dan Customer ID wajib diisi' },
        { status: 400 }
      );
    }

    // Check if customer has purchased this product
    const purchaseRecord = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.customerId, customerId),
          eq(orders.productId, productId),
          eq(orders.paymentStatus, 'completed')
        )
      )
      .limit(1);

    const hasPurchased = purchaseRecord.length > 0;

    return NextResponse.json({
      hasPurchased,
      purchaseRecord: hasPurchased ? purchaseRecord[0] : null
    });

  } catch (error) {
    console.error('Check purchase error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa status pembelian' },
      { status: 500 }
    );
  }
}