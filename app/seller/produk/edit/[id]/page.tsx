"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProductData {
  title: string;
  description: string;
  category: string;
  price: string;
  stock: number;
}

export default function EditProdukPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState<ProductData>({
    title: '',
    description: '',
    category: '',
    price: '',
    stock: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'ebook', label: 'E-book' },
    { value: 'ecourse', label: 'E-Course' },
    { value: 'resep_masakan', label: 'Resep Masakan' },
    { value: 'jasa_design', label: 'Jasa Design' },
    { value: 'software', label: 'Software' }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/produk/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        const data = await response.json();
        const product = data.product;
        
        // Ensure the logged-in user is the seller of this product
        // Log IDs for debugging
        console.log('Session User ID:', user?.id);
        console.log('Product Seller ID:', product.sellerId);

        if (user && user.id !== product.sellerId) {
          alert('Anda tidak memiliki izin untuk mengedit produk ini.');
          router.push('/seller/produk/galeri');
          return;
        }

        setFormData({
          title: product.title,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Gagal memuat data produk.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/produk/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            price: formData.price,
            stock: Number(formData.stock)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui produk');
      }

      alert('Produk berhasil diperbarui!');
      router.push('/seller/produk/galeri');
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="seller">
        <Layout showSidebar={true}>
          <div className="p-6 text-center">Memuat data produk...</div>
        </Layout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <Layout showSidebar={true}>
        <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="mb-6">
            <Link href="/seller/produk/galeri" className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Galeri Produk
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-emerald-800 mb-8 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Produk
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Produk</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Nama Produk *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Harga (Rp) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">Jumlah Stok *</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/seller/produk/galeri">
                  <button type="button" className="px-6 py-3 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors">
                    Batal
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}