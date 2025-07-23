"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import { useAuth } from '@/components/providers/AuthProvider';
import { Users, Package, UserCheck } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <RoleGuard requireRole="admin">
      <AdminLayout>
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Selamat datang kembali, {user?.name}! Kelola sistem MarketplaceTS.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-3 bg-white shadow-lg rounded-xl p-6 border border-gray-200/60">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Menu Admin
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionCard 
                  icon={<Users className="w-12 h-12 text-blue-500" />} 
                  title="Manajemen Akun" 
                  description="Kelola akun pengguna dan atur hak akses" 
                  href="/user-management" 
                />
                <QuickActionCard 
                  icon={<Package className="w-12 h-12 text-green-500" />} 
                  title="Manajemen Produk" 
                  description="Lihat dan hapus produk dalam sistem" 
                  href="/admin/produk" 
                />
                <QuickActionCard 
                  icon={<UserCheck className="w-12 h-12 text-purple-500" />} 
                  title="Persetujuan Kurator" 
                  description="Setujui pendaftaran kurator baru" 
                  href="/user-management" 
                />
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}

// Helper Components
const QuickActionCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <a href={href} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200/60 hover:shadow-emerald-100 hover:border-emerald-200 transition-all duration-300 flex flex-col items-center text-center">
    <div className="bg-gray-100 p-4 rounded-full mb-4">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </a>
);
