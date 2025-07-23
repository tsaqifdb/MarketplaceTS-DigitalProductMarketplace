import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { uploadThumbnail, uploadProductFile } from '@/lib/services/cloudinary';
import { calculateSellerPoints } from '@/lib/utils/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const sellerId = formData.get('sellerId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = formData.get('price') as string;
    const stock = formData.get('stock') as string;
    const thumbnailFile = formData.get('thumbnail') as File;
    const contentFile = formData.get('content') as File;

    // Validate input
    if (!sellerId || !title || !description || !category || !price || !stock) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Validate seller exists and is seller/admin
    const seller = await db
      .select()
      .from(users)
      .where(eq(users.id, sellerId))
      .limit(1);

    if (seller.length === 0 || !['seller', 'admin'].includes(seller[0].role)) {
      return NextResponse.json(
        { error: 'Seller tidak valid' },
        { status: 403 }
      );
    }

    let thumbnailUrl = '';
    let contentUrl = '';

    // Upload thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailUrl = await uploadThumbnail(thumbnailFile, 'marketplace-ts/thumbnails');
    }

    // Upload content file if provided
    if (contentFile && contentFile.size > 0) {
      contentUrl = await uploadProductFile(contentFile, 'marketplace-ts/content');
    }

    // Create product
    const newProduct = await db
      .insert(products)
      .values({
        sellerId,
        title,
        description,
        category: category as any,
        price,
        stock: parseInt(stock, 10),
        thumbnailUrl,
        contentUrl,
        status: 'pending',
      })
      .returning();

    // Add seller points for submission
    const pointsToAdd = calculateSellerPoints('submit');
    await db
      .update(users)
      .set({
        sellerPoints: (seller[0].sellerPoints || 0) + pointsToAdd,
        updatedAt: new Date(),
      })
      .where(eq(users.id, sellerId));

    return NextResponse.json({
      message: 'Produk berhasil disubmit untuk review',
      product: newProduct[0],
      pointsEarned: pointsToAdd,
    });

  } catch (error) {
    console.error('Product submission error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat submit produk' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    // Build where conditions array
    const whereConditions = [];
    
    if (id) {
      whereConditions.push(eq(products.id, id));
    }
    if (sellerId) {
      whereConditions.push(eq(products.sellerId, sellerId));
    }
    if (status) {
      whereConditions.push(eq(products.status, status as any));
    }
    if (category) {
      whereConditions.push(eq(products.category, category as any));
    }

    // Execute query with all conditions
    let productList;
    
    if (whereConditions.length === 0) {
      productList = await db.select().from(products);
    } else if (whereConditions.length === 1) {
      productList = await db.select().from(products).where(whereConditions[0]);
    } else {
      // For multiple conditions, we need to use a different approach with AND logic
      productList = await db.select().from(products).where(and(...whereConditions));
    }

    return NextResponse.json({
      products: productList,
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data produk' },
      { status: 500 }
    );
  }
}
