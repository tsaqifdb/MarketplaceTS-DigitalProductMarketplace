import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set initial points based on role
    let sellerPoints = 0;
    let curatorPoints = 0;
    let isCuratorApproved = false;

    if (role === 'seller') {
      sellerPoints = 0; // Initial seller points
    } else if (role === 'curator') {
      curatorPoints = 100; // Initial curator points
      isCuratorApproved = true; // Auto-approve curator created by admin
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role,
        sellerPoints,
        curatorPoints,
        isCuratorApproved,
        isEmailVerified: true, // Auto-verify users created by admin
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}