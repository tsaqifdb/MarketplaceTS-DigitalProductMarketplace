"use client";

import { ChevronRight } from 'lucide-react';
import Layout from '../../../components/Layout';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoleGuard from '@/components/guards/RoleGuard';

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

export default function RiwayatPenilaianPage() {
  const [assessmentHistory, setAssessmentHistory] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/reviews');
        if (!response.ok) {
          throw new Error('Gagal mengambil data riwayat penilaian');
        }
        const data = await response.json();
        setAssessmentHistory(data);
      } catch (error) {
        console.error(error);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <RoleGuard requireRole="admin">
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Penilaian</h1>

          {/* Assessment History Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Penilaian</h2>
            
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
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal Pengajuan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Voucher Poin</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Skor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentHistory.length > 0 ? (
                      assessmentHistory.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{item.productTitle}</td>
                          <td className="py-3 px-4 text-gray-600">{item.productCategory}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.pointsEarned}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.averageScore ? Number(item.averageScore).toFixed(1) : '0.0'}/5.0
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status === 'completed' ? 'Selesai' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          Tidak ada data riwayat penilaian
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          
            {!loading && !error && assessmentHistory.length > 0 && (
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
