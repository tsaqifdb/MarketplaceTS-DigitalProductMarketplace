import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  stock: number;
  thumbnailUrl?: string;
  contentUrl?: string;
  status: string;
  reviewScore?: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Format price to Indonesian Rupiah
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numPrice);
}

// Get approved products for public display
export async function getApprovedProducts(category?: string): Promise<Product[]> {
  try {
    let whereConditions = [eq(products.status, 'approved')];
    
    if (category) {
      whereConditions.push(eq(products.category, category as any));
    }

    const productList = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        category: products.category,
        price: products.price,
        stock: products.stock,
        thumbnailUrl: products.thumbnailUrl,
        contentUrl: products.contentUrl,
        status: products.status,
        reviewScore: products.reviewScore,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      .orderBy(products.createdAt);

    return productList.map(p => ({
      ...p,
      stock: p.stock ?? 0,
      status: p.status || 'approved',
      createdAt: p.createdAt || new Date(),
      thumbnailUrl: p.thumbnailUrl ?? undefined,
      contentUrl: p.contentUrl ?? undefined,
      reviewScore: p.reviewScore ?? undefined,
      updatedAt: p.updatedAt ?? new Date(),
      seller: p.seller || { id: '', name: 'Unknown Seller', email: '' }
    }));
  } catch (error) {
    console.error('Error fetching approved products:', error);
    return [];
  }
}
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const result = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        category: products.category,
        price: products.price,
        stock: products.stock,
        thumbnailUrl: products.thumbnailUrl,
        contentUrl: products.contentUrl,
        status: products.status,
        reviewScore: products.reviewScore,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(and(
        eq(products.id, id),
        eq(products.status, 'approved')
      ))
      .limit(1);

    if (result.length === 0) return null;
    
    const product = result[0];
    return {
      ...product,
      stock: product.stock ?? 0,
      status: product.status || 'approved',
      createdAt: product.createdAt || new Date(),
      thumbnailUrl: product.thumbnailUrl ?? undefined,
      contentUrl: product.contentUrl ?? undefined,
      reviewScore: product.reviewScore ?? undefined,
      updatedAt: product.updatedAt ?? new Date(),
      seller: product.seller || { id: '', name: 'Unknown Seller', email: '' }
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productList = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        category: products.category,
        price: products.price,
        stock: products.stock,
        thumbnailUrl: products.thumbnailUrl,
        contentUrl: products.contentUrl,
        status: products.status,
        reviewScore: products.reviewScore,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(and(
        eq(products.category, category as any),
        eq(products.status, 'approved')
      ))
      .orderBy(products.createdAt);

    return productList.map(p => ({
      ...p,
      stock: p.stock ?? 0,
      status: p.status || 'approved',
      createdAt: p.createdAt || new Date(),
      thumbnailUrl: p.thumbnailUrl ?? undefined,
      contentUrl: p.contentUrl ?? undefined,
      reviewScore: p.reviewScore ?? undefined,
      updatedAt: p.updatedAt ?? new Date(),
      seller: p.seller || { id: '', name: 'Unknown Seller', email: '' }
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}
