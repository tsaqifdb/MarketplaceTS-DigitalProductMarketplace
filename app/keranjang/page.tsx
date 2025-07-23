"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import RoleGuard from '../../components/RoleGuard';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/services/products';
import { CartItem } from '@/lib/types/cart';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  // Load cart items from localStorage
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const storedItems = localStorage.getItem('cartItems');
        if (storedItems) {
          setCartItems(JSON.parse(storedItems));
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

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

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.price);
    }, 0);
  };

  // Remove item from cart
  const removeItem = (itemId: string | number) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    
    // Dispatch event to update cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };


  // Process payment
  const processPayment = async () => {
    if (!currentUser || cartItems.length === 0) return;
    
    setIsProcessingCheckout(true);
    setOrderError('');
    
    try {
      // Process each item in the cart
      const orderPromises = cartItems.map(item =>
        fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: currentUser.id,
            productId: item.productId,
            paymentMethod
          }),
        }).then(res => res.json())
      );
      
      const orderResults = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const hasErrors = orderResults.some(result => result.error);
      
      if (hasErrors) {
        const errorMessages = orderResults
          .filter(result => result.error)
          .map(result => result.error)
          .join(', ');
        
        setOrderError(`Terjadi kesalahan: ${errorMessages}`);
      } else {
        // Clear cart
        await fetch('/api/cart', {
          method: 'DELETE',
        });
        
        // Clear localStorage cart
        localStorage.setItem('cartItems', JSON.stringify([]));
        
        // Dispatch event to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
        
        setOrderComplete(true);
        setOrderData(orderResults);
        router.push(`/payment-gate?orderId=${orderResults[0].order.transactionId}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setOrderError('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Empty cart
  const emptyCart = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      setCartItems([]);
      localStorage.setItem('cartItems', JSON.stringify([]));
      
      // Dispatch event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="client">
        <Layout showSidebar={true}>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
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
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => router.push('/produk')}
              className="flex items-center text-slate-600 hover:text-emerald-700 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Kembali ke Produk
            </button>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-6">Keranjang Belanja</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Keranjang Anda Kosong</h2>
              <p className="text-gray-600 mb-6">Anda belum menambahkan produk apapun ke keranjang.</p>
              <button
                onClick={() => router.push('/produk')}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-300"
              >
                Jelajahi Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Produk ({cartItems.length})</h2>
                    <button
                      onClick={emptyCart}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Kosongkan Keranjang
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-4 flex items-start">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xl">📚</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">Kategori: {item.category}</p>
                          <p className="text-sm text-gray-600">Seller: {item.seller}</p>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <span className="font-semibold text-emerald-600">{formatPrice(item.price)}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary & Payment */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(calculateTotal())}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-emerald-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                  

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
                    <div className="space-y-3">
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-300 ${paymentMethod === 'qris' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="qris"
                          checked={paymentMethod === 'qris'}
                          onChange={() => setPaymentMethod('qris')}
                          className="mr-3 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-medium text-gray-900">QRIS</span>
                      </label>
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-300 ${paymentMethod === 'mandiri' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mandiri"
                          checked={paymentMethod === 'mandiri'}
                          onChange={() => setPaymentMethod('mandiri')}
                          className="mr-3 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-medium text-gray-900">Mandiri</span>
                      </label>
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-300 ${paymentMethod === 'bca' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bca"
                          checked={paymentMethod === 'bca'}
                          onChange={() => setPaymentMethod('bca')}
                          className="mr-3 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-medium text-gray-900">BCA</span>
                      </label>
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-300 ${paymentMethod === 'bri' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bri"
                          checked={paymentMethod === 'bri'}
                          onChange={() => setPaymentMethod('bri')}
                          className="mr-3 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-medium text-gray-900">BRI</span>
                      </label>
                    </div>
                  </div>
                  
                  {orderError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{orderError}</p>
                    </div>
                  )}

                  <button
                    onClick={processPayment}
                    disabled={isProcessingCheckout || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl py-3 px-4 font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl mb-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {isProcessingCheckout ? 'Memproses...' : 'Bayar Sekarang'}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </RoleGuard>
  );
}
