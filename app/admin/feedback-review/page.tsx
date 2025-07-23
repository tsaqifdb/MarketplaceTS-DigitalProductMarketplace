"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import { Star, ChevronLeft } from 'lucide-react';

interface ReviewData {
  id: string;
  productId: string;
  productTitle: string;
  productCategory: string;
  curatorId: string;
  curatorName: string;
  question1Score: number; // Originality
  question2Score: number; // Description clarity
  question3Score: number; // Thumbnail quality
  question4Score: number; // Content quality
  question5Score: number; // Information accuracy
  question6Score: number; // Uniqueness
  question7Score: number; // Sales potential
  question8Score: number; // License and instructions
  totalScore: number;
  averageScore: number;
  status: string;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackReviewPage() {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('id');

  useEffect(() => {
    const fetchReviewDetail = async () => {
      if (!reviewId) {
        setError('ID ulasan tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/reviews?id=${reviewId}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data detail ulasan');
        }
        const data = await response.json();
        setReview(data);
      } catch (error) {
        console.error(error);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetail();
  }, [reviewId]);

  const handleBack = () => {
    router.push('/admin/review-produk');
  };

  return (
    <RoleGuard requireRole="admin">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span>Kembali ke Daftar Review</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Detail Review Kurator</h1>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : !review ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500">Data ulasan tidak ditemukan</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{review.productTitle}</h2>
                  <p className="text-gray-600">Kategori: {review.productCategory}</p>
                </div>
                <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                  <span className="text-amber-700 font-medium mr-1">
                    {review.averageScore ? Number(review.averageScore).toFixed(1) : '0.0'}
                  </span>
                  <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detail Penilaian</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{review.curatorName}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  {/* Pertanyaan dan Skor */}
                  <div className="mt-4 mb-6">
                    <h5 className="font-medium text-gray-900 mb-3">Pertanyaan Kurator</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">1. Apakah produk ini original dan tidak melanggar hak cipta?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question1Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">2. Apakah deskripsi produk jelas dan lengkap?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question2Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">3. Apakah thumbnail produk menarik dan representatif?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question3Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">4. Apakah konten produk memiliki kualitas yang baik?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question4Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">5. Apakah informasi yang disampaikan akurat dan relevan?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question5Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">6. Apakah produk memiliki keunikan dibanding produk serupa di pasar?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question6Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">7. Apakah produk memiliki potensi penjualan yang tinggi?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question7Score}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">8. Apakah produk disertai dengan lisensi dan instruksi yang jelas?</p>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                          <span className="text-amber-700 font-medium text-sm">{review.question8Score}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Perhitungan Skor */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Total Skor (Jumlah)</p>
                      <p className="text-sm font-medium">{review.totalScore}</p>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Rata-rata Skor (Total / 8)</p>
                      <p className="text-sm font-medium">
                        {review.averageScore ? Number(review.averageScore).toFixed(2) : '0.00'}/5.00
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <p className="text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.status === 'completed' ? 'Selesai' : 'Pending'}
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">Poin Diperoleh</p>
                      <p className="text-sm font-medium">{review.pointsEarned}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
