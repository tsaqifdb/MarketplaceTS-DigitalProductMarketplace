import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originalPath = searchParams.get('path');
    const redirectUrl = searchParams.get('redirect');
    
    if (!originalPath || !redirectUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Get session from Better Auth
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userRole = (session.user as any)?.role || 'client';

    // Define role-based routes (same as middleware)
    const roleBasedRoutes = {
      client: [
        '/produk',
        '/produk/detail',
        '/kategori',
        '/orders',
        '/purchases', 
        '/customer-reviews',
        '/keranjang',
        '/payment-gate',
      ],
      seller: [
        '/seller',
        '/seller/produk/daftarkan',
        '/seller/produk/galeri',
        '/seller-analytics',
      ],
      curator: [
        '/curator',
        '/reviews',
        '/product-reviews',
        '/curator-dashboard',
        '/redeemable-products',
        '/penukar-poin',
        '/riwayat-penilaian',
        '/cari-produk',
        '/riwayat-tukar-poin',
      ],
      admin: [
        '/admin',
        '/analytics',
        '/user-management',
        '/system-config',
        '/redeemable-products',
        '/reviews',
        '/produk',
        '/seller',
        '/curator',
        '/penukar-poin',
        '/riwayat-penilaian',
        '/cari-produk',
        '/riwayat-tukar-poin',
      ],
    };

    // Check if user has access to the requested path
    let hasAccess = false;

    // Admin has access to everything
    if (userRole === 'admin') {
      hasAccess = true;
    } else {
      // Check if the path is allowed for the user's role
      const allowedRoutes = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes] || [];
      hasAccess = allowedRoutes.some(route => originalPath.startsWith(route));
    }

    if (!hasAccess) {
      // Redirect to unauthorized page or dashboard based on role
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      unauthorizedUrl.searchParams.set('role', userRole);
      unauthorizedUrl.searchParams.set('path', originalPath);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // If access is allowed, redirect to the original URL
    return NextResponse.redirect(decodeURIComponent(redirectUrl));

  } catch (error) {
    console.error('Role check error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
