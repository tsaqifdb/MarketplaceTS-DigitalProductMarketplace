"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCuratorPoints } from '@/lib/hooks/useCuratorPoints';
import Layout from '@/components/Layout';
import RoleGuard from '@/components/RoleGuard';
import AccountSettings from '@/components/AccountSettings';
import { signOut } from 'next-auth/react';

export default function CuratorAkunPage() {
  const { user } = useAuth();
  const { curatorPoints, isLoading: isLoadingPoints } = useCuratorPoints(user?.id);
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/masuk' });
  };

  return (
    <RoleGuard requiredRole="curator">
      <Layout showSidebar={true}>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/curator" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">Profil Kurator</h1>
            </div>
            
            <div className="px-6 py-6">
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Personal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                      <div className="text-gray-900 p-2 bg-gray-50 rounded-md">{user?.name || 'Curator'}</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <div className="text-gray-900 p-2 bg-gray-50 rounded-md">
                        Curator (Kurator)
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                      <div className="text-gray-900 p-2 bg-gray-50 rounded-md">{user?.email || 'curator@marketplace-ts.com'}</div>
                      {user?.isEmailVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Belum Terverifikasi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Points Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Points</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Curator Points</label>
                    {isLoadingPoints ? (
                      <div className="h-8 w-24 bg-green-100 animate-pulse rounded"></div>
                    ) : (
                      <div className="text-2xl font-bold text-green-600">{curatorPoints.toLocaleString() || 0}</div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Points yang dikumpulkan dari aktivitas review produk sebagai curator
                    </p>
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
                    <Link 
                      href="/curator/" 
                      className="block w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    >
                      Kembali ke Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RoleGuard>
  );
}
