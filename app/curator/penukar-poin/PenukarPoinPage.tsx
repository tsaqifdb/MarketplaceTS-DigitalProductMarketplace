"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCuratorPoints } from '@/lib/hooks/useCuratorPoints';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface RedeemableProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsCost: number;
  thumbnailUrl?: string;
  contentUrl?: string;
  stock: number;
  isActive: boolean;
}

interface RedeemedProduct {
  id: string;
  pointsSpent: number;
  createdAt: string;
  redeemableProduct: {
    id: string;
    title: string;
    category: string;
    pointsCost: number;
    thumbnailUrl?: string;
    contentUrl?: string;
  };
}

export default function PenukarPoinPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [availableProducts, setAvailableProducts] = useState<RedeemableProduct[]>([]);
  const [redeemedProducts, setRedeemedProducts] = useState<RedeemedProduct[]>([]);
  const { curatorPoints, isLoading: isLoadingPoints, refresh: refreshPoints } = useCuratorPoints(user?.id);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'my-products'>(tabFromUrl === 'my-products' ? 'my-products' : 'available');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) return;
        
        // Refresh curator points
        refreshPoints();
        
        // Fetch available redeemable products
        const availableProductsResponse = await fetch('/api/redeemable-products?isActive=true');
        if (!availableProductsResponse.ok) {
          throw new Error('Failed to fetch available redeemable products');
        }
        
        const availableProductsData = await availableProductsResponse.json();
        
        // Transform API data to match our interface
        const transformedAvailableProducts: RedeemableProduct[] = availableProductsData.products || [];

        
        setAvailableProducts(transformedAvailableProducts);
        
        // Fetch user's redeemed products
        const redeemedProductsResponse = await fetch(`/api/redeem-products?curatorId=${user.id}`);
        if (!redeemedProductsResponse.ok) {
          throw new Error('Failed to fetch redeemed products');
        }
        
        const redeemedProductsData = await redeemedProductsResponse.json();
        setRedeemedProducts(redeemedProductsData.redeemedProducts || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user]);

  const handleRedeemProduct = async (redeemableProductId: string, pointsCost: number) => {
    if (curatorPoints < pointsCost) {
      alert('Poin Anda tidak mencukupi untuk menukar produk ini');
      return;
    }

    try {
      // Call API to redeem product
      const response = await fetch('/api/redeem-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curatorId: user?.id,
          redeemableProductId: redeemableProductId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to redeem product');
      }

      const result = await response.json();
      
      // Refresh curator points
      refreshPoints();
      
      // Refresh redeemed products data
      const redeemedProductsResponse = await fetch(`/api/redeem-products?curatorId=${user?.id}`);
      if (redeemedProductsResponse.ok) {
        const redeemedProductsData = await redeemedProductsResponse.json();
        setRedeemedProducts(redeemedProductsData.redeemedProducts || []);
        setActiveTab('my-products');
      }
      
      alert('Produk berhasil ditukarkan dengan poin!');
    } catch (error) {
      console.error('Error redeeming product:', error);
      alert(`Gagal menukar produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ebook':
        return (
          <div className="p-3 rounded-full bg-blue-100">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'ecourse':
        return (
          <div className="p-3 rounded-full bg-purple-100">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'resep_masakan':
        return (
          <div className="p-3 rounded-full bg-yellow-100">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'jasa_design':
        return (
          <div className="p-3 rounded-full bg-pink-100">
            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'software':
        return (
          <div className="p-3 rounded-full bg-green-100">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-3 rounded-full bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'ebook': 'E-book',
      'ecourse': 'E-course',
      'resep_masakan': 'Resep Masakan',
      'jasa_design': 'Jasa Design',
      'software': 'Software',
    };
    return categories[category] || category;
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
            <h1 className="text-3xl font-bold text-gray-900">Penukar Poin</h1>
            <p className="text-gray-600 mt-2">Tukarkan poin keaktifan Anda dengan berbagai produk menarik</p>
          </div>

          {/* Points Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">Poin Keaktifan Anda</h3>
                {isLoadingPoints ? (
                  <div className="h-9 w-24 bg-emerald-100 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-emerald-600">{curatorPoints}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Produk Tersedia
              </button>
              <button
                onClick={() => setActiveTab('my-products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-products'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Produk Saya
              </button>
            </nav>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'available' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableProducts.length > 0 ? (
                    availableProducts.map((product) => (
                      <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {product.thumbnailUrl ? (
                          <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${product.thumbnailUrl})` }}></div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-gray-400">Gambar</div>
                              <div className="text-gray-400">Produk</div>
                            </div>
                          </div>
                        )}
                        <div className="p-5 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            {getCategoryIcon(product.category)}
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {getCategoryLabel(product.category)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mt-2">{product.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-center mb-4">
                            {/* <div>
                              <span className="text-sm text-gray-500">Harga Normal</span>
                              <p className="text-lg font-bold text-gray-700">Rp {product.pointsCost * 1000}</p>
                            </div> */}
                            <div>
                              <span className="text-sm text-gray-500">Poin Dibutuhkan</span>
                              <p className="text-lg font-bold text-blue-600">{product.pointsCost}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRedeemProduct(product.id, product.pointsCost)}
                            disabled={curatorPoints < product.pointsCost}
                            className={`w-full py-2 px-4 rounded-md text-center text-white font-medium ${
                              curatorPoints >= product.pointsCost
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {curatorPoints < product.pointsCost
                              ? 'Poin Tidak Cukup'
                              : 'Tukar Poin'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-gray-500">Tidak ada produk yang tersedia saat ini</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'my-products' && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {redeemedProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produk
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kategori
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tanggal Ditukar
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Poin Digunakan
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Akses
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {redeemedProducts.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {item.redeemableProduct.thumbnailUrl ? (
                                    <img 
                                      src={item.redeemableProduct.thumbnailUrl} 
                                      alt={item.redeemableProduct.title} 
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-500">No img</span>
                                    </div>
                                  )}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.redeemableProduct.title}</div>
                                    <div className="text-sm text-gray-500">{item.pointsSpent} poin</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {getCategoryLabel(item.redeemableProduct.category)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-emerald-600 bg-emerald-50 p-1 rounded border border-emerald-200">
                                  {item.pointsSpent} poin
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.redeemableProduct.contentUrl ? (
                                  <a 
                                    href={item.redeemableProduct.contentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                                  >
                                    Akses Produk
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Tidak tersedia</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Anda belum menukarkan poin dengan produk</p>
                      <button
                        onClick={() => setActiveTab('available')}
                        className="mt-4 text-emerald-600 font-medium hover:text-emerald-700"
                      >
                        Tukar Poin Anda
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </RoleGuard>
  );
}