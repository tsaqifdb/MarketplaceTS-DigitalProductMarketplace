"use client";

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Footer from '../../components/Footer';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function untuk cek curator approval via API
  const checkCuratorApproval = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-curator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) return true;
      
      const data = await response.json();
      return data.approved;
    } catch (error) {
      console.error('Error checking curator approval:', error);
      return true; // Default allow jika ada error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          // Cek apakah ini curator yang belum approved
          const isCuratorApproved = await checkCuratorApproval(email);
          
          if (!isCuratorApproved) {
            setError('Akun kurator Anda belum disetujui admin.');
          } else {
            setError('Email atau password salah');
          }
        } else {
          setError('Login gagal. Silakan coba lagi.');
        }
      } else if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <ResponsiveNavbar currentPage="masuk" logo="MarketplaceTS" />

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl py-8 px-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Masuk Ke Akun</h2>
              <p className="mt-2 text-slate-600">
                Selamat datang kembali di MarketplaceTS
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-200">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                    Ingat saya
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/lupa-password" className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors duration-300">
                    Lupa password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-slate-600">Belum ada akun? </span>
                <Link
                  href="/daftar"
                  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium border-b border-emerald-600 transition-colors duration-300"
                >
                  Daftar disini
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