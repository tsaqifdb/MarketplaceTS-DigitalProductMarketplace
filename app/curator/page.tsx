"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCuratorPoints } from '@/lib/hooks/useCuratorPoints';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface ReviewedProduct {
  id: string;
  productName: string;
  category: string;
  dateReviewed: string;
  poinKeaktifan: number;
  reviewScore: number;
  status: 'Selesai' | 'Pending' | 'Ditolak';
}

export default function CuratorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reviewedProducts, setReviewedProducts] = useState<ReviewedProduct[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { curatorPoints, isLoading: isLoadingPoints, refresh: refreshPoints } = useCuratorPoints(user?.id);

  // Redirect non-curator users
  useEffect(() => {
    if (!isLoading && user && user.role !== 'curator') {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'seller':
          router.push('/seller');
          break;
        case 'client':
          router.push('/dashboard');
          break;
        default:
          router.push('/masuk');
      }
    }
  }, [user, isLoading, router]);

  // Load curator stats and reviewed products
  useEffect(() => {
    const loadCuratorData = async () => {
      try {
        if (!user?.id) return;
        
        // Fetch real data from API
        const response = await fetch(`/api/reviews?curatorId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        console.log('Dashboard: Reviews data received:', data);
        
        // Get product details for each review
        const reviewsWithProducts = await Promise.all(
          data.reviews.map(async (review: any) => {
            try {
              console.log(`Dashboard: Fetching product with ID: ${review.productId}`);
              const productResponse = await fetch(`/api/produk?id=${review.productId}`);
              if (!productResponse.ok) throw new Error('Failed to fetch product');
              
              const productData = await productResponse.json();
              console.log(`Dashboard: Product data received:`, productData);
              const product = productData.products[0];
              
              return {
                id: review.id,
                productName: product?.title || 'Unknown Product',
                category: product?.category || 'Unknown',
                dateReviewed: new Date(review.createdAt).toLocaleDateString('id-ID'),
                poinKeaktifan: review.pointsEarned,
                reviewScore: parseFloat(review.averageScore) || 0,
                status: 'Selesai'
              };
            } catch (err) {
              console.error('Error fetching product:', err);
              // Try to get product info directly from the review if available
              return {
                id: review.id,
                productName: review.productName || review.productTitle || 'Unknown Product',
                category: review.productCategory || 'Unknown',
                dateReviewed: new Date(review.createdAt).toLocaleDateString('id-ID'),
                poinKeaktifan: review.pointsEarned,
                reviewScore: parseFloat(review.averageScore) || 0,
                status: 'Selesai'
              };
            }
          })
        );
        
        setReviewedProducts(reviewsWithProducts);
      } catch (error) {
        console.error('Error loading curator data:', error);
        // Fallback to empty array
        setReviewedProducts([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.role === 'curator') {
      loadCuratorData();
    }
  }, [user]);

  const totalProductsReviewed = reviewedProducts.length;
  // Menggunakan poin dari API real-time, bukan dari kalkulasi lokal
  const totalPoinKeaktifan = curatorPoints;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="curator">
      <Layout showSidebar={true}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Curator</h1>
            <p className="text-gray-600 mt-2">Kelola review produk dan pantau performa kurasi Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Produk Diselesaikan</h3>
                  <p className="text-3xl font-bold text-emerald-600">{totalProductsReviewed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Poin yang Didapatkan</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {isLoadingPoints ? (
                      <span className="inline-block w-12 h-8 bg-blue-100 animate-pulse rounded"></span>
                    ) : (
                      totalPoinKeaktifan
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Review History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Riwayat Penilaian</h2>
              <Link href="/curator/riwayat-penilaian" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                Lihat Semua
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Penyelesaian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher Poin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : reviewedProducts.length > 0 ? (
                    reviewedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.dateReviewed}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">{product.poinKeaktifan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.reviewScore)
                                    ? 'text-yellow-400'
                                    : i === Math.floor(product.reviewScore) && product.reviewScore % 1 !== 0
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-sm text-gray-600">({product.reviewScore.toFixed(1)})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Belum ada produk yang direview
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/curator/cari-produk">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cari Produk</h3>
                    <p className="text-sm text-gray-600">Cari produk untuk direview</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/curator/riwayat-penilaian">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Penilaian</h3>
                    <p className="text-sm text-gray-600">Lihat semua review yang sudah dibuat</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/curator/penukar-poin">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Penukar Poin</h3>
                    <p className="text-sm text-gray-600">Tukar poin dengan produk</p>
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
