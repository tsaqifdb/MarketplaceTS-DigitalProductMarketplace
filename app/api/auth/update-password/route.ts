import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return new NextResponse('Invalid data provided', { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || !user.password) {
      return new NextResponse('User not found or password not set', { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return new NextResponse('Incorrect current password', { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, session.user.id));

    return new NextResponse('Password updated successfully', { status: 200 });
  } catch (error) {
    console.error('[UPDATE_PASSWORD]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}