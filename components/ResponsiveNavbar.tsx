'use client';

import Link from 'next/link';
import { useState } from 'react';

interface ResponsiveNavbarProps {
  logo?: string;
  logoLink?: string;
  showAuthButtons?: boolean;
  currentPage?: 'login' | 'register' | 'masuk' | 'daftar' | 'home';
}

export default function ResponsiveNavbar({ 
  logo = 'MarketplaceTS', 
  logoLink = '/',
  showAuthButtons = true,
  currentPage = 'home'
}: ResponsiveNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex-shrink-0">
            <Link href={logoLink} className="text-xl font-bold text-emerald-800">
              {logo}
            </Link>
          </div>
          
          {/* Center Menu - Desktop Only */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/produk" className="text-lg font-medium text-gray-700 hover:text-emerald-900 transition-colors">
              Produk
            </Link>
            <button 
              onClick={() => {
                const footer = document.getElementById('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-lg font-medium text-gray-700 hover:text-emerald-900 transition-colors"
            >
              Bantuan
            </button>
          </div>
          
          {/* Right Section - Auth Buttons + Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700 hover:text-emerald-900 transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Desktop Auth Buttons */}
            {showAuthButtons && (
              <div className="hidden md:flex items-center space-x-4">
                {/* <button className="p-2 rounded-full border border-emerald-300 hover:bg-emerald-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button> */}
                
                {(currentPage === 'login' || currentPage === 'masuk') ? (
                  <Link href="/daftar">
                    <span className="px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer text-emerald-300">
                      Daftar
                    </span>
                  </Link>
                ) : (currentPage === 'register' || currentPage === 'daftar') ? (
                  <Link href="/masuk">
                    <span className="px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer text-emerald-300">
                      Masuk
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link href="/masuk">
                      <span className="px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer text-emerald-300">
                        Masuk
                      </span>
                    </Link>
                    <Link href="/daftar">
                      <span className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer">
                        Daftar
                      </span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <Link 
                href="/produk" 
                className="block text-lg font-medium text-gray-700 hover:text-emerald-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Produk
              </Link>
              <button 
                onClick={() => {
                  const footer = document.getElementById('footer');
                  if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-lg font-medium text-gray-700 hover:text-emerald-900 transition-colors py-2"
              >
                Bantuan
              </button>
              
              {/* Mobile Auth Buttons */}
              {showAuthButtons && (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  {currentPage === 'login' ? (
                    <Link href="/daftar" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="block w-full text-center px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer">
                        Daftar
                      </span>
                    </Link>
                  ) : currentPage === 'register' ? (
                    <Link href="/masuk" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="block w-full text-center px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer">
                        Masuk
                      </span>
                    </Link>
                  ) : (
                    <>
                      <Link href="/masuk" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="block w-full text-center px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer">
                          Masuk
                        </span>
                      </Link>
                      <Link href="/daftar" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer">
                          Daftar
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
