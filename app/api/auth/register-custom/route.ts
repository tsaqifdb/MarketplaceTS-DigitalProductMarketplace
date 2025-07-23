import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { sendOTPEmail } from '@/lib/services/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, gender, role } = body;

    // Validate input
    if (!name || !email || !password || !gender || !role) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { error: 'Jenis kelamin tidak valid' },
        { status: 400 }
      );
    }

    if (!['client', 'seller', 'curator'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
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
    const hashedPassword = await hash(password, 12);

    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        gender,
        role,
        isEmailVerified: false,
        sellerPoints: 0,
        curatorPoints: 0,
        isCuratorApproved: role === 'curator' ? false : undefined,
      })
      .returning();

    // Store OTP in the verification_tokens table
    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires: otpExpires,
    });

    // Send OTP via email
    await sendOTPEmail(email, otp, name);

    return NextResponse.json({
      message: 'Registrasi berhasil. Silakan cek email untuk verifikasi OTP.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
