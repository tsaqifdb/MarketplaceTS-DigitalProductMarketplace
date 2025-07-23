import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redeemableProducts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET a single redeemable product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID produk wajib diisi' },
        { status: 400 }
      );
    }
    
    const product = await db
      .select()
      .from(redeemableProducts)
      .where(eq(redeemableProducts.id, id))
      .limit(1);
    
    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      product: product[0],
    });
  } catch (error) {
    console.error('Get redeemable product error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data produk' },
      { status: 500 }
    );
  }
}

// UPDATE a redeemable product
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID produk wajib diisi' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const existingProduct = await db
      .select()
      .from(redeemableProducts)
      .where(eq(redeemableProducts.id, id))
      .limit(1);
    
    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const {
      title,
      description,
      category,
      pointsCost,
      stock,
      thumbnailUrl,
      contentUrl,
      isActive,
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
    
    // Update the product
    const updatedProduct = await db
      .update(redeemableProducts)
      .set({
        title,
        description,
        category,
        pointsCost,
        stock: stock || 0,
        thumbnailUrl,
        contentUrl,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(redeemableProducts.id, id))
      .returning();
    
    return NextResponse.json({
      message: 'Produk berhasil diperbarui',
      product: updatedProduct[0],
    });
  } catch (error: any) {
    console.error('Update redeemable product error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat memperbarui produk: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE a redeemable product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID produk wajib diisi' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const existingProduct = await db
      .select()
      .from(redeemableProducts)
      .where(eq(redeemableProducts.id, id))
      .limit(1);
    
    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Delete the product
    await db
      .delete(redeemableProducts)
      .where(eq(redeemableProducts.id, id));
    
    return NextResponse.json({
      message: 'Produk berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete redeemable product error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat menghapus produk: ${error.message}` },
      { status: 500 }
    );
  }
}