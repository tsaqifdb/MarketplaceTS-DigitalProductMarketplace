"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Upload, FileText, Image, Video, Music, Archive } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  file: File | null;
  thumbnail: File | null;
  tags: string;
  requirements: string;
}

export default function DaftarkanProdukPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    file: null,
    thumbnail: null,
    tags: '',
    requirements: ''
  });
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State untuk pesan error file
  const [fileErrors, setFileErrors] = useState<{file?: string | null, thumbnail?: string | null}>({});

  const categories = [
    { value: 'ebook', label: 'E-book' },
    { value: 'ecourse', label: 'E-Course' },
    { value: 'resep_masakan', label: 'Resep Masakan' },
    { value: 'jasa_design', label: 'Jasa Design' },
    { value: 'software', label: 'Software' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validasi ukuran file sebelum submit
    const maxSizeFile = 100 * 1024 * 1024; // 100MB
    const maxSizeThumbnail = 5 * 1024 * 1024; // 5MB
    let hasError = false;
    const errors: {file?: string | null, thumbnail?: string | null} = {};

    if (formData.file && formData.file.size > maxSizeFile) {
      errors.file = `Ukuran file terlalu besar. Maksimal ${maxSizeFile / (1024 * 1024)} MB.`;
      hasError = true;
    }
    
    if (formData.thumbnail && formData.thumbnail.size > maxSizeThumbnail) {
      errors.thumbnail = `Ukuran thumbnail terlalu besar. Maksimal ${maxSizeThumbnail / (1024 * 1024)} MB.`;
      hasError = true;
    }

    if (hasError) {
      setFileErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('tags', formData.tags);
      submitData.append('requirements', formData.requirements);
      // Add seller ID (required field for the API)
      if (user?.id) {
        submitData.append('sellerId', user.id);
      } else {
        throw new Error('User ID not found');
      }
      if (formData.file) {
        submitData.append('content', formData.file);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }
      // Submit to API
      const response = await fetch('/api/produk', {
        method: 'POST',
        body: submitData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengirim produk');
      }
      const result = await response.json();
      alert('Produk berhasil diajukan untuk review!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        file: null,
        thumbnail: null,
        tags: '',
        requirements: ''
      });
      // Redirect to history pengajuan
      window.location.href = '/seller/produk/galeri';
    } catch (error) {
      console.error('Error submitting product:', error);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    
    // Validasi ukuran file saat pengguna memilih file
    if (file) {
      let maxSize;
      let fieldName;
      
      if (name === 'file') {
        maxSize = 100 * 1024 * 1024; // 100MB
        fieldName = 'File Produk';
      } else if (name === 'thumbnail') {
        maxSize = 5 * 1024 * 1024; // 5MB
        fieldName = 'Thumbnail';
      }
      
      if (maxSize && file.size > maxSize) {
        alert(`${fieldName} terlalu besar. Maksimal ${maxSize / (1024 * 1024)} MB.`);
        // Reset input file
        e.target.value = '';
        return;
      }
      
      // Hapus error jika file valid
      if (name === 'file') {
        setFileErrors(prev => ({ ...prev, file: null }));
      } else if (name === 'thumbnail') {
        setFileErrors(prev => ({ ...prev, thumbnail: null }));
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const handleDrop = (e: React.DragEvent, fieldName: 'file' | 'thumbnail') => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validasi ukuran file saat drag & drop
      let maxSize;
      let fieldNameDisplay;
      
      if (fieldName === 'file') {
        maxSize = 100 * 1024 * 1024; // 100MB
        fieldNameDisplay = 'File Produk';
      } else if (fieldName === 'thumbnail') {
        maxSize = 5 * 1024 * 1024; // 5MB
        fieldNameDisplay = 'Thumbnail';
      }
      
      if (maxSize && file.size > maxSize) {
        alert(`${fieldNameDisplay} terlalu besar. Maksimal ${maxSize / (1024 * 1024)} MB.`);
        return;
      }
      
      // Hapus error jika file valid
      if (fieldName === 'file') {
        setFileErrors(prev => ({ ...prev, file: null }));
      } else if (fieldName === 'thumbnail') {
        setFileErrors(prev => ({ ...prev, thumbnail: null }));
      }
      
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="w-8 h-8 text-green-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-8 h-8 text-orange-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <RoleGuard requiredRole="seller">
      <Layout showSidebar={true}>
        <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-white">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/seller/produk/galeri" className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Galeri Produk
            </Link>
          </div>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-emerald-800 mb-8">Daftarkan Produk Digital</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Dasar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Masukkan nama produk"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Stok *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Pisahkan dengan koma"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Produk *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Jelaskan produk Anda secara detail"
                    required
                  />
                </div>
                <div className="mt-6">
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                    Persyaratan Sistem/Penggunaan
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Contoh: Windows 10, Microsoft Word 2016 atau yang lebih baru"
                  />
                </div>
              </div>
              {/* File Uploads */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload File</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Product File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Produk Utama *
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => handleDrop(e, 'file')}
                    >
                      {formData.file ? (
                        <div className="flex flex-col items-center">
                          {getFileIcon(formData.file.name)}
                          <p className="mt-2 text-sm text-gray-600">{formData.file.name}</p>
                          <p className="text-xs text-gray-400">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Drag & drop file atau{' '}
                            <label className="text-emerald-600 cursor-pointer hover:text-emerald-700 font-bold">
                              browse
                              <input
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.zip,.rar,.mp4,.mp3,.png,.jpg,.jpeg"
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-400">
                            Maksimal 100MB (PDF, DOC, ZIP, MP4, MP3, PNG, JPG)
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Pesan error untuk file utama */}
                    {fileErrors.file && (
                      <p className="mt-2 text-sm text-red-600">{fileErrors.file}</p>
                    )}
                  </div>
                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail/Preview
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => handleDrop(e, 'thumbnail')}
                    >
                      {formData.thumbnail ? (
                        <div className="flex flex-col items-center">
                          <Image className="w-8 h-8 text-blue-500" />
                          <p className="mt-2 text-sm text-gray-600">{formData.thumbnail.name}</p>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Drag & drop gambar atau{' '}
                            <label className="text-emerald-600 cursor-pointer hover:text-emerald-700 font-bold">
                              browse
                              <input
                                type="file"
                                name="thumbnail"
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-400">
                            Maksimal 5MB (PNG, JPG, JPEG)
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Pesan error untuk thumbnail */}
                    {fileErrors.thumbnail && (
                      <p className="mt-2 text-sm text-red-600">{fileErrors.thumbnail}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/seller/produk/galeri">
                  <button
                    type="button"
                    className="px-6 py-3 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Batal
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : 'Ajukan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}