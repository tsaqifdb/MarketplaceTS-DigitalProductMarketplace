import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// POST: Approve a pending curator
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, initialPoints = 100 } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists and is a curator
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (existingUser[0].role !== 'curator') {
      return NextResponse.json({ error: 'User is not a curator' }, { status: 400 });
    }

    // Update user to approved status by giving them initial curator points
    const [updatedUser] = await db.update(users)
      .set({ 
        curatorPoints: initialPoints,
        isCuratorApproved: true
      })
      .where(eq(users.id, userId))
      .returning();

    // In a real app, you would send an email notification to the user

    return NextResponse.json({
      message: 'Curator approved successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error approving curator:', error);
    return NextResponse.json({ error: 'Failed to approve curator' }, { status: 500 });
  }
}