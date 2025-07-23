"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/components/providers/AuthProvider';
import { User } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut({ callbackUrl: '/masuk' });
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'client': return 'Client';
      case 'seller': return 'Seller';
      case 'curator': return 'Curator';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="p-2 rounded-lg border border-emerald-300 hover:bg-emerald-50 transition-colors"
              title="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link href="/dashboard" className="text-xl font-bold text-emerald-800">
            MarketplaceTS
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-gray-700 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>{user?.name || 'User'}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-6 w-52 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-5 duration-300 mr-4">
                <div className="p-4 border-b border-gray-200/50">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-600">{user?.email || 'Email tidak tersedia'}</div>
                </div>
                <div className="p-3">
                  <Link 
                    href={user?.role === 'admin' ? '/admin/akun' : user?.role === 'seller' ? '/seller/akun' : user?.role === 'curator' ? '/curator/akun' : '/setelan-akun'}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-emerald-100/60 hover:text-emerald-900 rounded-xl transition-all duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Setelan Akun
                  </Link>
                  <Link
                    href="/#footer"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-emerald-100/60 hover:text-emerald-900 rounded-xl transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDropdownOpen(false);
                      const footer = document.getElementById('footer');
                      if (footer) {
                        footer.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Bantuan
                  </Link>
                  <hr className="my-3 border-gray-200/50" />
                  <button 
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-100/60 hover:text-emerald-900 rounded-xl transition-all duration-200"
                    onClick={handleSignOut}
                  >
                    Keluar Akun
                  </button>
                </div>
                <div className="p-3 border-t border-gray-200/50">
                  <span className="text-xs text-gray-600">Role: {user?.role ? getRoleDisplay(user.role) : 'User'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
