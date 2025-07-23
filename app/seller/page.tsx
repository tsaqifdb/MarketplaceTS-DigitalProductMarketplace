"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface SellerStats {
  productsSold: number;
  totalRevenue: number;
  sellerRating: number;
  productReviews: number;
  totalProducts: number;
  activenessPoints: number;
  totalReviews: number;
}

interface SalesHistory {
  id: string;
  productId: string;
  productName: string;
  category: string;
  date: string;
  amount: number;
  status: 'Selesai' | 'Pending' | 'Dibatalkan';
}

// Use our shared ProductSubmission type from lib/types
import { 
  ProductSubmissionStatus, 
  getStatusDisplayText, 
  getStatusColorClass 
} from '@/lib/types/product-submission';

interface DashboardProductSubmission {
  id: string;
  productName: string;
  category: string;
  submissionDate: string;
  status: ProductSubmissionStatus;
  approvalDate: string | null;
  curatorRating: number | null;
  hasReview: boolean;
}

export default function SellerPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [salesHistory, setSalesHistory] = useState<SalesHistory[]>([]);
  const [productSubmissions, setProductSubmissions] = useState<DashboardProductSubmission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-seller users
  useEffect(() => {
    if (!isLoading && user && user.role !== 'seller') {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'curator':
          router.push('/curator');
          break;
        case 'client':
          router.push('/dashboard');
          break;
        default:
          router.push('/masuk');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadSellerData = async () => {
      if (!user?.id) return;
      
      setIsLoadingData(true);
      setError(null);
      
      try {
        // Load seller stats
        const statsResponse = await fetch(`/api/seller/stats?sellerId=${user.id}`);
        if (!statsResponse.ok) throw new Error('Failed to load seller stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Load sales history
        const salesResponse = await fetch(`/api/seller/sales?sellerId=${user.id}`);
        if (!salesResponse.ok) throw new Error('Failed to load sales history');
        const salesData = await salesResponse.json();
        setSalesHistory(salesData);
        
        // Load product submissions for this seller
        const submissionsResponse = await fetch(`/api/seller/product-submissions?sellerId=${user.id}`);
        if (!submissionsResponse.ok) throw new Error('Failed to load product submissions');
        const submissionsData = await submissionsResponse.json();
        setProductSubmissions(submissionsData);
      } catch (err) {
        console.error('Error loading seller data:', err);
        setError('Failed to load data. Please try again later.');

        // Fallback to null data if API calls fail
        setStats({
          productsSold: 0,
          totalRevenue: 0,
          sellerRating: 0,
          productReviews: 0,
          totalProducts: 0,
          activenessPoints: 0,
          totalReviews: 0
        });
        
        setSalesHistory([]);
        
        // Fallback data to null for product submissions
        // If the API fails, we can show an empty state
        setProductSubmissions([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.role === 'seller') {
      loadSellerData();
    }
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <Layout showSidebar={true}>
        <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-white">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Dashboard Seller</h1>
            <p className="text-emerald-600 mt-2">Selamat datang kembali, {user?.name}!</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Produk Terjual</h3>
                  <p className="text-3xl font-bold text-emerald-600">{stats?.productsSold.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Penjualan</h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats ? formatCurrency(stats.totalRevenue) : 'Rp0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rating Seller</h3>
                  <p className="text-3xl font-bold text-emerald-600">{stats?.sellerRating || '0'}/5</p>
                  <p className="text-sm text-gray-500">Poin Keaktifan: {stats?.activenessPoints || '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ulasan Produk</h3>
                  <p className="text-3xl font-bold text-emerald-600">{stats?.totalReviews || '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History Penjualan */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 mb-8 hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-emerald-800">History Penjualan</h2>
              {/* <Link href="/seller/produk/riwayat" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200">
                <span className="mr-1">Lihat Semua</span>
                <ChevronRight size={16} />
              </Link> */}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Total Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-50">
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : salesHistory.length > 0 ? (
                    salesHistory.map((sale, index) => (
                      <tr key={sale.id} className="hover:bg-emerald-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{index + 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sale.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{sale.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{sale.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">1</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{formatCurrency(sale.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Belum ada riwayat penjualan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Pengajuan Produk */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 mb-8 hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-emerald-800">Status Pengajuan Produk</h2>
              <Link href="/seller/produk/pengajuan" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200">
                <span className="mr-1">Lihat Semua</span>
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Tanggal Diajukan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Tanggal Disetujui
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Rating Kurator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Review
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-50">
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : productSubmissions.length > 0 ? (
                    productSubmissions.map((product, index) => (
                      <tr key={product.id} className="hover:bg-emerald-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{index + 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.submissionDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(product.status)}`}>
                            {getStatusDisplayText(product.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.approvalDate || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.curatorRating || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.hasReview ? (
                            <Link href={`/seller/curator-review?id=${product.id}&sellerId=${user?.id}`} className="text-emerald-600 hover:text-emerald-800">
                              Lihat
                            </Link>
                          ) : (
                            <span className="text-gray-400">Belum tersedia</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Belum ada pengajuan produk
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/seller/produk/daftarkan">
              <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group hover:bg-emerald-50/50">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-200">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Daftarkan Produk</h3>
                    <p className="text-sm text-emerald-600">Tambah produk baru</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/seller/produk/galeri">
              <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group hover:bg-emerald-50/50">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-200">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Galeri Produk</h3>
                    <p className="text-sm text-emerald-600">Kelola produk Anda</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/seller/review">
              <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group hover:bg-emerald-50/50">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-200">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Feedback Review</h3>
                    <p className="text-sm text-emerald-600">Lihat ulasan produk</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
