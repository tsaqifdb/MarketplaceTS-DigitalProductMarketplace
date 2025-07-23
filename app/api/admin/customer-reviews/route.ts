import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customerReviews, products, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Mengambil parameter productId dari query string jika ada
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const reviewId = searchParams.get('id');

    // Jika reviewId disediakan, ambil detail review
    if (reviewId) {
      const review = await db.select({
        id: customerReviews.id,
        productId: customerReviews.productId,
        productTitle: products.title,
        productCategory: products.category,
        customerId: customerReviews.customerId,
        customerName: users.name,
        rating: customerReviews.rating,
        comment: customerReviews.comment,
        createdAt: customerReviews.createdAt,
      })
      .from(customerReviews)
      .innerJoin(products, eq(customerReviews.productId, products.id))
      .innerJoin(users, eq(customerReviews.customerId, users.id))
      .where(eq(customerReviews.id, reviewId))
      .limit(1);

      if (review.length === 0) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json(review[0]);
    }

    // Buat base query
    let baseQuery = db.select({
      id: customerReviews.id,
      productId: customerReviews.productId,
      productTitle: products.title,
      productCategory: products.category,
      customerId: customerReviews.customerId,
      customerName: users.name,
      rating: customerReviews.rating,
      comment: customerReviews.comment,
      createdAt: customerReviews.createdAt,
    })
    .from(customerReviews)
    .innerJoin(products, eq(customerReviews.productId, products.id))
    .innerJoin(users, eq(customerReviews.customerId, users.id));

    // Jika productId disediakan, filter berdasarkan productId
    let reviews;
    if (productId) {
      reviews = await baseQuery
        .where(eq(customerReviews.productId, productId))
        .orderBy(desc(customerReviews.createdAt));
    } else {
      reviews = await baseQuery
        .orderBy(desc(customerReviews.createdAt));
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[ADMIN_CUSTOMER_REVIEWS_API]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}