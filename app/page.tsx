'use client';

import React, { useState, useEffect } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { getApprovedProducts, formatPrice, type Product } from '@/lib/services/products';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await getApprovedProducts();
        // Get first 3 products as featured
        setFeaturedProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const getProductThumbnail = (product: Product) => {
    const defaultThumbnails: Record<string, string> = {
      'ebook': '📚',
      'course': '🎓',
      'template': '🎨',
      'software': '💻',
      'audio': '🎵',
      'video': '🎬',
      'graphic': '🖼️',
      'other': '📦'
    };
    
    return defaultThumbnails[product.category] || '📦';
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <ResponsiveNavbar currentPage="home" logo="MarketplaceTS" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Marketplace Produk Digital
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            "Temukan berbagai produk digital berkualitas dari seller terpercaya dengan kurasi terbaik untuk memenuhi kebutuhan digital Anda."
          </p>
        </div>

        {/* Featured Products Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
            Produk Pilihan
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/70 backdrop-blur-sm rounded-3xl h-64 flex items-center justify-center border border-white/30 shadow-lg animate-pulse">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <div className="text-xs text-slate-500 text-center">
                        Oleh: {product.seller.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/70 backdrop-blur-sm rounded-3xl h-64 flex items-center justify-center border border-white/30 shadow-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <span className="text-slate-600 font-medium">Produk Segera Hadir</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mb-16 space-y-4">
          <Link 
            href="/produk" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 mr-4"
          >
            Mulai Cari Produk →
          </Link>
          
          {/*          <div className="flex justify-center gap-4 mt-6">
            <Link 
              href="/masuk" 
              className="inline-flex items-center px-6 py-3 bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Login
            </Link>
            <Link 
              href="/daftar" 
              className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Daftar Sekarang
            </Link>
          </div>*/}
        </div>

        {/* Categories Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl py-16 border border-white/30 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Buku Digital', icon: '📚' },
              { name: 'E-Course', icon: '💻' },
              { name: 'Design Template', icon: '🎨' }
            ].map((category) => (
              <div key={category.name} className="text-center group cursor-pointer">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300 shadow-lg">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors duration-300">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
