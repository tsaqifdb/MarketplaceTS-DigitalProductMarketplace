import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Define public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/masuk',
    '/daftar',
    '/verify-email',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/api/auth/sign-in',
    '/api/auth/sign-up',
    '/api/auth/verify-email',
    '/api/auth/error',
    '/api/auth/callback',
  ];

  // Define role-based protected routes
  const roleBasedRoutes = {
    client: [
      '/dashboard',
      '/profile',
      '/produk',
      '/produk/detail',
      '/kategori',
      '/pesanan-saya',
      '/customer-reviews',
      '/keranjang',
      '/setelan-akun',
      '/payment-gate',
      '/cari-produk',
      '/galeri-produk-saya',
    ],
    seller: [
      '/dashboard',
      '/profile',
      '/seller',
      '/seller/dashboard',
      '/seller/produk/daftarkan',
      '/seller/produk/galeri',
      '/seller/produk/buat',
      '/seller/produk/daftarkan/buat',
      '/seller/akun',
      '/seller/review',
      '/seller-analytics',
    ],
    curator: [
      '/dashboard',
      '/profile',
      '/curator',
      '/curator/review-produk',
      '/curator/cari-produk',
      '/curator/riwayat-penilaian',
      '/curator/penukar-poin',
      '/curator/akun',
    ],
    admin: [
      '/dashboard',
      '/profile',
      '/admin',
      '/admin/dashboard',
      '/analytics',
      '/user-management',
      '/system-config',
      '/redeemable-products',
      '/reviews',
      '/produk',
      '/seller',
      '/curator',
    ],
  };

  // Define routes that require authentication but are accessible to all roles
  const generalProtectedRoutes = [
    '/dashboard',
    '/profile',
  ];

  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if accessing protected routes
  const allProtectedRoutes = [
    ...generalProtectedRoutes,
    ...Object.values(roleBasedRoutes).flat(),
  ];
  
  const isProtectedRoute = allProtectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Check for NextAuth session cookie
    const sessionCookie = request.cookies.get('next-auth.session-token') || 
                          request.cookies.get('__Secure-next-auth.session-token') ||
                          request.cookies.get('session');
    
    if (!sessionCookie) {
      // Redirect to login if no session found
      return NextResponse.redirect(new URL('/masuk', request.url));
    }

    // For role-specific routes (non-general routes), add a header to trigger role checking on the page
    const isGeneralRoute = generalProtectedRoutes.some(route => pathname.startsWith(route));
    
    if (!isGeneralRoute) {
      // Let the request continue but add a flag for client-side role checking
      const response = NextResponse.next();
      response.headers.set('x-role-check-required', 'true');
      response.headers.set('x-requested-path', pathname);
      return response;
    }
  }

  // For API routes, add CORS headers
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
