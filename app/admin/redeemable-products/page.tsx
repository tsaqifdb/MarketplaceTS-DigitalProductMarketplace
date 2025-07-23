"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import { Plus, Edit, Trash2, Check, X, ExternalLink } from 'lucide-react';

interface RedeemableProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsCost: number;
  stock: number;
  thumbnailUrl?: string;
  contentUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RedeemableProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<RedeemableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pointsCost: 0,
    stock: 0,
    thumbnailUrl: '',
    contentUrl: '',
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/redeemable-products');
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else if (name === 'pointsCost' || name === 'stock') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      pointsCost: 0,
      stock: 0,
      thumbnailUrl: '',
      contentUrl: '',
      isActive: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      
      if (editingId) {
        // Update existing product
        response = await fetch(`/api/redeemable-products/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new product
        response = await fetch('/api/redeemable-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal ${editingId ? 'memperbarui' : 'menambahkan'} produk`);
      }

      await fetchProducts();
      setShowForm(false);
      resetForm();
      alert(`Produk berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`);
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} product:`, error);
      alert(`Gagal ${editingId ? 'memperbarui' : 'menambahkan'} produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/redeemable-products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengubah status produk');
      }

      // Update the UI
      setProducts(products.map(product => 
        product.id === id ? { ...product, isActive: !currentStatus } : product
      ));
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert(`Gagal mengubah status produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <RoleGuard requireRole="admin">
      <AdminLayout>
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-emerald-800">
              Kelola Produk Penukaran Poin
            </h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                resetForm();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={18} />
              {showForm ? 'Tutup Form' : 'Tambah Produk'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="ebook">E-Book</option>
                      <option value="course">Kursus Online</option>
                      <option value="template">Template</option>
                      <option value="software">Software</option>
                      <option value="service">Jasa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Poin</label>
                    <input
                      type="number"
                      name="pointsCost"
                      value={formData.pointsCost}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center mt-8">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Aktif</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail</label>
                    <input
                      type="url"
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Konten</label>
                    <input
                      type="url"
                      name="contentUrl"
                      value={formData.contentUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    {editingId ? 'Update Produk' : 'Tambah Produk'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Memuat data produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Belum ada produk yang dapat ditukarkan dengan poin.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Tambah Produk Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Biaya Poin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.thumbnailUrl && (
                            <img
                              className="h-10 w-10 rounded-md mr-3 object-cover"
                              src={product.thumbnailUrl}
                              alt={product.title}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.pointsCost.toLocaleString()} poin
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(product.id, product.isActive)}
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {product.isActive ? (
                            <>
                              <Check size={14} className="mr-1" /> Aktif
                            </>
                          ) : (
                            <>
                              <X size={14} className="mr-1" /> Nonaktif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {product.contentUrl && (
                            <a
                              href={product.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setFormData({
                                title: product.title,
                                description: product.description,
                                category: product.category,
                                pointsCost: product.pointsCost,
                                stock: product.stock,
                                thumbnailUrl: product.thumbnailUrl || '',
                                contentUrl: product.contentUrl || '',
                                isActive: product.isActive,
                              });
                              setEditingId(product.id);
                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                                try {
                                  const response = await fetch(`/api/redeemable-products/${product.id}`, {
                                    method: 'DELETE',
                                  });
                                  
                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || 'Gagal menghapus produk');
                                  }
                                  
                                  // Remove the product from the UI
                                  setProducts(products.filter(p => p.id !== product.id));
                                  alert('Produk berhasil dihapus');
                                } catch (error) {
                                  console.error('Error deleting product:', error);
                                  alert(`Gagal menghapus produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}