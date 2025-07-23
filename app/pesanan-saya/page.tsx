"use client";

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatPrice } from '@/lib/services/products';
import { ShoppingBag, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  amount: string;
  paymentStatus: string;
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    category: string;
    contentUrl: string | null;
  };
  seller: {
    name: string;
  };
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchOrders = async () => {
        try {
          const response = await fetch(`/api/orders?customerId=${user.id}`);
          const data = await response.json();
          if (response.ok) {
            // Sort orders by creation date, newest first
            const sortedOrders = data.orders.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleDownload = (contentUrl: string) => {
    // In a real application, this would likely be a secure, expiring link.
    window.open(contentUrl, '_blank');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          paymentStatus: 'cancelled'
        }),
      });

      if (response.ok) {
        // Update the local state to reflect the cancellation
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus: 'cancelled' } 
            : order
        ));
        alert('Pesanan berhasil dibatalkan');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membatalkan pesanan');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Terjadi kesalahan saat membatalkan pesanan');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={['client']}>
      <Layout showSidebar={true}>
        <div className="p-6">
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-slate-600 hover:text-emerald-700 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Kembali
            </button>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-6">Pesanan Saya</h1>

          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Pesanan</h2>
              <p className="text-gray-600 mb-6">Anda belum melakukan pembelian apapun.</p>
              <button
                onClick={() => router.push('/produk')}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-300"
              >
                Jelajahi Produk
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pembelian</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.product.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.seller.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.paymentStatus === 'completed' && order.product.contentUrl ? (
                          <button
                            onClick={() => handleDownload(order.product.contentUrl!)}
                            className="text-emerald-600 hover:text-emerald-900 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Link
                          </button>
                        ) : order.paymentStatus === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/payment-gate?orderId=${order.transactionId}`)}
                              className="text-emerald-600 hover:text-emerald-900 text-xs px-2 py-1 border border-emerald-600 rounded-md"
                            >
                              Bayar
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={cancellingOrderId === order.id}
                            >
                              {cancellingOrderId === order.id ? 'Membatalkan...' : 'Batalkan'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </RoleGuard>
  );
}
