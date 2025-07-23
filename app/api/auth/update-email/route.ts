import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new NextResponse('Invalid email format', { status: 400 });
    }

    // Check if email is already taken
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return new NextResponse('Email already in use', { status: 409 });
    }

    await db.update(users).set({ email }).where(eq(users.id, session.user.id));

    return new NextResponse('Email updated successfully', { status: 200 });
  } catch (error) {
    console.error('[UPDATE_EMAIL]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}