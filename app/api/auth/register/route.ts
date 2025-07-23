import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { hashPassword, generateOTP } from '@/lib/utils/auth';
import { sendOTPEmail } from '@/lib/services/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'client' } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama wajib diisi' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate OTP
    const otp = generateOTP();
    
    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role: role as any,
        isEmailVerified: false,
        isCuratorApproved: role === 'curator' ? false : undefined,
      })
      .returning();

    // Store OTP in verification_tokens table
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // OTP expires in 15 minutes
    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires,
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    return NextResponse.json({
      message: 'Registrasi berhasil. Silakan cek email untuk kode OTP.',
      userId: newUser[0].id,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
