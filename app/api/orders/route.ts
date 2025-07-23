import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, products, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const {
      customerId,
      productId,
      paymentMethod = 'manual'
    } = await request.json();

    // Validate input
    if (!customerId || !productId) {
      return NextResponse.json(
        { error: 'Customer ID dan Product ID wajib diisi' },
        { status: 400 }
      );
    }

    // Validate customer exists
    const customer = await db
      .select()
      .from(users)
      .where(eq(users.id, customerId))
      .limit(1);

    if (customer.length === 0) {
      return NextResponse.json(
        { error: 'Customer tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate product exists and is approved
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    if (product[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Produk belum disetujui' },
        { status: 400 }
      );
    }

    let finalAmount = Number(product[0].price);

    // Create order and update product stock in a transaction
    const newOrder = await db.transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx
        .insert(orders)
        .values({
          customerId,
          productId,
          amount: finalAmount.toString(),
          paymentStatus: 'pending',
          paymentMethod,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })
        .returning();

      if (insertedOrder.length === 0) {
        throw new Error('Failed to create order');
      }

      // Update product stock
      const productResult = await tx
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (productResult.length === 0) {
        throw new Error('Product not found');
      }

      const currentStock = Number(productResult[0].stock);
      if (currentStock < 1) {
        throw new Error('Insufficient stock');
      }

      await tx
        .update(products)
        .set({ stock: currentStock - 1 })
        .where(eq(products.id, productId));

      // Voucher functionality has been removed

      return insertedOrder;
    });
    return NextResponse.json({
      message: 'Order berhasil dibuat',
      order: newOrder[0],
      amount: finalAmount,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build where conditions array
    const conditions = [];
    
    if (customerId) {
      conditions.push(eq(orders.customerId, customerId));
    }
    if (productId) {
      conditions.push(eq(orders.productId, productId));
    }
    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus));
    }

    // Base query with conditional where clause
    const baseQuery = db
      .select({
        id: orders.id,
        amount: orders.amount,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        transactionId: orders.transactionId,
        createdAt: orders.createdAt,
        product: {
          id: products.id,
          title: products.title,
          category: products.category,
          contentUrl: products.contentUrl,
        },
        seller: {
          name: users.name,
        },
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(products.sellerId, users.id));

    // Apply conditions if they exist
    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    const orderList = await query;

    return NextResponse.json({
      orders: orderList,
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data order' },
      { status: 500 }
    );
  }
}

// Update order payment status
export async function PATCH(request: NextRequest) {
  try {
    const { orderId, paymentStatus, transactionId } = await request.json();

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Order ID dan payment status wajib diisi' },
        { status: 400 }
      );
    }

    const updateData: any = {
      paymentStatus,
      updatedAt: new Date(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    const updatedOrder = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    if (updatedOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Status pembayaran berhasil diupdate',
      order: updatedOrder[0],
    });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat update order' },
      { status: 500 }
    );
  }
}
