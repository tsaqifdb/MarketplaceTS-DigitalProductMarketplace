"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface PendingProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnailUrl?: string;
  contentUrl?: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export default function ReviewProdukDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<PendingProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    reviewScore: '0',
    reviewNotes: '',
    questions: {
      question1: { score: 5, note: '' }, // Original dan tidak melanggar hak cipta
      question2: { score: 5, note: '' }, // Deskripsi jelas dan lengkap
      question3: { score: 5, note: '' }, // Thumbnail menarik dan representatif
      question4: { score: 5, note: '' }, // Konten berkualitas baik
      question5: { score: 5, note: '' }, // Informasi akurat dan relevan
      question6: { score: 5, note: '' }, // Keunikan dibanding produk serupa
      question7: { score: 5, note: '' }, // Potensi penjualan tinggi
      question8: { score: 5, note: '' }  // Lisensi dan instruksi jelas
    }
  });

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        if (productId) {
          console.log(`Attempting to fetch product with ID: ${productId}`);
          
          // First attempt with path parameter (preferred method)
          let response = await fetch(`/api/produk/${productId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          });
          
          // If first attempt fails, try alternative endpoint with query parameter
          if (!response.ok) {
            console.log(`First API attempt failed with status ${response.status}, trying alternative endpoint`);
            response = await fetch(`/api/produk?id=${productId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
            });
          }
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}):`, errorText);
            throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Product data received:', data);
          
          // Handle different API response structures
          let productData;
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            productData = data.products[0];
            console.log('Found product in products array');
          } else if (data.product) {
            productData = data.product;
            console.log('Found product in product field');
          } else if (data.id) {
            // The API might directly return the product object
            productData = data;
            console.log('API directly returned product object');
          } else {
            console.error('No product found in API response', data);
            throw new Error('Product not found in database');
          }
          
          // Check if product is already reviewed
          if (productData.status !== 'pending') {
            throw new Error('Produk ini sudah direview. Hanya produk dengan status pending yang dapat direview.');
          }
          
          console.log('Product details:', productData);
          
          // Get seller information
          let seller = {
            id: productData.sellerId,
            name: 'Unknown Seller',
            email: 'unknown@example.com'
          };
          if (productData.sellerId) {
            try {
              const sellerResponse = await fetch(`/api/users/${productData.sellerId}`);
              if (sellerResponse.ok) {
                const sellerData = await sellerResponse.json();
                if (sellerData) {
                  seller = {
                    id: productData.sellerId,
                    name: sellerData.name || 'Unknown Seller',
                    email: sellerData.email || 'unknown@example.com'
                  };
                }
              }
            } catch (sellerErr) {
              console.error('Error fetching seller:', sellerErr);
            }
          }
          
          const formattedProduct: PendingProduct = {
            id: productData.id,
            title: productData.title || 'Produk Tanpa Nama',
            description: productData.description,
            category: productData.category,
            price: productData.price.toString(),
            thumbnailUrl: productData.thumbnailUrl,
            contentUrl: productData.contentUrl,
            seller: seller,
            createdAt: new Date(productData.createdAt)
          };
          
          setProduct(formattedProduct);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        // Log yang lebih rinci untuk debugging
        console.error('Error details:', {
          productId,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleSubmitReview = async (forceStatus?: 'approved' | 'rejected') => {
    try {
      if (!user?.id || !product?.id) {
        alert('Data pengguna atau produk tidak lengkap');
        return;
      }
      
      // Prepare data for API
      const { question1, question2, question3, question4, question5, question6, question7, question8 } = reviewData.questions;
      const scores = [
        question1.score,
        question2.score,
        question3.score,
        question4.score,
        question5.score,
        question6.score,
        question7.score,
        question8.score
      ];
      
      // Hitung skor rata-rata
      const sumScore = scores.reduce((total, score) => total + score, 0);
      const avgScore = (sumScore / 8).toFixed(2);
      
      // Gunakan status yang di-force jika ada, atau tentukan otomatis
      const status = forceStatus || (parseFloat(avgScore) >= 2.8 ? 'approved' : 'rejected');
      
      // Submit review to API
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          curatorId: user.id,
          scores: scores,
          comments: reviewData.reviewNotes,
          status: status // Status yang ditentukan oleh kurator atau skor
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      const result = await response.json();
      
      alert(`Review berhasil disimpan! Produk telah ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
      router.push('/curator/riwayat-penilaian'); // Arahkan ke riwayat penilaian setelah review
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Gagal menyimpan review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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

  if (isLoading) {
    return (
      <RoleGuard requiredRole="curator">
        <Layout showSidebar={true}>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        </Layout>
      </RoleGuard>
    );
  }

  if (!product) {
    return (
      <RoleGuard requiredRole="curator">
        <Layout showSidebar={true}>
          <div className="p-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">
                {productId ? 
                  `Produk dengan ID ${productId} tidak dapat ditemukan atau sudah direview. Hanya produk dengan status pending yang dapat direview.` : 
                  'ID produk tidak valid.'}
              </p>
              <div className="space-y-4">
                <Link href="/curator/cari-produk" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md">
                  Cari Produk Lainnya
                </Link>
                <div>
                  <Link href="/curator" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Kembali ke Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="curator">
      <Layout showSidebar={true}>
        <div className="p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/curator/cari-produk" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Produk
            </Link>
          </div>

          <div className="flex items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Form Review Produk</h1>
            <div className="relative ml-3 group">
              <button className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300">
                <span className="text-xs">?</span>
              </button>
              <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 right-0 mt-2">
                <h3 className="font-semibold text-gray-900 mb-2">Tentang Penilaian</h3>
                <p className="text-xs text-gray-600 mb-2">Berikan nilai 1-5 untuk setiap pertanyaan. Skor akan dihitung otomatis.</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
                  <li>Produk diterima jika skor rata-rata ≥ 2.8</li>
                  <li>Produk ditolak jika skor rata-rata &lt; 2.8</li>
                  <li>Nilai 5 = Sangat baik</li>
                  <li>Nilai 1 = Sangat buruk</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Info */}
            <div>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-6">
                {product.thumbnailUrl ? (
                  <img 
                    src={product.thumbnailUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-700">Gambar</h3>
                    <h4 className="text-lg font-medium text-gray-700">Produk</h4>
                  </div>
                )}
              </div>
              {product.contentUrl && (
                <a 
                  href={product.contentUrl} 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Buka Preview
                </a>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Nama Produk</h2>
              <p className="text-lg text-gray-700 mb-4">{product.title}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kategori</h3>
              <p className="text-gray-700 mb-4">{getCategoryLabel(product.category)}</p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Penjual</h3>
              <p className="text-gray-700 mb-2">
                {product.seller.name || 'Penjual Tidak Diketahui'} ({product.seller.email || 'Email Tidak Diketahui'})
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Harga</h3>
              <p className="text-gray-700 mb-6">Rp{parseInt(product.price).toLocaleString()}</p>
              
              <div className="flex space-x-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preview Status</h4>
                  <div>
                    {(() => {
                      const { question1, question2, question3, question4, question5, question6, question7, question8 } = reviewData.questions;
                      const scores = [question1.score, question2.score, question3.score, question4.score, question5.score, question6.score, question7.score, question8.score];
                      const sumScore = scores.reduce((total, score) => total + score, 0);
                      const avgScore = sumScore / 8;
                      const autoStatus = avgScore >= 2.8 ? 'approved' : 'rejected';
                      
                      // Update status state
                      if (reviewData.status !== autoStatus) {
                        setTimeout(() => {
                          setReviewData(prev => ({...prev, status: autoStatus}));
                        }, 0);
                      }
                      
                      return autoStatus === 'approved' ? (
                        <span className="inline-flex items-center px-3 py-2 rounded-md bg-green-100 text-green-800 font-medium text-sm">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Disetujui
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-2 rounded-md bg-red-100 text-red-800 font-medium text-sm">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Ditolak
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preview Rating</h4>
                  <div className="flex flex-col">
                    <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-20 bg-gray-50 flex items-center justify-center font-semibold">
                      {(() => {
                        const { question1, question2, question3, question4, question5, question6, question7, question8 } = reviewData.questions;
                        const scores = [question1.score, question2.score, question3.score, question4.score, question5.score, question6.score, question7.score, question8.score];
                        const sumScore = scores.reduce((total, score) => total + score, 0);
                        const avgScore = (sumScore / 8).toFixed(2);
                        
                        // Update reviewScore state
                        if (reviewData.reviewScore !== avgScore) {
                          setTimeout(() => {
                            setReviewData(prev => ({...prev, reviewScore: avgScore}));
                          }, 0);
                        }
                        
                        return avgScore;
                      })()}
                    </div>
                    
                    <div className="flex items-center mt-2">
                      {Array.from({ length: 5 }, (_, i) => {
                        const score = parseFloat(reviewData.reviewScore);
                        const fullStars = Math.floor(score);
                        const hasHalfStar = score % 1 >= 0.5;
                        
                        return (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < fullStars
                                ? 'text-yellow-400'
                                : i === fullStars && hasHalfStar
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Form Penilaian</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
              {/* Question 1 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 1</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah produk ini original dan tidak melanggar hak cipta?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question1: { ...reviewData.questions.question1, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question1.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 2</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah deskripsi produk jelas dan lengkap?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question2: { ...reviewData.questions.question2, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question2.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 3</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah thumbnail produk menarik dan representatif?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question3: { ...reviewData.questions.question3, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question3.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Question 4 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 4</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah konten produk memiliki kualitas yang baik?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question4: { ...reviewData.questions.question4, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question4.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Question 5 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 5</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah informasi yang disampaikan akurat dan relevan?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question5: { ...reviewData.questions.question5, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question5.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Question 6 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 6</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah produk memiliki keunikan dibanding produk serupa di pasar?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question6: { ...reviewData.questions.question6, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question6.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Question 7 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 7</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah produk memiliki potensi penjualan yang tinggi?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question7: { ...reviewData.questions.question7, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question7.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Question 8 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pertanyaan 8</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah produk disertai dengan lisensi dan instruksi yang jelas?
                </p>
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setReviewData({
                        ...reviewData,
                        questions: {
                          ...reviewData.questions,
                          question8: { ...reviewData.questions.question8, score }
                        }
                      })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                        reviewData.questions.question8.score === score
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info Sistem Penilaian */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Penilaian</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Poin Kurator</h4>
                  <p className="text-sm text-gray-600">Anda akan mendapatkan poin berdasarkan jenis produk yang Anda review.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Poin Seller</h4>
                  <ul className="text-sm text-gray-600 ml-5 list-disc">
                    <li>Submit produk: 2 poin</li>
                    <li>Produk diterima: 10 poin</li>
                    <li>Produk ditolak: 5 poin</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Rumus Perhitungan</h4>
                  <p className="text-sm text-blue-700">Skor Review = Jumlah skor pertanyaan / 8 (jumlah pertanyaan)</p>
                  <p className="text-sm text-blue-700 mt-1">Batas minimal produk diterima: 2.8 dari 5.0</p>
                  
                  <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                    <div className="text-xs text-blue-800 mb-1">Total skor saat ini:</div>
                    <div className="flex items-center">
                      {(() => {
                        const { question1, question2, question3, question4, question5, question6, question7, question8 } = reviewData.questions;
                        const scores = [question1.score, question2.score, question3.score, question4.score, question5.score, question6.score, question7.score, question8.score];
                        const sumScore = scores.reduce((total, score) => total + score, 0);
                        
                        return (
                          <>
                            <div className="text-lg font-bold text-blue-900">{sumScore}</div>
                            <div className="mx-2 text-blue-400">/</div>
                            <div className="text-sm text-blue-700">40 (maks)</div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Curator Notes */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Kurator</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Kurator 1</h4>
                  <span className="text-xs text-gray-500">tanggal {new Date().toLocaleDateString('id-ID')}</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    rows={6}
                    value={reviewData.reviewNotes}
                    onChange={(e) => setReviewData({...reviewData, reviewNotes: e.target.value})}
                    placeholder="Tuliskan catatan review Anda di sini..."
                    className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Keputusan Review</h3>
              
              <div className="flex flex-col space-y-4">
                <p className="text-gray-600">
                  Berdasarkan penilaian, produk ini akan {parseFloat(reviewData.reviewScore) >= 2.8 ? 
                    <span className="font-semibold text-green-600">disetujui</span> : 
                    <span className="font-semibold text-red-600">ditolak</span>
                  } secara otomatis.
                </p>
                
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-2">
                  <button
                    onClick={() => handleSubmitReview('approved')}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 font-medium inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Setujui Produk
                  </button>
                  
                  <button
                    onClick={() => handleSubmitReview('rejected')}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Tolak Produk
                  </button>
                </div>
                
                <div className="text-sm text-gray-500 text-center mt-2">
                  Keputusan final Anda akan mengesampingkan rekomendasi otomatis sistem.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
