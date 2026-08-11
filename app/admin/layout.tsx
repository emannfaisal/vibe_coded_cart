'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
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

  useEffect(() => {
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

      const localAuth = typeof window !== 'undefined' ? localStorage.getItem('petal_admin_auth') : null;
      if (hasSession || localAuth === 'true') {
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

  // Show a dark loading spinner while checking security credentials
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Verifying Admin Access...</span>
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
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Customer Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products Management', href: '/admin/products', icon: Package },
    { name: 'Categories Manager', href: '/admin/categories', icon: Grid },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Petal & Ink Logo"
              width={32}
              height={32}
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-serif font-bold text-lg text-white">Petal & Ink Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0`}
      >
        <div className="space-y-8">
          
          {/* Studio Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 p-1.5 flex items-center justify-center shadow-lg">
              <Image
                src="/logo.png"
                alt="Petal & Ink Logo"
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white block">Petal & Ink</span>
              <span className="text-[10px] text-rose-400 uppercase tracking-widest font-semibold block">
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
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 text-xs font-medium text-slate-300 hover:text-white transition-colors border border-slate-800"
          >
            <span>Live Storefront Preview</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/50 transition-colors"
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
