import Link from 'next/link';

interface StandaloneNavbarProps {
  showAuthButtons?: boolean;
  currentPage?: 'login' | 'register' | 'home' | 'dashboard';
  logo?: string;
  logoLink?: string;
}

export default function StandaloneNavbar({ 
  showAuthButtons = true, 
  currentPage = 'home',
  logo = 'MarketplaceTS',
  logoLink = '/dashboard'
}: StandaloneNavbarProps) {
  return (
    <nav className="bg-white border-b border-emerald-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={logoLink} className="text-xl font-bold text-emerald-800">
            {logo}
          </Link>
        </div>
        
        {/* Center Menu */}
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
        
        {showAuthButtons && (
          <div className="flex items-center space-x-4">
            {/* <button className="p-2 rounded-full border border-emerald-300 hover:bg-emerald-50 transition-colors text-emerald-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button> */}
            
            {currentPage === 'login' ? (
              <Link href="/daftar">
                <span className="px-4 py-2 border border-emerald-300 rounded-full text-sm font-medium bg-white hover:bg-emerald-50 transition-colors cursor-pointer text-emerald-300">
                  Daftar
                </span>
              </Link>
            ) : currentPage === 'register' ? (
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
    </nav>
  );
}
