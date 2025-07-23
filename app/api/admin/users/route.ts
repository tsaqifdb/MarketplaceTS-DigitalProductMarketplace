// PATCH: Approve curator
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    // Update isCuratorApproved
    const [updatedUser] = await db
      .update(users)
      .set({ isCuratorApproved: true })
      .where(eq(users.id, userId))
      .returning();
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Curator approved', user: updatedUser });
  } catch (error) {
    console.error('[ADMIN_APPROVE_CURATOR]', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userRoleEnum } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, like, desc, or, and, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// GET: Fetch all users with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    // Validate and parse pagination parameters
    let page: number;
    try {
      page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
      if (isNaN(page)) page = 1;
    } catch (e) {
      page = 1;
    }
    
    let limit: number;
    try {
      limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
      if (isNaN(limit)) limit = 10;
    } catch (e) {
      limit = 10;
    }
    
    const offset = Math.max(0, (page - 1) * limit);

    // Build query conditions
    const whereConditions: any[] = [];

    if (role && role !== 'all') {
      // Type check to ensure role is a valid user role
      if (userRoleEnum.enumValues.includes(role as any)) {
        whereConditions.push(eq(users.role, role as typeof userRoleEnum.enumValues[number]));
      } else {
        // Invalid role provided, return empty result
        return NextResponse.json({
          users: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        });
      }
    }

    if (search) {
      // Sanitize search input to prevent SQL injection
      const sanitizedSearch = search.replace(/[\\%\_]/g, '\\$&');
      whereConditions.push(
        or(
          like(users.name, `%${sanitizedSearch}%`),
          like(users.email, `%${sanitizedSearch}%`)
        )
      );
    }

    // Build the base query with all conditions
    let baseQuery = whereConditions.length > 0
      ? db.select().from(users).where(and(...whereConditions))
      : db.select().from(users);

    // Get total count for pagination
    // Build where conditions for totalCountQuery
    const totalCountWhere: any[] = [];
    if (role && role !== 'all') {
      if (userRoleEnum.enumValues.includes(role as (typeof userRoleEnum.enumValues)[number])) {
        totalCountWhere.push(eq(users.role, role as typeof userRoleEnum.enumValues[number]));
      } else {
        return NextResponse.json({
          users: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        });
      }
    }
    if (search) {
      const sanitizedSearch = search.replace(/[\\%\_]/g, '\\$&');
      totalCountWhere.push(
        or(
          like(users.name, `%${sanitizedSearch}%`),
          like(users.email, `%${sanitizedSearch}%`)
        )
      );
    }

    let totalCountQuery;
    if (totalCountWhere.length > 0) {
      totalCountQuery = db.select({ count: count() }).from(users).where(and(...totalCountWhere));
    } else {
      totalCountQuery = db.select({ count: count() }).from(users);
    }

    const [totalCountResult] = await totalCountQuery;
    const totalCount = Number(totalCountResult?.count) || 0;

    // Apply pagination and ordering
    const usersList = await baseQuery.limit(limit).offset(offset).orderBy(desc(users.createdAt));

    return NextResponse.json({
      users: usersList,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch users', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { name, email, password, role, gender } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: {
          name: name ? undefined : 'Name is required',
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required',
          role: role ? undefined : 'Role is required'
        }
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Validate role is a valid user role
    if (!userRoleEnum.enumValues.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate gender if provided
    if (gender && !['male', 'female'].includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role as typeof userRoleEnum.enumValues[number],
      gender: gender as 'male' | 'female' | undefined,
      isEmailVerified: true, // Admin-created users are auto-verified
      sellerPoints: role === 'seller' ? 0 : undefined,
      curatorPoints: role === 'curator' ? 0 : undefined,
    }).returning();

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('[ADMIN_CREATE_USER_API]', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: errorMessage 
    }, { status: 500 });
  }
}