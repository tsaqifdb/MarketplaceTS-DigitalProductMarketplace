import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews, products, users } from '@/lib/db/schema';
import { calculateReviewScore, calculateCuratorPoints, calculateSellerPoints, isReviewScorePassing } from '@/lib/utils/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const {
      productId,
      curatorId,
      scores, // Array of 8 scores
      comments
    } = await request.json();

    // Validate input
    if (!productId || !curatorId || !scores || scores.length !== 8) {
      return NextResponse.json(
        { error: 'Data review tidak lengkap' },
        { status: 400 }
      );
    }

    // Validate curator exists and is curator/admin
    const curator = await db
      .select()
      .from(users)
      .where(eq(users.id, curatorId))
      .limit(1);

    if (curator.length === 0 || !['curator', 'admin'].includes(curator[0].role)) {
      return NextResponse.json(
        { error: 'Curator tidak valid' },
        { status: 403 }
      );
    }

    // Validate product exists and is pending
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

    if (product[0].status !== 'pending') {
      return NextResponse.json(
        { error: 'Produk sudah di-review' },
        { status: 400 }
      );
    }

    // Calculate scores
    const totalScore = scores.reduce((a: number, b: number) => a + b, 0);
    const averageScore = calculateReviewScore(scores);
    const curatorPoints = calculateCuratorPoints(product[0].category);

    // Create review
    const newReview = await db
      .insert(productReviews)
      .values({
        productId,
        curatorId,
        question1Score: scores[0],
        question2Score: scores[1],
        question3Score: scores[2],
        question4Score: scores[3],
        question5Score: scores[4],
        question6Score: scores[5],
        question7Score: scores[6],
        question8Score: scores[7],
        totalScore: totalScore.toString(),
        averageScore: averageScore.toString(),
        comments,
        pointsEarned: curatorPoints,
        status: 'completed',
      })
      .returning();

    // Determine if product passes or fails
    const productStatus = isReviewScorePassing(averageScore) ? 'approved' : 'rejected';
    
    // Update product status and review score
    await db
      .update(products)
      .set({
        status: productStatus,
        reviewScore: averageScore.toString(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    // Add curator points
    await db
      .update(users)
      .set({
        curatorPoints: (curator[0].curatorPoints || 0) + curatorPoints,
        updatedAt: new Date(),
      })
      .where(eq(users.id, curatorId));

    // Add seller points based on result
    const seller = await db
      .select()
      .from(users)
      .where(eq(users.id, product[0].sellerId))
      .limit(1);

    if (seller.length > 0) {
      const sellerPointsToAdd = calculateSellerPoints(productStatus === 'approved' ? 'approved' : 'rejected');
      await db
        .update(users)
        .set({
          sellerPoints: (seller[0].sellerPoints || 0) + sellerPointsToAdd,
          updatedAt: new Date(),
        })
        .where(eq(users.id, product[0].sellerId));
    }

    return NextResponse.json({
      message: `Produk telah di-review dan ${productStatus}`,
      review: newReview[0],
      productStatus,
      averageScore,
      curatorPointsEarned: curatorPoints,
    });

  } catch (error) {
    console.error('Product review error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat review produk' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const curatorId = searchParams.get('curatorId');

    // Build conditions array
    const conditions = [];
    if (productId) {
      conditions.push(eq(productReviews.productId, productId));
    }
    if (curatorId) {
      conditions.push(eq(productReviews.curatorId, curatorId));
    }

    let reviews;
    if (conditions.length > 0) {
      // Use and() to combine multiple conditions
      const { and } = await import('drizzle-orm');
      reviews = await db
        .select()
        .from(productReviews)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    } else {
      reviews = await db.select().from(productReviews);
    }

    return NextResponse.json({
      reviews,
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data review' },
      { status: 500 }
    );
  }
}
