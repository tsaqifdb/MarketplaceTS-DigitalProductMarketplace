import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews, products, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Mengambil parameter id dari query string jika ada
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    // Jika reviewId disediakan, ambil detail review
    if (reviewId) {
      const review = await db.select({
        id: productReviews.id,
        productId: productReviews.productId,
        productTitle: products.title,
        productCategory: products.category,
        curatorId: productReviews.curatorId,
        curatorName: users.name,
        question1Score: productReviews.question1Score,
        question2Score: productReviews.question2Score,
        question3Score: productReviews.question3Score,
        question4Score: productReviews.question4Score,
        question5Score: productReviews.question5Score,
        question6Score: productReviews.question6Score,
        question7Score: productReviews.question7Score,
        question8Score: productReviews.question8Score,
        totalScore: productReviews.totalScore,
        averageScore: productReviews.averageScore,
        status: productReviews.status,
        pointsEarned: productReviews.pointsEarned,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
      })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .innerJoin(users, eq(productReviews.curatorId, users.id))
      .where(eq(productReviews.id, reviewId))
      .limit(1);

      if (review.length === 0) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json(review[0]);
    }

    // Jika tidak ada reviewId, ambil semua review
    const reviews = await db.select({
      id: productReviews.id,
      productId: productReviews.productId,
      productTitle: products.title,
      productCategory: products.category,
      curatorId: productReviews.curatorId,
      curatorName: users.name,
      question1Score: productReviews.question1Score,
      question2Score: productReviews.question2Score,
      question3Score: productReviews.question3Score,
      question4Score: productReviews.question4Score,
      question5Score: productReviews.question5Score,
      question6Score: productReviews.question6Score,
      question7Score: productReviews.question7Score,
      question8Score: productReviews.question8Score,
      totalScore: productReviews.totalScore,
      averageScore: productReviews.averageScore,
      status: productReviews.status,
      pointsEarned: productReviews.pointsEarned,
      createdAt: productReviews.createdAt,
      updatedAt: productReviews.updatedAt,
    })
    .from(productReviews)
    .innerJoin(products, eq(productReviews.productId, products.id))
    .innerJoin(users, eq(productReviews.curatorId, users.id))
    .orderBy(desc(productReviews.createdAt));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[ADMIN_REVIEWS_API]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}