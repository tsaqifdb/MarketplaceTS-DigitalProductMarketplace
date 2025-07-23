import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email dan OTP wajib diisi' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db
      .select({ isEmailVerified: users.isEmailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const userData = user[0];

    if (userData.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email sudah terverifikasi' },
        { status: 400 }
      );
    }

    // Find and verify OTP token
    const tokenRecord = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp)
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json(
        { error: 'Kode OTP tidak valid' },
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
        { error: 'Kode OTP sudah kedaluwarsa' },
        { status: 400 }
      );
    }

    // Update user as verified and delete the token
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    return NextResponse.json({
      message: 'Email berhasil diverifikasi',
      verified: true,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat verifikasi OTP' },
      { status: 500 }
    );
  }
}
