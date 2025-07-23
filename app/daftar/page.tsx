"use client";

import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male' as 'male' | 'female',
    role: 'client' as 'client' | 'seller' | 'curator',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/verify-otp?email=' + encodeURIComponent(formData.email));
      } else {
        setError(data.error || 'Terjadi kesalahan saat mendaftar');
      }
    } catch (err) {
      setError('Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <ResponsiveNavbar currentPage="daftar" logo="MarketplaceTS" />
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl py-8 px-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Daftar Akun</h2>
              <p className="mt-2 text-slate-600">Bergabunglah dengan MarketplaceTS</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-200">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Laki-laki</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Perempuan</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Alamat Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Pilih Role
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="client"
                      name="role"
                      type="radio"
                      value="client"
                      checked={formData.role === 'client'}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="client" className="ml-3 block text-sm text-slate-700">
                      <span className="font-medium">Client (Pembeli)</span>
                      <p className="text-slate-500">Saya ingin membeli produk digital</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="seller"
                      name="role"
                      type="radio"
                      value="seller"
                      checked={formData.role === 'seller'}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="seller" className="ml-3 block text-sm text-slate-700">
                      <span className="font-medium">Seller (Penjual)</span>
                      <p className="text-slate-500">Saya ingin menjual produk digital</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="curator"
                      name="role"
                      type="radio"
                      value="curator"
                      checked={formData.role === 'curator'}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="curator" className="ml-3 block text-sm text-slate-700">
                      <span className="font-medium">Curator</span>
                      <p className="text-slate-500">Saya ingin menjadi reviewer produk</p>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Memproses...' : 'Daftar'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-slate-600">Sudah ada akun? </span>
                <Link
                  href="/masuk"
                  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium border-b border-emerald-600 transition-colors duration-300"
                >
                  Masuk disini
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
