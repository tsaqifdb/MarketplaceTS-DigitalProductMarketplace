import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redeemableProducts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    
    // Build query based on parameters
    let query;
    
    // Filter by isActive if provided
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      query = await db.select().from(redeemableProducts).where(eq(redeemableProducts.isActive, isActive));
    } else {
      query = await db.select().from(redeemableProducts);
    }
    
    const products = query;
    
    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error('Get redeemable products error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data produk yang dapat ditukar' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      category,
      pointsCost,
      stock,
      thumbnailUrl,
      contentUrl,
      isActive = true,
    } = await request.json();

    // Validate required fields
    if (!title || !description || !category || !pointsCost) {
      return NextResponse.json(
        { error: 'Judul, deskripsi, kategori, dan biaya poin wajib diisi' },
        { status: 400 }
      );
    }

    // Validate pointsCost is a positive number
    if (typeof pointsCost !== 'number' || pointsCost <= 0) {
      return NextResponse.json(
        { error: 'Biaya poin harus berupa angka positif' },
        { status: 400 }
      );
    }

    // Create new redeemable product
    const newProduct = await db
      .insert(redeemableProducts)
      .values({
        title,
        description,
        category,
        pointsCost,
        stock: stock || 0,
        thumbnailUrl,
        contentUrl,
        isActive,
      })
      .returning();

    return NextResponse.json({
      message: 'Produk berhasil ditambahkan',
      product: newProduct[0],
    });
  } catch (error: any) {
    console.error('Create redeemable product error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat menambahkan produk: ${error.message}` },
      { status: 500 }
    );
  }
}