import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/users/[id] - Ambil data user (seller) berdasarkan id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Diperbaiki: params sebagai Promise
) {
  try {
    const { id } = await params; // ✅ await params

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hanya kirim data yang diperlukan
    return NextResponse.json({
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}