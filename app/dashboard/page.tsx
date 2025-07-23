"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';
import { getApprovedProducts, formatPrice, type Product } from '@/lib/services/products';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Redirect based on role
  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'curator':
          router.push('/curator');
          break;
        case 'seller':
          router.push('/seller');
          break;
        case 'client':
          // Stay on this page - this is the client dashboard
          break;
        default:
          router.push('/masuk');
      }
    }
  }, [user, isLoading, router]);

  // Load featured products
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await getApprovedProducts();
        // Get first 6 products as featured
        setFeaturedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const getProductThumbnail = (product: Product) => {
    const defaultThumbnails: Record<string, string> = {
      'ebook': '📚',
      'ecourse': '🎓',
      'resep_masakan': '🍳',
      'jasa_design': '🎨',
      'software': '💻',
      'other': '📦'
    };
    
    return defaultThumbnails[product.category] || '📦';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="client">
      <Layout showSidebar={true}>
        <div className="p-6">
          {/* Greeting Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Selamat Datang di MarketplaceTS
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Halo <span className="font-semibold text-emerald-600">{user?.name}</span>! 
              Temukan berbagai produk digital berkualitas dari seller terpercaya untuk memenuhi kebutuhan digital Anda.
            </p>
          </div>

          {/* Featured Products Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Produk Pilihan Untuk Anda
              </h2>
              <Link 
                href="/produk"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Lihat Semua Produk →
              </Link>
            </div>
            
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white/70 backdrop-blur-sm rounded-3xl h-64 border border-white/30 shadow-lg animate-pulse">
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/produk/detail?id=${product.id}`}>
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl h-64 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                      <div className="p-6 h-full flex flex-col">
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                              {getProductThumbnail(product)}
                            </div>
                          )}
                          <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-lg font-bold text-emerald-600 mb-2">
                            {formatPrice(product.price)}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500 text-center mt-2">
                          Oleh: {product.seller.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white/70 backdrop-blur-sm rounded-3xl h-64 border border-white/30 shadow-lg">
                    <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-4">📦</div>
                      <span className="text-slate-600 font-medium">Produk Segera Hadir</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions CTA */}
          <div className="text-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl py-12 px-6 border border-emerald-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Mulai Jelajahi Produk Digital
            </h3>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Ribuan produk digital menanti Anda. Dari e-book, kursus online, hingga template design profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/produk"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Jelajahi Semua Produk
              </Link>
              <Link 
                href="/kategori"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-2xl text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Telusuri Kategori
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
