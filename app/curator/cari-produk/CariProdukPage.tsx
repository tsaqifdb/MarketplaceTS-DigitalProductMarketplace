"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface PendingProduct {
  id: string;
  title: string;
  category: string;
  seller: {
    id: string;
    name: string;
  };
  createdAt: Date;
  thumbnailUrl?: string;
}

export default function CariProdukPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl || 'all');

  useEffect(() => {
    // Update filter when URL parameter changes
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch products with status pending from API
        const response = await fetch(`/api/produk?status=pending`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('Pending products data:', data);
        
        // Process products and get seller information
        const productsWithSellers = await Promise.all(
          data.products.map(async (product: any) => {
            let sellerName = 'Unknown Seller';
            
            if (product.sellerId) {
              try {
                const sellerResponse = await fetch(`/api/auth/session?userId=${product.sellerId}`);
                if (sellerResponse.ok) {
                  const sellerData = await sellerResponse.json();
                  if (sellerData.user) {
                    sellerName = sellerData.user.name;
                  }
                }
              } catch (err) {
                console.error('Error fetching seller:', err);
              }
            }
            
            return {
              id: product.id,
              title: product.title,
              category: product.category,
              seller: {
                id: product.sellerId,
                name: sellerName
              },
              createdAt: new Date(product.createdAt),
              thumbnailUrl: product.thumbnailUrl
            };
          })
        );
        
        setProducts(productsWithSellers);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const handleReviewProduct = (productId: string) => {
    router.push(`/curator/review-produk/${productId}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.trim() === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'ebook': 'E-book',
      'ecourse': 'E-course',
      'resep_masakan': 'Resep Masakan',
      'jasa_design': 'Jasa Design',
      'software': 'Software',
      'other': 'Lainnya'
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

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Cari Produk</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk atau seller..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="w-full md:w-1/4">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="ebook">E-book</option>
                <option value="ecourse">E-course</option>
                <option value="resep_masakan">Resep Masakan</option>
                <option value="jasa_design">Jasa Design</option>
                <option value="software">Software</option>
              </select>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="bg-gray-300 h-40 w-full"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {product.thumbnailUrl ? (
                    <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${product.thumbnailUrl})` }}></div>
                  ) : (
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400">Gambar</div>
                        <div className="text-gray-400">Produk</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">oleh {product.seller.name}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{getCategoryLabel(product.category)}</span>
                      <span className="text-xs text-gray-500">{product.createdAt.toLocaleDateString('id-ID')}</span>
                    </div>
                    
                    <button
                      onClick={() => handleReviewProduct(product.id)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Review Produk
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada produk ditemukan</h3>
                <p className="text-gray-500">Tidak ada produk yang menunggu untuk di-review saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
