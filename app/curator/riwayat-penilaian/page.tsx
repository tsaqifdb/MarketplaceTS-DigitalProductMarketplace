"use client";

import { useState, useEffect } from 'react';
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
  seller: string;
  reviewNotes?: string;
}

export default function RiwayatPenilaianPage() {
  const { user } = useAuth();
  const [reviewedProducts, setReviewedProducts] = useState<ReviewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const { curatorPoints, isLoading: isLoadingPoints, refresh: refreshPoints } = useCuratorPoints(user?.id);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const loadReviewHistory = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) return;
        
        // Fetch real data from API
        const response = await fetch(`/api/reviews?curatorId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        console.log('Reviews data received:', data);
        
        // Refresh curator points when reviews are loaded
        refreshPoints();
        
        // Get product details for each review
        const reviewsWithProducts = await Promise.all(
          data.reviews.map(async (review: any) => {
            try {
              console.log(`Fetching product with ID: ${review.productId}`);
              const productResponse = await fetch(`/api/produk?id=${review.productId}`);
              if (!productResponse.ok) throw new Error('Failed to fetch product');
              
              const productData = await productResponse.json();
              console.log(`Product data received:`, productData);
              const product = productData.products[0];
              
              // Get seller details
              let sellerName = 'Unknown Seller';
              if (product?.sellerId) {
                try {
                  const sellerResponse = await fetch(`/api/auth/session?userId=${product.sellerId}`);
                  if (sellerResponse.ok) {
                    const sellerData = await sellerResponse.json();
                    sellerName = sellerData.user?.name || 'Unknown Seller';
                  }
                } catch (sellerErr) {
                  console.error('Error fetching seller:', sellerErr);
                }
              }
              
              return {
                id: review.id,
                productName: product?.title || 'Unknown Product',
                category: product?.category || 'Unknown',
                dateReviewed: new Date(review.createdAt).toLocaleDateString('id-ID'),
                poinKeaktifan: review.pointsEarned,
                reviewScore: parseFloat(review.averageScore) || 0,
                status: product?.status === 'approved' ? 'Disetujui' : (product?.status === 'rejected' ? 'Ditolak' : 'Selesai'),
                seller: sellerName,
                reviewNotes: review.comments,
                productId: review.productId
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
                status: 'Selesai',
                seller: 'Unknown',
                reviewNotes: review.comments,
                productId: review.productId
              };
            }
          })
        );
        
        setReviewedProducts(reviewsWithProducts);
      } catch (error) {
        console.error('Error loading review history:', error);
        // Fallback to empty array
        setReviewedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'curator') {
      loadReviewHistory();
    }
  }, [user, currentPage, filterStatus]);

  const filteredProducts = reviewedProducts.filter(product => {
    return filterStatus === 'all' || product.status === filterStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 !== 0;
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? 'text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({score})</span>
      </div>
    );
  };

  return (
    <RoleGuard requiredRole="curator">
      <Layout showSidebar={true}>
        <div className="p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/curator" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Riwayat Penilaian</h1>
                <p className="text-gray-600 mt-2">Lihat semua produk yang telah Anda review</p>
              </div>
              <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Total Poin Keaktifan</p>
                    <p className="text-xl font-bold text-blue-600">
                      {isLoadingPoints ? (
                        <span className="inline-block w-12 h-6 bg-blue-100 animate-pulse rounded"></span>
                      ) : (
                        curatorPoints
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center">
              <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">Filter:</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Semua Status</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penjual
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : reviewedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        Belum ada produk yang direview
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.seller}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.dateReviewed}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">{product.poinKeaktifan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(product.reviewScore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            className="text-emerald-600 hover:text-emerald-900 font-medium"
                            onClick={() => {
                              // Tampilkan detail review
                              const status = product.status === 'Selesai' ? 'disetujui' : 'ditolak';
                              const message = `Status: ${product.status}\n\nNilai: ${product.reviewScore.toFixed(2)} dari 5.0\n\nCatatan: ${product.reviewNotes || 'Tidak ada catatan'}\n\nProduk ini telah ${status} dan ${status === 'disetujui' ? 'dapat' : 'tidak dapat'} dilihat oleh pengguna.`;
                              alert(message);
                            }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredProducts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      } relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`${
                          currentPage === i + 1
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      } relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </RoleGuard>
  );
}
