"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, ShoppingCart, Share2, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';
import { addToCart, setCheckoutItems, isInCart } from '@/lib/utils/cart';

interface Product {
  id: string;
  title: string;
  category: string;
  price: string;
  description: string;
  stock: number;
  thumbnailUrl: string;
  seller: {
    name: string;
    totalProducts: number;
    rating: number;
    avatar: string;
  };
  curator: {
    name: string;
    rating: number;
    avatar: string;
  };
  rating: number;
  totalRatings: number;
  tags: string[];
  requirements: string[];
  features: string[];
  reviews: Review[];
}

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export default function DetailProdukPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!params.id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/produk/${params.id}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        
        // Log the raw product data to verify the data
        console.log('Raw product data:', data.product);
        
        // Ensure numeric values are treated as numbers
        const processedProduct = {
          ...data.product,
          stock: Number(data.product.stock || 0),
          rating: Number(data.product.rating || 0),
          totalRatings: Number(data.product.totalRatings || 0),
          // Make sure we have empty arrays for optional array fields
          tags: data.product.tags || [],
          requirements: data.product.requirements || [],
          features: data.product.features || [],
          reviews: data.product.reviews || [],
          // Make sure seller and curator objects exist
          seller: data.product.seller || {
            name: '',
            totalProducts: 0,
            rating: 0,
            avatar: ''
          },
          curator: data.product.curator || {
            name: '',
            rating: 0,
            avatar: ''
          }
        };
        
        console.log('Processed product data:', processedProduct);
        setProduct(processedProduct);

      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      const cartItem = {
        id: `cart-${product.id}-${Date.now()}`, // Generate unique cart ID
        productId: product.id,
        name: product.title,
        category: product.category,
        price: product.price,
        quantity: quantity,
        seller: product.seller.name,
        image: product.thumbnailUrl,
      };

      addToCart(cartItem);
      alert('Produk berhasil ditambahkan ke keranjang!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang. Silakan coba lagi.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Create checkout item and redirect to cart for direct purchase
    const checkoutItem = {
      id: `checkout-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.title,
      category: product.category,
      price: product.price,
      quantity: quantity,
      seller: product.seller.name,
      image: product.thumbnailUrl,
      selected: true
    };

    setCheckoutItems([checkoutItem]);
    router.push('/keranjang');
  };

  const handleShare = () => {
    // TODO: Share functionality
    navigator.clipboard.writeText(window.location.href);
    alert('Link produk disalin ke clipboard!');
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="client">
        <Layout showSidebar={true}>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </RoleGuard>
    );
  }

  if (!product) {
    return (
      <RoleGuard requiredRole="client">
        <Layout showSidebar={true}>
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h2>
              <Link href="/cari-produk" className="text-emerald-600 hover:text-emerald-700">
                Kembali ke pencarian produk
              </Link>
            </div>
          </div>
        </Layout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="client">
      <Layout showSidebar={true}>
        <div className="p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/cari-produk" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Kembali
            </Link>
          </div>

          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Detail Produk</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Product Image */}
              <div>
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-xl font-medium">Gambar</div>
                    <div className="text-gray-400 text-xl font-medium">Produk</div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h2>
                
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <div className="text-3xl font-bold text-emerald-600 mb-4">Rp {parseFloat(product.price).toLocaleString('id-ID')}</div>
                  
                  {/* Stock Indicator */}
                  <div className={`mb-4 text-sm ${Number(product.stock) > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {Number(product.stock) > 0 ? `Stok tersedia: ${product.stock}` : 'Stok Habis'}
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {Number(product.stock) > 0 ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={handleAddToCart}
                          disabled={addingToCart || Number(product.stock) === 0}
                          className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {addingToCart ? 'Menambah...' : isInCart(product.id) ? 'Tambah Lagi' : 'Tambah ke Keranjang'}
                        </button>
                        
                        <button
                          onClick={handleBuyNow}
                          disabled={Number(product.stock) === 0}
                          className="flex-1 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Beli Langsung
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg font-medium mb-4">
                      Stok Habis
                    </div>
                  )}

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </button>

                  {product.rating > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-600 font-medium">Rating {product.rating.toFixed(1)}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {product.totalRatings > 0 && (
                          <span className="text-xs text-gray-500">({product.totalRatings} penilaian)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Produk</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{product.description || 'Tidak ada deskripsi tersedia'}</p>
              
              {/* Tags, Requirements, Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Requirements */}
                {product.requirements && product.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {product.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Seller and Curator Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.seller && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.seller.name || 'Penjual'}</div>
                      {product.seller.totalProducts !== undefined && (
                        <div className="text-sm text-gray-600">Total Produk: {product.seller.totalProducts}</div>
                      )}
                      {product.seller.rating !== undefined && (
                        <div className="text-sm text-gray-600">Rating Seller: {product.seller.rating}</div>
                      )}
                    </div>
                  </div>
                )}

                {product.curator && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.curator.name || 'Kurator'}</div>
                      {product.curator.rating !== undefined && (
                        <div className="text-sm text-gray-600">Rating Kurator: {product.curator.rating}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Ulasan Pengguna & Kurator</h3>
              
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{review.username}</span>
                            {review.verified && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Verified
                              </span>
                            )}
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Rating {review.rating}</span>
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada ulasan untuk produk ini
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
