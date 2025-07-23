import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// POST: Reject a pending curator
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, reason } = body;

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

    // Update user to client role (rejected as curator)
    const [updatedUser] = await db.update(users)
      .set({ 
        role: 'client',
        curatorPoints: 0,
        // In a real app, you might store rejection reason in a separate table
      })
      .where(eq(users.id, userId))
      .returning();

    // In a real app, you would send an email notification to the user with the reason

    return NextResponse.json({
      message: 'Curator application rejected',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error rejecting curator:', error);
    return NextResponse.json({ error: 'Failed to reject curator' }, { status: 500 });
  }
}