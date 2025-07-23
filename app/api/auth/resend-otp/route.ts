import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { generateOTP } from '@/lib/utils/auth';
import { sendOTPEmail } from '@/lib/services/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db
      .select()
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

    // Generate new OTP
    const otp = generateOTP();
    
    // Update user with new OTP
    await db
      .update(users)
      .set({
        emailVerificationToken: otp,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    // Send new OTP email
    await sendOTPEmail(email, otp, userData.name);

    return NextResponse.json({
      message: 'Kode OTP baru telah dikirim ke email Anda',
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim ulang OTP' },
      { status: 500 }
    );
  }
}
