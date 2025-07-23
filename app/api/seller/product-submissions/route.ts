import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ProductSubmissionStatus } from '@/lib/types/product-submission';
import { getProductSubmissions } from '@/lib/services/product-submissions';

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

    // Get query params
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const productId = searchParams.get('productId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Check authorization - make sure the logged-in user is only getting their own data
    // or is an admin/curator
    if (session.user.role !== 'admin' && session.user.role !== 'curator' && session.user.id !== sellerId) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Cannot access other sellers\' data' }),
        { status: 403 }
      );
    }

    // Use our service to get submissions
    const submissions = await getProductSubmissions({
      sellerId: sellerId || session.user.id,
      productId: productId || undefined,
      limit
    });

    // If productId is provided, return the first item only (for curator-review page)
    if (productId && submissions.length > 0) {
      return NextResponse.json(submissions[0]);
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching product submissions:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch product submissions' }),
      { status: 500 }
    );
  }
}
