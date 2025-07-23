import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get curator ID from query params or use the authenticated user's ID
    const { searchParams } = new URL(request.url);
    const curatorId = searchParams.get('curatorId') || session.user.id;

    // Only allow curators to access their own points or admins to access any curator's points
    if (session.user.role !== 'admin' && session.user.id !== curatorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get curator points from database
    const curator = await db
      .select({
        id: users.id,
        curatorPoints: users.curatorPoints
      })
      .from(users)
      .where(eq(users.id, curatorId))
      .limit(1);

    if (curator.length === 0) {
      return NextResponse.json({ error: 'Curator not found' }, { status: 404 });
    }

    return NextResponse.json({
      curatorPoints: curator[0].curatorPoints || 0
    });
  } catch (error) {
    console.error('Error fetching curator points:', error);
    return NextResponse.json({ error: 'Failed to fetch curator points' }, { status: 500 });
  }
}