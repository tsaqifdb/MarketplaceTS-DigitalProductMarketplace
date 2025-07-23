import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, isNull, or, lte, desc } from 'drizzle-orm';

// GET: Fetch all pending curator applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get pending curators (role = curator and isCuratorApproved is false or null)
    const pendingCurators = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, 'curator'),
          or(isNull(users.isCuratorApproved), eq(users.isCuratorApproved, false))
        )
      )
      .orderBy(desc(users.createdAt)); // Sort by creation date

    return NextResponse.json({
      pendingCurators,
      count: pendingCurators.length
    });
  } catch (error) {
    console.error('Error fetching pending curators:', error);
    return NextResponse.json({ error: 'Failed to fetch pending curators' }, { status: 500 });
  }
}