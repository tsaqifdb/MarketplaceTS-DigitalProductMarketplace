import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customerReviews, orders, products, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const {
      productId,
      customerId,
      rating,
      comment
    } = await request.json();

    // Validate input
    if (!productId || !customerId || !rating) {
      return NextResponse.json(
        { error: 'Product ID, Customer ID, dan rating wajib diisi' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating harus antara 1-5' },
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

    // Validate product exists
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

    // Check if customer has purchased this product
    const order = await db
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

    if (order.length === 0) {
      return NextResponse.json(
        { error: 'Anda harus membeli produk ini terlebih dahulu untuk memberikan review' },
        { status: 403 }
      );
    }

    // Check if customer already reviewed this product
    const existingReview = await db
      .select()
      .from(customerReviews)
      .where(
        and(
          eq(customerReviews.customerId, customerId),
          eq(customerReviews.productId, productId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'Anda sudah memberikan review untuk produk ini' },
        { status: 400 }
      );
    }

    // Create review
    const newReview = await db
      .insert(customerReviews)
      .values({
        productId,
        customerId,
        rating,
        comment,
      })
      .returning();

    return NextResponse.json({
      message: 'Review berhasil ditambahkan',
      review: newReview[0],
    });

  } catch (error) {
    console.error('Create customer review error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');

    let reviews;
    
    if (productId && customerId) {
      reviews = await db
        .select()
        .from(customerReviews)
        .where(
          and(
            eq(customerReviews.productId, productId),
            eq(customerReviews.customerId, customerId)
          )
        );
    } else if (productId) {
      reviews = await db
        .select()
        .from(customerReviews)
        .where(eq(customerReviews.productId, productId));
    } else if (customerId) {
      reviews = await db
        .select()
        .from(customerReviews)
        .where(eq(customerReviews.customerId, customerId));
    } else {
      reviews = await db.select().from(customerReviews);
    }

    return NextResponse.json({
      reviews,
    });

  } catch (error) {
    console.error('Get customer reviews error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data review' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { reviewId, rating, comment } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID wajib diisi' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (rating) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating harus antara 1-5' },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }

    if (comment !== undefined) {
      updateData.comment = comment;
    }

    const updatedReview = await db
      .update(customerReviews)
      .set(updateData)
      .where(eq(customerReviews.id, reviewId))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Review berhasil diupdate',
      review: updatedReview[0],
    });

  } catch (error) {
    console.error('Update customer review error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID wajib diisi' },
        { status: 400 }
      );
    }

    const deletedReview = await db
      .delete(customerReviews)
      .where(eq(customerReviews.id, reviewId))
      .returning();

    if (deletedReview.length === 0) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Review berhasil dihapus',
    });

  } catch (error) {
    console.error('Delete customer review error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus review' },
      { status: 500 }
    );
  }
}
