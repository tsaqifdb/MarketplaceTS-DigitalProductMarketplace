"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileText,
  ClipboardList,
  Ticket,
  User,
  Settings,
  Package,
  Home,
  Folder,
  Zap,
  ShoppingCart
} from 'lucide-react';
import { ReactElement } from 'react';

interface SidebarProps {
  userRole?: 'admin' | 'seller' | 'user' | 'curator';
}

interface MenuItem {
  label: string;
  href: string;
  icon: ReactElement;
  hasSubmenu?: boolean;
}

export default function Sidebar({ userRole = 'user' }: SidebarProps) {
  const pathname = usePathname();
  
  const adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <BarChart3 size={18} /> },
    { label: 'Manajemen Akun', href: '/user-management', icon: <User size={18} /> },
    { label: 'Manajemen Produk', href: '/admin/produk', icon: <Package size={18} /> },
  ];

  const sellerMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/seller', icon: <BarChart3 size={18} /> },
    { label: 'Produk', href: '/seller/produk/galeri', icon: <Package size={18} />, hasSubmenu: true },
    { label: 'Review Produk', href: '/seller/review', icon: <FileText size={18} /> },
  ];

  const userMenuItems: MenuItem[] = [
    { label: 'Beranda', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'Kategori', href: '/produk', icon: <Folder size={18} />, hasSubmenu: true },
    // { label: 'Aktivitas', href: '/aktivitas', icon: <Zap size={18} /> },
    { label: 'Keranjang', href: '/keranjang', icon: <ShoppingCart size={18} /> },
    { label: 'Pesanan Saya', href: '/pesanan-saya', icon: <ClipboardList size={18} /> },
  ];

  const curatorMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/curator', icon: <BarChart3 size={18} /> },
    { label: 'Review Produk', href: '/curator/cari-produk', icon: <FileText size={18} />, hasSubmenu: true },
    { label: 'Riwayat Penilaian', href: '/curator/riwayat-penilaian', icon: <ClipboardList size={18} /> },
    { label: 'Penukar Poin', href: '/curator/penukar-poin', icon: <Package size={18} /> },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return adminMenuItems;
      case 'curator':
        return curatorMenuItems;
      case 'seller':
        return sellerMenuItems;
      default:
        return userMenuItems;
    }
  };

  const getSubmenuItems = (mainItem: string) => {
    if (mainItem === 'Review Produk') {
      if (userRole === 'curator') {
        return [
          { label: 'Cari Produk', href: '/curator/cari-produk' },
          { label: 'Buku', href: '/curator/cari-produk?category=ebook' },
          { label: 'E-course', href: '/curator/cari-produk?category=ecourse' },
          { label: 'Resep Masakan', href: '/curator/cari-produk?category=resep_masakan' },
          { label: 'Jasa Design', href: '/curator/cari-produk?category=jasa_design' },
          { label: 'Software', href: '/curator/cari-produk?category=software' },
        ];
      } else {
        return [
          { label: 'Buku', href: '/admin/review-produk/buku' },
          { label: 'E-course', href: '/admin/review-produk/e-course' },
          { label: 'Resep Masakan', href: '/admin/review-produk/resep-masakan' },
          { label: 'Jasa Design', href: '/admin/review-produk/jasa-design' },
          { label: 'Software', href: '/admin/review-produk/software' },
        ];
      }
    }
    if (mainItem === 'Produk') {
      return [
        { label: 'Galeri Produk', href: '/seller/produk/galeri' },
        { label: 'Daftarkan Produk', href: '/seller/produk/daftarkan' },
        { label: 'Status Pengajuan', href: '/seller/produk/pengajuan' },
      ];
    }
    if (mainItem === 'Kategori') {
      return [
        { label: 'Buku', href: '/produk?category=ebook' },
        { label: 'E-course', href: '/produk?category=ecourse' },
        { label: 'Resep Masakan', href: '/produk?category=resep_masakan' },
        { label: 'Jasa Design', href: '/produk?category=jasa_design' },
        { label: 'Software', href: '/produk?category=software' },
      ];
    }
    return [];
  };

  return (
    <aside className="fixed left-4 top-20 w-64 h-[calc(100vh-6rem)] bg-white/95 backdrop-blur-xl border border-slate-200/60 p-5 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out z-40 overflow-y-auto">
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 mb-5 tracking-wide uppercase">Menu Utama</h3>
        <nav className="space-y-1.5">
          {getMenuItems().map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg border border-emerald-200/50 backdrop-blur-sm'
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-emerald-50/70 hover:to-teal-50/70 hover:text-emerald-700 hover:shadow-lg'
                }`}
              >
                <span className={`mr-3 transition-transform duration-300 ${pathname === item.href ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
              
              {item.hasSubmenu && (
                <div className="ml-7 mt-2 space-y-1">
                  {getSubmenuItems(item.label).map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                        pathname === subItem.href
                          ? 'bg-gradient-to-r from-emerald-25 to-teal-25 text-emerald-600 shadow-md border border-emerald-100/50'
                          : 'text-slate-500 hover:bg-gradient-to-r hover:from-emerald-25/60 hover:to-teal-25/60 hover:text-emerald-600'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-slate-500 mb-5 tracking-wide uppercase">Lainnya</h3>
        <nav className="space-y-1.5">
          <Link
            href={
              userRole === 'admin' ? '/admin/akun' :
              userRole === 'seller' ? '/seller/akun' :
              userRole === 'curator' ? '/curator/akun' :
              '/setelan-akun'
            }
            className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${
              pathname.includes('/akun') || pathname.includes('/setelan-akun')
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg border border-emerald-200/50 backdrop-blur-sm'
                : 'text-slate-600 hover:bg-gradient-to-r hover:from-emerald-50/70 hover:to-teal-50/70 hover:text-emerald-700 hover:shadow-lg'
            }`}
          >
            <span className={`mr-3 transition-transform duration-300 ${pathname.includes('/akun') || pathname.includes('/setelan-akun') ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}>
              <User size={18} />
            </span>
            Akun
          </Link>
          <Link
            href="#"
            className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${
              pathname === '#'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg border border-emerald-200/50 backdrop-blur-sm'
                : 'text-slate-600 hover:bg-gradient-to-r hover:from-emerald-50/70 hover:to-teal-50/70 hover:text-emerald-700 hover:shadow-lg'
            }`}
          >
            <span className={`mr-3 transition-transform duration-300 ${pathname === '#' ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}>
              <Settings size={18} />
            </span>
            Setingan
          </Link>
        </nav>
      </div>
    </aside>
  );
}
