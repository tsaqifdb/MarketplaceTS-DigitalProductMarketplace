import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any)?.role || 'client',
      gender: (session.user as any)?.gender || 'not specified',
      sellerPoints: (session.user as any)?.sellerPoints || 0,
      curatorPoints: (session.user as any)?.curatorPoints || 0,
      isEmailVerified: (session.user as any)?.isEmailVerified || false,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
