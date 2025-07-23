import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/services/email';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    const user = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      // To prevent email enumeration, we don't reveal if the user was found or not.
      // We'll send a success response even if the email is not in the database.
      return NextResponse.json({
        message: 'Jika email terdaftar, Anda akan menerima email untuk reset password.',
      });
    }

    const userData = user[0];

    // Generate a secure token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token in the verification_tokens table
    await db.insert(verificationTokens).values({
      identifier: email,
      token: token,
      expires: expires,
    });

    // Send the password reset email
    await sendPasswordResetEmail(email, token, userData.name);

    return NextResponse.json({
      message: 'Jika email terdaftar, Anda akan menerima email untuk reset password.',
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat meminta reset password' },
      { status: 500 }
    );
  }
}