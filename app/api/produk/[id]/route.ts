import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Wajib untuk disable caching di Vercel
export const dynamic = 'force-dynamic';

// GET: Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { product: product[0] },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Get product by ID error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the product' },
      { status: 500 }
    );
  }
}

// PUT: Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // ✅ await params

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, category, price, stock } = body;

    // Cek apakah produk ada
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Cek apakah user adalah pemilik produk
    if (existingProduct[0].sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk mengedit produk ini.' },
        { status: 403 }
      );
    }

    // Update produk
    const [updatedProduct] = await db
      .update(products)
      .set({
        title,
        description,
        category,
        price,
        stock,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the product' },
      { status: 500 }
    );
  }
}

// DELETE: Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // ✅ await params

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Cek apakah produk ada
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Hapus produk
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the product' },
      { status: 500 }
    );
  }
}