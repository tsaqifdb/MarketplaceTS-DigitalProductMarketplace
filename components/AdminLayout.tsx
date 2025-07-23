"use client";

import { ReactNode, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/components/providers/AuthProvider';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Pastikan peran pengguna adalah 'admin' untuk sidebar
  const userRole = user?.role === 'admin' ? 'admin' : undefined;

  return (
    <div className="min-h-screen bg-emerald-50/50">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex pt-16">
        <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 z-40 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
          {isSidebarOpen && userRole && <Sidebar userRole={userRole} />}
        </div>
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <Footer />
      </div>
    </div>
  );
}