import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/users/[id] - Ambil data user (seller) berdasarkan id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Hanya kirim data yang diperlukan
    return NextResponse.json({
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
