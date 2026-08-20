'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getSiteSettings } from '@/lib/supabase/api';
import { SiteSettings } from '@/types/database';
import {
  ShoppingBag,
  Grid,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setSiteSettings(s);
    });

    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      const supabase = createClient();
      let hasSession = false;
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) hasSession = true;
        } catch (err) {}
      }

      if (hasSession) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // If on login page, render full screen without dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show a warm loading spinner while checking security credentials
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-obsidian-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-obsidian-800/70 font-mono uppercase tracking-wider">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('petal_admin_auth');
    }
    const supabase = createClient();
    if (supabase) supabase.auth.signOut();
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Customer Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products Management', href: '/admin/products', icon: Package },
    { name: 'Categories Manager', href: '/admin/categories', icon: Grid },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  const logoSrc = siteSettings?.logo_url || '/logo.png';
  const brandName = siteSettings?.brand_name || 'Petal & Ink';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-obsidian-950 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-cream-100/90 backdrop-blur-md border-b border-rose-200/60 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={logoSrc}
            alt="Logo"
            width={32}
            height={32}
            unoptimized
            style={{ background: 'transparent' }}
            className="w-8 h-8 object-contain shrink-0 bg-transparent border-0 outline-none"
          />
          <span className="font-serif font-bold text-lg text-obsidian-950">{brandName} Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-obsidian-800/70 hover:text-obsidian-950"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-cream-100/80 backdrop-blur-md border-r border-rose-200/60 p-6 flex flex-col justify-between shrink-0`}
      >
        <div className="space-y-8">
          
          {/* Studio Brand */}
          <div className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt="Logo"
              width={40}
              height={40}
              unoptimized
              style={{ background: 'transparent' }}
              className="w-10 h-10 object-contain shrink-0 bg-transparent border-0 outline-none"
            />
            <div>
              <span className="font-serif font-bold text-lg text-obsidian-950 block">{brandName}</span>
              <span className="text-[10px] text-rose-700 uppercase tracking-widest font-semibold block">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (pathname === '/admin' && item.href === '/admin/orders');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'text-obsidian-800/70 hover:text-obsidian-950 hover:bg-rose-50/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6 border-t border-rose-200/60">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white text-xs font-medium text-obsidian-800 hover:text-rose-700 transition-colors border border-rose-200/80 shadow-sm"
          >
            <span>Live Storefront Preview</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-100/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
