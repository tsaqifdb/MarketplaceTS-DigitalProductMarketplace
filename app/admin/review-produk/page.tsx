"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import { Star, ChevronRight, Search } from 'lucide-react';

interface ReviewData {
  id: string;
  productId: string;
  productTitle: string;
  productCategory: string;
  curatorId: string;
  curatorName: string;
  totalScore: number;
  averageScore: number;
  status: string;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewProdukPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/reviews');
        if (!response.ok) {
          throw new Error('Gagal mengambil data ulasan');
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error(error);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleViewDetail = (reviewId: string) => {
    router.push(`/admin/feedback-review?id=${reviewId}`);
  };

  const filteredReviews = reviews.filter(review =>
    review.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.curatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard requireRole="admin">
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Produk</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
                placeholder="Cari berdasarkan nama produk atau kurator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Ulasan Produk</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Produk</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Kategori</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Kurator</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Skor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((review) => (
                        <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{review.productTitle}</td>
                          <td className="py-3 px-4 text-gray-600">{review.productCategory}</td>
                          <td className="py-3 px-4 text-gray-600">{review.curatorName}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-amber-500 font-medium mr-1">
                                {review.averageScore ? Number(review.averageScore).toFixed(1) : '0.0'}
                              </span>
                              <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleViewDetail(review.id)}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 transition-colors"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          {searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian' : 'Tidak ada data ulasan'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {!loading && !error && filteredReviews.length > 0 && (
              <div className="flex justify-end mt-4">
                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                  <span className="mr-1">Selanjutnya</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}