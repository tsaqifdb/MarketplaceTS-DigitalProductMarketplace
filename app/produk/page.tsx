"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import RoleGuard from '../../components/RoleGuard';
import { getApprovedProducts, formatPrice, type Product } from '@/lib/services/products';

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'ecourse', label: 'E-Course' },
    { value: 'resep_masakan', label: 'Resep Masakan' },
    { value: 'jasa_design', label: 'Jasa Design' },
    { value: 'software', label: 'Software' },
  ];

  useEffect(() => {
    loadProducts();
    
    // Set category from URL query parameter if available
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const productData = await getApprovedProducts();
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getProductThumbnail = (product: Product) => {
    if (product.thumbnailUrl) {
      return product.thumbnailUrl;
    }
    
    // Default thumbnails based on category
    const defaultThumbnails: Record<string, string> = {
      'ebook': '📚',
      'ecourse': '🎓',
      'resep_masakan': '🍳',
      'jasa_design': '🎨',
      'software': '💻'
    };
    
    return defaultThumbnails[product.category] || '📦';
  };

  return (
    <RoleGuard requiredRole="client">
      <Layout showSidebar={true}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Halaman Produk</h1>
          <h2 className="text-lg text-gray-700 mb-2">
            Temukan berbagai produk digital berkualitas atau cari produk yang Anda butuhkan
          </h2>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {isLoading ? 'Memuat...' : `Menampilkan ${filteredProducts.length} produk`}
              {selectedCategory && ` dalam kategori ${getCategoryLabel(selectedCategory)}`}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/produk/detail?id=${product.id}`}>
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${product.stock === 0 ? 'opacity-50' : ''}`}>
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-48 flex items-center justify-center">
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Stok Habis
                      </div>
                    )}
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.removeAttribute('hidden');
                        }}
                      />
                    ) : null}
                    <div className={product.thumbnailUrl ? 'hidden' : 'text-center'}>
                      <div className="text-4xl mb-2">{getProductThumbnail(product)}</div>
                      <span className="text-gray-500 text-sm">{getCategoryLabel(product.category)}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-emerald-600">
                        {formatPrice(product.price)}
                      </span>
                      <div className="text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {getCategoryLabel(product.category)}
                        </span>
                      </div>
                    </div>
                    {product.reviewScore && (
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1 text-gray-600">
                          {parseFloat(product.reviewScore).toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Oleh: {product.seller.name}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Coba ubah kata kunci pencarian atau filter kategori
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Load More / Pagination could go here */}
      </div>
    </Layout>
    </RoleGuard>
  );
}
