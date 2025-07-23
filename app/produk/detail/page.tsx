"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import RoleGuard from '../../../components/RoleGuard';
import { Star, Share2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { getProductById, formatPrice, type Product } from '@/lib/services/products';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DetailProdukPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasUserPurchased, setHasUserPurchased] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        router.push('/produk');
        return;
      }

      try {
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
        } else {
          // Product not found
          router.push('/produk');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        router.push('/produk');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId, router]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch reviews and check if user has purchased the product
  useEffect(() => {
    const fetchReviewsAndPurchaseStatus = async () => {
      if (!productId || !currentUser) return;
      
      setIsLoadingReviews(true);
      try {
        // Fetch reviews
        const reviewsResponse = await fetch(`/api/customer-reviews?productId=${productId}`);
        const reviewsData = await reviewsResponse.json();
        
        if (reviewsData.reviews) {
          setReviews(reviewsData.reviews);
          
          // Check if current user has already reviewed
          const userReviewFound = reviewsData.reviews.find(
            (review: any) => review.customerId === currentUser.id
          );
          
          if (userReviewFound) {
            setUserReview(userReviewFound);
          }
        }
        
        // Check if user has purchased the product
        const purchaseResponse = await fetch(`/api/orders/check-purchase?productId=${productId}&customerId=${currentUser.id}`);
        const purchaseData = await purchaseResponse.json();
        
        setHasUserPurchased(purchaseData.hasPurchased || false);
      } catch (error) {
        console.error('Error fetching reviews and purchase status:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    if (product && currentUser) {
      fetchReviewsAndPurchaseStatus();
    }
  }, [product, productId, currentUser]);

  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !currentUser) {
      setReviewError('Anda harus login untuk memberikan ulasan');
      return;
    }
    
    if (!hasUserPurchased) {
      setReviewError('Anda harus membeli produk ini terlebih dahulu untuk memberikan ulasan');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError('');
    
    try {
      const response = await fetch('/api/customer-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerId: currentUser.id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add the new review to the list
        setReviews([...reviews, data.review]);
        setUserReview(data.review);
        
        // Reset form
        setNewReview({ rating: 5, comment: '' });
      } else {
        setReviewError(data.error || 'Terjadi kesalahan saat menambahkan ulasan');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Terjadi kesalahan saat menambahkan ulasan');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/customer-reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the deleted review from the list
        setReviews(reviews.filter(review => review.id !== reviewId));
        setUserReview(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Terjadi kesalahan saat menghapus ulasan');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Terjadi kesalahan saat menghapus ulasan');
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // Check if item already exists
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.productId === product.id
      );
      
      if (existingItemIndex === -1) {
        // Add new item to cart
        const cartItem = {
          id: Date.now(),
          productId: product.id,
          name: product.title,
          category: product.category,
          price: product.price,
          seller: product.seller.name,
          thumbnailUrl: product.thumbnailUrl,
          contentUrl: product.contentUrl
        };
        
        existingCart.push(cartItem);
        localStorage.setItem('cartItems', JSON.stringify(existingCart));
        
        // Dispatch event to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Show success message (you can use a toast library here)
        alert('Produk berhasil ditambahkan ke keranjang!');
      } else {
        alert('Produk sudah ada di keranjang!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang. Silakan coba lagi.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const buyNow = () => {
    // Add to cart and redirect to checkout
    addToCart();
    setTimeout(() => {
      router.push('/payment-gate');
    }, 500);
  };

  const shareProduct = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.title,
      text: `Cek produk "${product.title}" dari ${product.seller.name}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link produk berhasil disalin ke clipboard!');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="client">
        <Layout showSidebar={true}>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
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
              <h2 className="text-xl font-medium text-gray-900 mb-2">Produk tidak ditemukan</h2>
              <p className="text-gray-600 mb-4">Produk yang Anda cari tidak tersedia.</p>
              <button
                onClick={() => router.push('/produk')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Kembali ke Produk
              </button>
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
          <button 
            onClick={() => router.back()}
            className="flex items-center text-slate-600 hover:text-emerald-700 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Kembali
          </button>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Detail Produk</h1>
        <h2 className="text-xl text-slate-600 mb-6">{product.title}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-80 flex items-center justify-center mb-6 border overflow-hidden">
              <div className="text-center w-full h-full flex items-center justify-center">
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.title}
                    className="max-w-full max-h-80 object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">📚</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Preview Produk</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-emerald-600 mb-2">{formatPrice(product.price)}</h3>
                <p className="text-sm text-gray-600">Oleh: {product.seller.name}</p>
                {product.reviewScore && (
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {parseFloat(product.reviewScore).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={addToCart}
                    disabled={isAddingToCart || product.stock === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl py-3 px-4 font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl mb-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                  </button>

                  <button
                    onClick={buyNow}
                    disabled={product.stock === 0}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl py-3 px-4 font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Beli Sekarang
                  </button>
                </>
              ) : (
                <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg font-medium mb-4">
                  Stok Habis
                </div>
              )}
              
              {product.reviewScore && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600">Rating</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(parseFloat(product.reviewScore || '0')) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{parseFloat(product.reviewScore).toFixed(1)}</span>
                  </div>
                </div>
              )}
              <button 
                onClick={shareProduct}
                className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-slate-700 font-medium hover:bg-slate-50 hover:border-emerald-300 transition-all duration-300 flex items-center justify-center group"
              >
                <Share2 className="w-4 h-4 mr-2 group-hover:text-emerald-600 transition-colors duration-300" />
                Bagikan Produk
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi Produk</h3>
          <div className="text-gray-700 leading-relaxed">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="text-gray-500 italic">Deskripsi produk belum tersedia.</p>
            )}
          </div>
        </div>

        {/* Seller Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Seller</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-emerald-600">
                  {product.seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{product.seller.name}</h4>
                <p className="text-sm text-gray-600">{product.seller.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ulasan Pengguna</h3>
          
          {/* Review Form */}
          {currentUser && !userReview && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Berikan Ulasan Anda</h4>
              
              {!hasUserPurchased ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-800 text-sm">
                    Anda harus membeli produk ini terlebih dahulu untuk memberikan ulasan.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Komentar
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Bagikan pendapat Anda tentang produk ini..."
                    />
                  </div>
                  
                  {reviewError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-800 text-sm">{reviewError}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !hasUserPurchased}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </form>
              )}
            </div>
          )}
          
          {/* Reviews List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {isLoadingReviews ? (
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <hr className="border-gray-200" />
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={review.id || index}>
                    {index > 0 && <hr className="border-gray-200 my-4" />}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {currentUser && review.customerId === currentUser.id ? 'Ulasan Anda' : 'Pengguna'}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {review.createdAt ? format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: id }) : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700">
                        {review.comment || 'Tidak ada komentar.'}
                      </p>
                      
                      {currentUser && review.customerId === currentUser.id && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-800 text-sm ml-4"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">Belum Ada Ulasan</h4>
                <p className="text-sm text-gray-500">
                  Produk ini belum memiliki ulasan dari pengguna.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
    </RoleGuard>
  );
}
