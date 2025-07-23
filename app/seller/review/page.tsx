"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Search, Star, MessageSquare, Filter, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface Review {
  id: string;
  customerName: string;
  customerId: string;
  productName: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  response?: string | null;
  responseDate?: string | null;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseText, setResponseText] = useState<string>('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadReviews = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch reviews from the API
        const response = await fetch(`/api/seller/customer-reviews?sellerId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }
        
        const reviewsData = await response.json();
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [user]);

  const handleResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      alert('Respon tidak boleh kosong');
      return;
    }

    try {
      // Send the response to the API
      const response = await fetch('/api/seller/customer-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          response: responseText,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      // Update the local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              response: responseText,
              responseDate: new Date().toISOString().split('T')[0]
            }
          : review
      ));
      
      setResponseText('');
      setRespondingTo(null);
      alert('Respon berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = filterRating ? review.rating === filterRating : true;
    
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Review Produk</h1>
          </div>

          {/* Review Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{getAverageRating()}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(parseFloat(getAverageRating())), 'md')}
                </div>
                <div className="text-sm text-gray-600">dari {reviews.length} review</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribusi Rating</h3>
              <div className="space-y-2">
                {getRatingDistribution().map((count, index) => {
                  const rating = 5 - index;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-8">{rating}★</span>
                      <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistik</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Review</span>
                  <span className="font-semibold">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Review Verified</span>
                  <span className="font-semibold">{reviews.filter(r => r.verified).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dengan Respon</span>
                  <span className="font-semibold">{reviews.filter(r => r.response).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari review, produk, atau nama customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterRating || ''}
                  onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Semua Rating</option>
                  <option value="5">5 Bintang</option>
                  <option value="4">4 Bintang</option>
                  <option value="3">3 Bintang</option>
                  <option value="2">2 Bintang</option>
                  <option value="1">1 Bintang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                        {review.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{review.productName}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  {/* <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {review.helpful} orang terbantu
                      </span>
                    </div>
                  </div> */}

                  {review.response ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-emerald-800">Respon Anda:</span>
                        {review.responseDate && (
                          <span className="text-xs text-emerald-600">{review.responseDate}</span>
                        )}
                      </div>
                      <p className="text-emerald-700">{review.response}</p>
                    </div>
                  ) : (
                    <div>
                      {respondingTo === review.id ? (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Tulis respon Anda untuk review ini..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-3"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResponse(review.id)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                            >
                              Kirim Respon
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review.id)}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                          Balas Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || filterRating ? 'Tidak ada review yang sesuai filter' : 'Belum ada review'}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredReviews.length > 0 && (
            <div className="mt-8 flex justify-end">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                <span className="mr-1">Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </Layout>
    </RoleGuard>
  );
}
