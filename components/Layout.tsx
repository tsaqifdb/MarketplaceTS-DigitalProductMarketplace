"use client";

import { ReactNode, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/lib/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ 
  children, 
  showSidebar = false
}: LayoutProps) {
  const { user } = useAuth();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const getUserRole = () => {
    if (!user?.role) return 'user';
    return user.role === 'client' ? 'user' : user.role;
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <Navbar 
        onToggleSidebar={showSidebar ? toggleSidebar : undefined}
      />
      
      <div className="flex flex-1 relative" style={{ overflow: 'visible', maxWidth: '100%' }}>
        {showSidebar && isSidebarVisible && (
          <>
            <Sidebar userRole={getUserRole()} />
            <div
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            ></div>
          </>
        )}
        
        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}