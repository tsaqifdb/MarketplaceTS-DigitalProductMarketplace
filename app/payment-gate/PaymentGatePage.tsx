"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import RoleGuard from '../../components/RoleGuard';
import { ArrowLeft, Check, ShoppingBag, Download } from 'lucide-react';
import { formatPrice } from '@/lib/services/products';

export default function PaymentGatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      router.push('/keranjang');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${transactionId}`);
        
        if (!response.ok) {
          throw new Error('Order not found');
        }
        
        const data = await response.json();
        setOrder(data.order);
        
        // Check if payment is already confirmed
        // and reduce product stock (total stock - 1)
        if (data.order.order.paymentStatus === 'completed') {
          setPaymentConfirmed(true);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        // Keep the user on the page but show an error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [transactionId, router]);

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      // In a real app, this would be a webhook from the payment provider.
      // Here, we simulate the confirmation.
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order.id,
          paymentStatus: 'completed'
        }),
      });
      
      setPaymentConfirmed(true);

    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="client">
        <Layout showSidebar={true}>
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </Layout>
      </RoleGuard>
    );
  }

  if (!order) {
    return (
      <RoleGuard requiredRole="client">
        <Layout showSidebar={true}>
          <div className="p-6 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h1 className="text-xl font-semibold mb-2">Pesanan tidak ditemukan</h1>
            <p className="text-gray-600 mb-4">ID Transaksi tidak valid atau pesanan tidak ada.</p>
            <button 
              onClick={() => router.push('/keranjang')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700"
            >
              Kembali ke Keranjang
            </button>
          </div>
        </Layout>
      </RoleGuard>
    );
  }
  
  if (paymentConfirmed) {
    return (
        <RoleGuard requiredRole="client">
            <Layout showSidebar={true}>
                <div className="p-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pembayaran Dikonfirmasi!</h1>
                        <p className="text-gray-600 mb-6">
                            Terima kasih! Pembayaran Anda telah berhasil dikonfirmasi.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => router.push('/pesanan-saya')}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-300"
                            >
                                Lihat Pesanan Saya
                            </button>
                            <button
                                onClick={() => router.push('/produk')}
                                className="bg-white border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors duration-300"
                            >
                                Jelajahi Produk Lainnya
                            </button>
                        </div>
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
          <div className="mb-6">
            <button 
              onClick={() => router.push('/keranjang')}
              className="flex items-center text-slate-600 hover:text-emerald-700 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Kembali ke Keranjang
            </button>
          </div>

          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Instruksi Pembayaran</h1>
            <p className="text-center text-gray-600 mb-6">Selesaikan pembayaran Anda untuk produk: <strong>{order.product.title}</strong></p>

            <div className="bg-gray-100 p-6 rounded-lg text-center mb-6">
              <p className="text-sm text-gray-600">Metode Pembayaran</p>
              <p className="text-lg font-semibold uppercase">{order.order.paymentMethod}</p>
              <p className="text-sm text-gray-600 mt-4">Total Pembayaran</p>
              <p className="text-3xl font-bold text-emerald-600">{formatPrice(order.order.amount)}</p>
            </div>

            {/* Mock Barcode */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
                <div className="bg-white p-4 flex justify-center items-center">
                    {/* A simple SVG to represent a barcode */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
                        <rect x="10" y="10" width="4" height="60" />
                        <rect x="18" y="10" width="2" height="60" />
                        <rect x="24" y="10" width="6" height="60" />
                        <rect x="34" y="10" width="2" height="60" />
                        <rect x="40" y="10" width="4" height="60" />
                        <rect x="48" y="10" width="2" height="60" />
                        <rect x="54" y="10" width="6" height="60" />
                        <rect x="64" y="10" width="2" height="60" />
                        <rect x="70" y="10" width="4" height="60" />
                        <rect x="78" y="10" width="2" height="60" />
                        <rect x="84" y="10" width="6" height="60" />
                        <rect x="94" y="10" width="2" height="60" />
                        <rect x="100" y="10" width="4" height="60" />
                        <rect x="108" y="10" width="2" height="60" />
                        <rect x="114" y="10" width="6" height="60" />
                        <rect x="124" y="10" width="2" height="60" />
                        <rect x="130" y="10" width="4" height="60" />
                        <rect x="138" y="10" width="2" height="60" />
                        <rect x="144" y="10" width="6" height="60" />
                        <rect x="154" y="10" width="2" height="60" />
                        <rect x="160" y="10" width="4" height="60" />
                        <rect x="168" y="10" width="2" height="60" />
                        <rect x="174" y="10" width="6" height="60" />
                        <rect x="184" y="10" width="2" height="60" />
                    </svg>
                </div>
            </div>
            <a href="#" className="text-sm text-emerald-600 hover:underline flex items-center justify-center mb-6">
                <Download className="w-4 h-4 mr-2" />
                Unduh Gambar
            </a>

            <div className="text-left mb-8">
              <h3 className="font-semibold text-lg mb-2">Cara Pembayaran</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-1">
                <li>Scan barcode atau simpan gambar di atas.</li>
                <li>Masuk ke aplikasi mobile banking yang Anda pilih.</li>
                <li>Cek kembali jumlah pemesanan setelah itu lakukan pembayaran.</li>
              </ol>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isConfirming}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl py-3 px-4 font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirming ? 'Mengonfirmasi...' : 'Sudah Bayar'}
            </button>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
