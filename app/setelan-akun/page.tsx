"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import RoleGuard from '@/components/RoleGuard';
import { signOut } from 'next-auth/react';
import AccountSettings from '@/components/AccountSettings';

export default function SetelonAkunPage() {
  const { user } = useAuth();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/masuk' });
  };

  return (
    <RoleGuard requiredRole="client">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Kembali
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Setelan Akun</h1>
              <p className="mt-1 text-sm text-gray-600">
                Kelola informasi profil dan pengaturan akun Anda
              </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Personal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                        <div className="text-gray-900 p-2 bg-gray-50 rounded-md">{user?.name || 'Tidak tersedia'}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                        <div className="text-gray-900 p-2 bg-gray-50 rounded-md">
                          {user?.gender === 'male' ? 'Laki-laki' : user?.gender === 'female' ? 'Perempuan' : 'Tidak diset'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="text-gray-900 p-2 bg-gray-50 rounded-md">
                          {user?.role === 'client' && 'Client (Pembeli)'}
                          {user?.role === 'seller' && 'Seller (Penjual)'}
                          {user?.role === 'curator' && 'Curator'}
                          {user?.role === 'admin' && 'Admin'}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                        <div className="text-gray-900 p-2 bg-gray-50 rounded-md">{user?.email || 'Tidak tersedia'}</div>
                        {user?.isEmailVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                            Belum Terverifikasi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <AccountSettings />

                  {/* Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Aksi</h2>
                    <div className="space-y-3">
                      <button 
                        onClick={handleSignOut}
                        className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Keluar Akun
                      </button>
                      <a 
                        href="/dashboard" 
                        className="block w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                      >
                        Kembali ke Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
