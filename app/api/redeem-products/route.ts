import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productRedemptions, redeemableProducts, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const {
      curatorId,
      redeemableProductId,
    } = await request.json();

    // Validate input
    if (!curatorId || !redeemableProductId) {
      return NextResponse.json(
        { error: 'Curator ID dan Redeemable Product ID wajib diisi' },
        { status: 400 }
      );
    }

    // Validate curator exists and has enough points
    const curator = await db
      .select()
      .from(users)
      .where(eq(users.id, curatorId))
      .limit(1);

    if (curator.length === 0) {
      return NextResponse.json(
        { error: 'Curator tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!['curator', 'admin'].includes(curator[0].role)) {
      return NextResponse.json(
        { error: 'User bukan curator' },
        { status: 403 }
      );
    }

    // Validate redeemable product exists and is active
    const redeemableProduct = await db
      .select()
      .from(redeemableProducts)
      .where(eq(redeemableProducts.id, redeemableProductId))
      .limit(1);

    if (redeemableProduct.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!redeemableProduct[0].isActive) {
      return NextResponse.json(
        { error: 'Produk tidak tersedia untuk ditukarkan' },
        { status: 400 }
      );
    }

    // Get points cost from redeemable product
    const pointCost = redeemableProduct[0].pointsCost;

    if (!curator[0].curatorPoints || curator[0].curatorPoints < pointCost) {
      return NextResponse.json(
        { error: 'Points tidak mencukupi' },
        { status: 400 }
      );
    }

    // Create product redemption and deduct curator points in a transaction
    const result = await db.transaction(async (tx) => {
      // Create product redemption record
      const insertedRedemption = await tx
        .insert(productRedemptions)
        .values({
          userId: curatorId,
          redeemableProductId,
          pointsSpent: pointCost,
          status: 'completed',
        })
        .returning();

      if (insertedRedemption.length === 0) {
        throw new Error('Failed to create product redemption record');
      }

      // Update redeemable product stock
      const productResult = await tx
        .select({ stock: redeemableProducts.stock })
        .from(redeemableProducts)
        .where(eq(redeemableProducts.id, redeemableProductId))
        .limit(1);

      if (productResult.length === 0) {
        throw new Error('Redeemable product not found');
      }

      const currentStock = Number(productResult[0].stock);
      if (currentStock < 1) {
        throw new Error('Insufficient stock');
      }

      await tx
        .update(redeemableProducts)
        .set({ stock: currentStock - 1 })
        .where(eq(redeemableProducts.id, redeemableProductId));

      // Deduct curator points
      const currentPoints = curator[0].curatorPoints || 0;
      await tx
        .update(users)
        .set({
          curatorPoints: currentPoints - pointCost,
          updatedAt: new Date(),
        })
        .where(eq(users.id, curatorId));

      return {
        redemption: insertedRedemption[0],
        remainingPoints: (curator[0].curatorPoints || 0) - pointCost
      };
    });

    return NextResponse.json({
      message: 'Produk berhasil ditukar dengan poin',
      redemption: result.redemption,
      remainingPoints: result.remainingPoints,
      pointCost
    });

  } catch (error: any) {
    console.error('Redeem product error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat menukar produk: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curatorId = searchParams.get('curatorId');
    
    if (!curatorId) {
      return NextResponse.json(
        { error: 'Curator ID wajib diisi' },
        { status: 400 }
      );
    }

    // Get all product redemptions made by curator
    const redemptions = await db
      .select({
        id: productRedemptions.id,
        pointsSpent: productRedemptions.pointsSpent,
        createdAt: productRedemptions.createdAt,
        redeemableProduct: {
          id: redeemableProducts.id,
          title: redeemableProducts.title,
          category: redeemableProducts.category,
          pointsCost: redeemableProducts.pointsCost,
          thumbnailUrl: redeemableProducts.thumbnailUrl,
          contentUrl: redeemableProducts.contentUrl,
        }
      })
      .from(productRedemptions)
      .leftJoin(redeemableProducts, eq(productRedemptions.redeemableProductId, redeemableProducts.id))
      .where(
        and(
          eq(productRedemptions.userId, curatorId),
          eq(productRedemptions.status, 'completed')
        )
      );

    return NextResponse.json({
      redeemedProducts: redemptions,
    });

  } catch (error) {
    console.error('Get redeemed products error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data produk yang ditukar' },
      { status: 500 }
    );
  }
}