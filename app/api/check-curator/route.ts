// app/api/check-curator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ approved: true });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Jika user tidak ditemukan atau bukan curator, return approved
    if (!user[0] || user[0].role !== 'curator') {
      return NextResponse.json({ approved: true });
    }

    // Jika curator tapi belum approved, return false
    if (user[0].isCuratorApproved !== true) {
      return NextResponse.json({ approved: false });
    }

    return NextResponse.json({ approved: true });

  } catch (error) {
    console.error('Check curator error:', error);
    return NextResponse.json({ approved: true }); // Default approved jika error
  }
}