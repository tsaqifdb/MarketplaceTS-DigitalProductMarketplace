"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface Product {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  price: string;
  downloads?: number;
  salesCount?: number; // Menambahkan properti untuk jumlah penjualan
  reviewScore?: number;
  contentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  stock: number;
}

export default function GaleriProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Untuk menyimpan semua produk termasuk yang belum approved
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState(''); // Pencarian khusus untuk tabel pengajuan
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Mengambil data dari API dengan filter berdasarkan sellerId
        const response = await fetch(`/api/produk?sellerId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Mengambil data jumlah penjualan dari API sales
        const salesResponse = await fetch(`/api/seller/sales?sellerId=${user.id}&countOnly=true`);
        let salesData = [];
        
        if (salesResponse.ok) {
          salesData = await salesResponse.json();
        }
        
        // Fungsi untuk mendapatkan jumlah penjualan berdasarkan productId
        const getSalesCount = (productId: string) => {
          const productSales = salesData.find((sale: any) => sale.productId === productId);
          return productSales ? productSales.totalSales : 0;
        };
        
        // Simpan semua produk untuk tabel status pengajuan
        const allTransformedProducts = data.products.map((product: any) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          createdAt: new Date(product.createdAt).toLocaleDateString('id-ID'),
          price: `Rp ${parseFloat(product.price).toLocaleString('id-ID')}`,
          downloads: 0, // API perlu tambahan data ini
          salesCount: getSalesCount(product.id), // Menambahkan jumlah penjualan
          reviewScore: product.reviewScore || 0,
          contentUrl: product.contentUrl,
          status: product.status,
          stock: product.stock
        }));
        
        setAllProducts(allTransformedProducts);
        
        // Filter hanya produk yang approved untuk galeri produk
        const transformedProducts = data.products
          .filter((product: any) => product.status === 'approved')
          .map((product: any) => ({
            id: product.id,
            title: product.title,
            category: product.category,
            createdAt: new Date(product.createdAt).toLocaleDateString('id-ID'),
            price: `Rp ${parseFloat(product.price).toLocaleString('id-ID')}`,
            downloads: 0, // API perlu tambahan data ini
            salesCount: getSalesCount(product.id), // Menambahkan jumlah penjualan
            reviewScore: product.reviewScore || 0,
            contentUrl: product.contentUrl,
            status: product.status,
            stock: product.stock
          }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback ke data null jika terjadi error
        setProducts([{
          id: '',
          title: '',
          category: '',
          createdAt: '',
          price: '',
          downloads: 0,
          salesCount: 0,
          reviewScore: 0,
          contentUrl: '',
          status: 'pending',
          stock: 0
        }]);
        setAllProducts([{
          id: '',
          title: '',
          category: '',
          createdAt: '',
          price: '',
          downloads: 0,
          salesCount: 0,
          reviewScore: 0,
          contentUrl: '',
          status: 'pending',
          stock: 0
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [user?.id]);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllProducts = allProducts.filter(product => 
    product.title.toLowerCase().includes(submissionSearchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(submissionSearchQuery.toLowerCase())
  );

  return (
    <RoleGuard requiredRole="seller">
      <Layout showSidebar={true}>
        <div className="p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/seller" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Galeri Produk Disetujui</h1>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Ajuan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Terjual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th> */}
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Stok
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Aksi
                   </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.createdAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.salesCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.reviewScore || 'N/A'}</div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/produk/detail/${product.id}`} className="text-emerald-600 hover:text-emerald-900 text-sm font-medium">
                            Lihat
                          </Link>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/seller/produk/edit/${product.id}`} className="text-emerald-600 hover:text-emerald-900 text-sm font-medium">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                        {searchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk yang disetujui'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {/* <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                <span className="mr-1">Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            </div> */}
          </div>

          {/* Pengajuan Produk Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pengajuan Produk</h2>
            </div>

            <div className="p-6">
              <Link href="/seller/produk/daftarkan">
                <button className="mb-6 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 font-medium">
                  Ajukan Produk Digital
                </button>
              </Link>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pengajuan Produk</h3>
                
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={submissionSearchQuery}
                    onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Ajuan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Review
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating Kurator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Pada tabel status pengajuan, tetap tampilkan semua produk tanpa filter status */}
                      {filteredAllProducts.length > 0 ? (
                        filteredAllProducts.map((product, index) => (
                          <tr key={`submission-${product.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{product.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{product.createdAt}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : product.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {product.status === 'approved' 
                                  ? 'Disetujui' 
                                  : product.status === 'rejected'
                                  ? 'Ditolak'
                                  : 'Menunggu'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {product.reviewScore ? product.createdAt : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{product.reviewScore || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.reviewScore ? (
                                <Link href={`/seller/curator-review?productId=${product.id}`} className="text-emerald-600 hover:text-emerald-900 text-sm font-medium">
                                  Detail
                                </Link>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                            {submissionSearchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk yang diajukan'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* <div className="mt-4 flex justify-end">
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                    <span className="mr-1">Selanjutnya</span>
                    <ChevronRight size={16} />
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
