import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { ProductSubmission, ProductSubmissionStatus } from '@/lib/types/product-submission';
import { getProductSubmissions } from '@/lib/services/product-submissions';
import { products } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Login required' }),
        { status: 401 }
      );
    }

    // Get sellerId from query params
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const productId = searchParams.get('productId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Check authorization - make sure the logged-in user is only getting their own data
    // or is an admin/curator who can view all submissions
    if (session.user.role !== 'admin' && session.user.role !== 'curator' && session.user.id !== sellerId) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Cannot access other sellers\' data' }),
        { status: 403 }
      );
    }

    // Use the same service as product-submissions API to get real data from the database
    const submissions = await getProductSubmissions({
      sellerId: sellerId || session.user.id,
      productId: productId || undefined,
      limit
    });

    // If productId is provided, return the first item only
    if (productId && submissions.length > 0) {
      return NextResponse.json(submissions[0]);
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Server error: Failed to fetch submissions' }),
      { status: 500 }
    );
  }
}

// Add a product submission
export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Login required' }),
        { status: 401 }
      );
    }

    // Only sellers can submit products
    if (session.user.role !== 'seller') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Only sellers can submit products' }),
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    if (!body.productName || !body.category || !body.description || !body.price) {
      return new NextResponse(
        JSON.stringify({ error: 'Bad request: Missing required fields' }),
        { status: 400 }
      );
    }

    // Insert the new product into the database
    const [newProduct] = await db.insert(products).values({
      sellerId: session.user.id,
      title: body.productName,
      description: body.description,
      category: body.category,
      price: body.price,
      thumbnailUrl: body.thumbnailUrl || null,
      contentUrl: body.contentUrl || null,
      status: 'pending',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    if (!newProduct) {
      throw new Error('Failed to create product submission');
    }

    // Format the response to match the expected format
    const formattedSubmission = {
      id: newProduct.id,
      productId: newProduct.id,
      productName: newProduct.title,
      sellerId: newProduct.sellerId,
      sellerName: session.user.name || 'Unknown',
      category: newProduct.category,
      submittedDate: newProduct.createdAt ? new Date(newProduct.createdAt).toLocaleDateString('id-ID') : '-',
      status: 'PENDING' as ProductSubmissionStatus,
      isPublished: newProduct.isActive
    };

    return NextResponse.json(
      { 
        message: 'Product submission created successfully',
        submission: formattedSubmission
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product submission:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Server error: Failed to create product submission' }),
      { status: 500 }
    );
  }
}
