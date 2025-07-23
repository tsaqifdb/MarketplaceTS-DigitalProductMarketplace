import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, products } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const [
      totalUsersData,
      activeSellersData,
      activeCuratorsData,
      totalProductsData,
    ] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(users).where(eq(users.role, 'seller')),
      db.select({ value: count() }).from(users).where(eq(users.role, 'curator')),
      db.select({ value: count() }).from(products),
    ]);

    const stats = {
      totalUsers: totalUsersData[0]?.value ?? 0,
      activeSellers: activeSellersData[0]?.value ?? 0,
      activeCurators: activeCuratorsData[0]?.value ?? 0,
      totalProducts: totalProductsData[0]?.value ?? 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[ADMIN_STATS_API]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}