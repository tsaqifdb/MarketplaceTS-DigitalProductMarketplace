"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface CuratorReview {
  id: string;
  productId: string;
  productName: string;
  category: string;
  status: 'Disetujui' | 'Ditolak';
  submittedDate: string;
  approvedOrRejectedDate: string;
  rating: number;
  curatorName: string;
  curatorId: string;
  review: string;
  reviewDate: string;
}

export default function CuratorReviewPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const sellerId = searchParams.get('sellerId') || user?.id;
  
  const [review, setReview] = useState<CuratorReview | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadReview = async () => {
      if (!sellerId || !productId) return;
      
      setIsLoadingData(true);
      setError(null);
      
      try {
        // Load review data for specific product
        const response = await fetch(`/api/seller/product-submissions?productId=${productId}&sellerId=${sellerId}`);
        if (!response.ok) throw new Error('Failed to load product review');
        const data = await response.json();
        setReview(data);
      } catch (err) {
        console.error('Error loading review data:', err);
        setError('Failed to load review data. Please try again later.');
        
        // Fallback null data if API call fails
        setReview({
          id: '',
          productId: '',
          productName: '',
          category: '',
          status: 'Ditolak',
          submittedDate: '',
          approvedOrRejectedDate: '',
          rating: 0,
          curatorName: 'Kurator tidak diketahui',
          curatorId: '',
          review: 'Tidak ada ulasan tersedia.',
          reviewDate: ''
        } as CuratorReview);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.role === 'seller') {
      loadReview();
    }
  }, [user, productId]);

  const getStatusColor = (status: string) => {
    return status === 'Disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (isLoading || isLoadingData) {
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
          {/* Header with back button */}
          <div className="mb-8">
            <Link href="/seller/produk/pengajuan" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">
              <ArrowLeft size={16} className="mr-1" />
              <span>Kembali ke Status Pengajuan</span>
            </Link>
            <h1 className="text-3xl font-bold text-emerald-800">Feedback Review</h1>
            <p className="text-emerald-600 mt-2">Detail ulasan kurator untuk produk Anda</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {review && (
            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 mb-8 overflow-hidden">
              {/* Product Info Header */}
              <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-xs uppercase text-emerald-700 font-medium">Nama Produk</h3>
                    <p className="text-base font-semibold">{review.productName}</p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-emerald-700 font-medium">Kategori</h3>
                    <p className="text-base">{review.category}</p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-emerald-700 font-medium">Status</h3>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-emerald-700 font-medium">Rating</h3>
                    <div className="flex items-center">
                      <span className="text-base font-bold">{review.rating}</span>
                      <div className="ml-2 flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-emerald-800">Ulasan Kurator</h3>
                    <span className="text-sm text-gray-500">Diulas pada {review.reviewDate}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-line">{review.review}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-emerald-800">Detail Penilaian</h3>
                    <span className="text-sm text-gray-500">Oleh {review.curatorName}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-medium mb-2 text-emerald-700">Tanggal Diajukan</h4>
                      <p>{review.submittedDate}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-medium mb-2 text-emerald-700">Tanggal Disetujui/Ditolak</h4>
                      <p>{review.approvedOrRejectedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {review.status === 'Ditolak' && (
                  <div className="mt-8 flex justify-center">
                    <Link href="/seller/produk/daftarkan">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg transition-colors">
                        Ajukan Revisi Produk
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </RoleGuard>
  );
}
