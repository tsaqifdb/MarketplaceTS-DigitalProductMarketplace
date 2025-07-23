import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, token, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Find the token
    const tokenRecord = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, token)
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json(
        { error: 'Token tidak valid atau tidak ditemukan' },
        { status: 400 }
      );
    }

    const tokenData = tokenRecord[0];

    if (new Date() > tokenData.expires) {
      // Delete expired token
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, email));
      return NextResponse.json(
        { error: 'Token sudah kedaluwarsa' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update user's password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    return NextResponse.json({
      message: 'Password berhasil direset',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mereset password' },
      { status: 500 }
    );
  }
}