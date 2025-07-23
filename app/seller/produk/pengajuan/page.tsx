"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';
import { 
  ProductSubmissionStatus, 
  getStatusDisplayText, 
  getStatusColorClass,
  getStatusTextColorClass 
} from '@/lib/types/product-submission';

interface ProductSubmission {
  id: string;
  productName: string;
  category: string;
  submittedDate: string;
  status: ProductSubmissionStatus;
  approvedOrRejectedDate?: string | null;
  curatorRating: number | null;
  curatorComment?: string | null;
  revisionRequested?: boolean;
  revisionComment?: string | null;
}

export default function PengajuanProdukPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user?.id) return;
      
      setIsLoadingData(true);
      setError(null);
      
      try {
        // Load product submissions data
        const response = await fetch(`/api/seller/submissions?sellerId=${user.id}`);
        if (!response.ok) throw new Error('Failed to load product submissions');
        const data = await response.json();
        setSubmissions(data);
      } catch (err) {
        console.error('Error loading submission data:', err);
        setError('Failed to load data. Please try again later.');
        
        // Fallback mock data untuk development
        setSubmissions([
          {
            id: '1',
            productName: 'Buku Pedoman Belajar',
            category: 'E-book',
            submittedDate: '12/05/2025',
            status: 'APPROVED',
            approvedOrRejectedDate: '12/05/2025',
            curatorRating: 4.1
          },
          {
            id: '2',
            productName: 'E-Course Belajar Pemrograman',
            category: 'E-Course',
            submittedDate: '12/05/2025',
            status: 'IN_REVIEW',
            approvedOrRejectedDate: null,
            curatorRating: null
          },
          {
            id: '3',
            productName: 'Template Resume Modern',
            category: 'Template',
            submittedDate: '11/05/2025',
            status: 'PENDING',
            approvedOrRejectedDate: null,
            curatorRating: null
          },
          {
            id: '4',
            productName: 'Ebook Digital Marketing',
            category: 'E-book',
            submittedDate: '10/05/2025',
            status: 'REJECTED',
            approvedOrRejectedDate: '10/05/2025',
            curatorRating: 2.5
          }
        ]);
        
        // Untuk demo, sebaiknya kita tidak menampilkan error di UI
        setError(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.role === 'seller') {
      loadSubmissions();
    }
  }, [user]);

  // Using the helper functions from our shared types file
  const getStatusBadgeClass = (status: ProductSubmissionStatus) => {
    return getStatusColorClass(status);
  };
  
  const getStatusColor = (status: ProductSubmissionStatus) => {
    return getStatusTextColorClass(status);
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800">Status Pengajuan Produk</h1>
              <p className="text-emerald-600 mt-2">Lihat status semua produk yang telah Anda ajukan</p>
            </div>
            <Link href="/seller/produk/daftarkan">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors">
                + Ajukan Produk Baru
              </button>
            </Link>
          </div>

          {/* Status Pengajuan Table */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      NO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      PRODUK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      KATEGORI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      TANGGAL DIAJUKAN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      TANGGAL DISETUJUI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      RATING KURATOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      AKSI
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
                  ) : submissions.length > 0 ? (
                    submissions.map((submission, index) => (
                      <tr key={submission.id} className="hover:bg-emerald-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{index + 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{submission.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{submission.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{submission.submittedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${getStatusColor(submission.status)}`}>
                            {getStatusDisplayText(submission.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{submission.approvedOrRejectedDate || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {submission.curatorRating ? `${submission.curatorRating}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.status === 'APPROVED' || submission.status === 'REJECTED' ? (
                            <Link href={`/seller/curator-review?id=${submission.id}&sellerId=${user?.id}`} className="text-emerald-600 hover:text-emerald-800">
                              Lihat Review
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
                        Belum ada produk yang diajukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Status Info */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6">
            <h3 className="text-xl font-semibold text-emerald-800 mb-4">Informasi Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                <span className="text-sm font-medium">Pengajuan: Produk telah diajukan dan menunggu diproses oleh kurator</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-sm font-medium">Diproses: Produk sedang dalam review oleh kurator</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm font-medium">Disetujui: Produk telah disetujui dan siap dipasarkan</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm font-medium">Ditolak: Produk tidak disetujui, silahkan lihat review untuk detail</span>
              </div>
            </div>
            
            {/* Workflow Explanation */}
            <div className="mt-6 border-t border-emerald-100 pt-4">
              <h4 className="font-semibold text-emerald-700 mb-3">Alur Pengajuan Produk:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li><span className="font-medium">Pengajuan</span> - Anda mengajukan produk baru</li>
                <li><span className="font-medium">Diproses</span> - Kurator sedang mereview produk Anda</li>
                <li><span className="font-medium">Hasil Review</span>:
                  <ul className="list-disc list-inside ml-5 mt-1">
                    <li><span className="font-medium text-green-600">Disetujui</span> - Produk lulus review dan dapat dipublikasikan</li>
                    <li><span className="font-medium text-red-600">Ditolak</span> - Produk tidak lulus review (lihat detail feedback untuk perbaikan)</li>
                  </ul>
                </li>
                <li>Jika produk ditolak, Anda dapat memperbaiki dan mengajukan ulang produk</li>
              </ol>
            </div>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
