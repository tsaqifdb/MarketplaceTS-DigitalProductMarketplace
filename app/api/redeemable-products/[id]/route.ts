import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redeemableProducts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Wajib untuk disable caching di Vercel
export const dynamic = 'force-dynamic';

// GET: Ambil produk redeemable berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params

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

// PATCH: Update produk redeemable
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID produk wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah produk ada
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

    // Validasi field wajib
    if (!title || !description || !category || pointsCost === undefined) {
      return NextResponse.json(
        { error: 'Judul, deskripsi, kategori, dan biaya poin wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi pointsCost
    if (typeof pointsCost !== 'number' || pointsCost <= 0) {
      return NextResponse.json(
        { error: 'Biaya poin harus berupa angka positif' },
        { status: 400 }
      );
    }

    // Update produk
    const [updatedProduct] = await db
      .update(redeemableProducts)
      .set({
        title,
        description,
        category,
        pointsCost,
        stock: stock ?? 0,
        thumbnailUrl,
        contentUrl,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(redeemableProducts.id, id))
      .returning();

    return NextResponse.json({
      message: 'Produk berhasil diperbarui',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Update redeemable product error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat memperbarui produk: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE: Hapus produk redeemable
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID produk wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah produk ada
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

    // Hapus produk
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