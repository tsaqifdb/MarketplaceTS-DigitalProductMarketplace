"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect } from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const role = searchParams.get('role') || user?.role || 'unknown';
  const attemptedPath = searchParams.get('path') || '';

  // Auto redirect to appropriate dashboard based on role
  useEffect(() => {
    if (user?.role) {
      let redirectPath = '/dashboard'; // default for client
      
      switch (user.role) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'curator':
          redirectPath = '/curator';
          break;
        case 'seller':
          redirectPath = '/seller';
          break;
        case 'client':
        default:
          redirectPath = '/dashboard';
          break;
      }
      
      // Auto redirect after 3 seconds
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'client': return 'Client (Pembeli)';
      case 'seller': return 'Seller (Penjual)';
      case 'curator': return 'Curator';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'curator': return '/curator';
      case 'seller': return '/seller';
      case 'client':
      default: return '/dashboard';
    }
  };

  const getSuggestedPages = (role: string) => {
    switch (role) {
      case 'client':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Cari Produk', path: '/cari-produk' },
          { name: 'Pesanan Saya', path: '/pesanan-saya' },
          { name: 'Keranjang', path: '/keranjang' },
          { name: 'Setelan Akun', path: '/setelan-akun' },
        ];
      case 'seller':
        return [
          { name: 'Dashboard Seller', path: '/seller' },
          { name: 'Kelola Produk', path: '/seller/produk/galeri' },
          { name: 'Daftarkan Produk', path: '/seller/produk/daftarkan' },
          { name: 'Review Produk', path: '/seller/review' },
          { name: 'Akun Seller', path: '/seller/akun' },
        ];
      case 'curator':
        return [
          { name: 'Dashboard Curator', path: '/curator' },
          { name: 'Review Produk', path: '/curator/review-produk' },
          { name: 'Cari Produk', path: '/curator/cari-produk' },
          { name: 'Riwayat Penilaian', path: '/curator/riwayat-penilaian' },
          { name: 'Akun Curator', path: '/curator/akun' },
        ];
      case 'admin':
        return [
          { name: 'Dashboard Admin', path: '/admin' },
          { name: 'User Management', path: '/user-management' },
          { name: 'System Analytics', path: '/analytics' },
          { name: 'Kelola Voucher', path: '/vouchers' },
          { name: 'Kelola Review', path: '/reviews' },
        ];
      default:
        return [{ name: 'Dashboard', path: '/dashboard' }];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Content */}
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Akses Tidak Diizinkan
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Anda tidak memiliki akses ke halaman ini.
            </p>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Role Anda: <span className="font-semibold">{getRoleDisplay(role)}</span></p>
              {attemptedPath && (
                <p className="mt-1">Halaman yang dicoba: <span className="font-mono text-xs bg-gray-100 px-1 rounded">{attemptedPath}</span></p>
              )}
            </div>

            {/* Auto redirect notification */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Anda akan diarahkan ke dashboard dalam 3 detik...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Kembali ke Halaman Sebelumnya
              </button>
              
              <Link
                href={getDashboardPath(role)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Ke Dashboard Saya
              </Link>
            </div>

            {/* Suggested Pages */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Halaman yang Tersedia untuk Role Anda:
              </h4>
              <div className="space-y-2">
                {getSuggestedPages(role).map((page) => (
                  <Link
                    key={page.path}
                    href={page.path}
                    className="block w-full text-left px-3 py-2 text-sm text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
