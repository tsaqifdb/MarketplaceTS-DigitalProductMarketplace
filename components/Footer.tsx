import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-gradient-to-br from-slate-50 to-emerald-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-emerald-700 mb-4">MarketplaceTS</h3>
            <p className="text-slate-600 mb-4">Marketplace produk digital terpercaya dengan kurasi terbaik.</p>
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors duration-300 cursor-pointer">
                <span className="text-emerald-600 font-semibold">F</span>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors duration-300 cursor-pointer">
                <span className="text-emerald-600 font-semibold">T</span>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors duration-300 cursor-pointer">
                <span className="text-emerald-600 font-semibold">I</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Produk</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  Buku Digital
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  E-Course
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  Template Design
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  Seller Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  Bantuan
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="w-4 h-4 text-emerald-600 mr-2" />
                <a href="mailto:info@marketplace-ts.com" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  info@marketplace-ts.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 text-emerald-600 mr-2" />
                <a href="tel:+62123456789" className="text-slate-600 hover:text-emerald-700 transition-colors duration-300">
                  +62 123 456 789
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 text-emerald-600 mr-2 mt-1" />
                <span className="text-slate-600">
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 mt-8 pt-8 text-center">
          <p className="text-slate-500">© 2025 MarketplaceTS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
