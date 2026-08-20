'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Sparkles, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getSiteSettings } from '@/lib/supabase/api';
import { SiteSettings } from '@/types/database';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { itemCount, toastMessage, dismissToast } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    contact_email: 'efaisal375@gmail.com',
    brand_name: 'Petal & Ink',
    tagline: 'Custom Bespoke Digital Design Studio',
    logo_url: '/logo.png',
  });

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings((prev) => ({ ...prev, ...s, logo_url: s.logo_url || '/logo.png' }));
    });
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return null; // Admin has its own dedicated dashboard layout
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop Storefront', href: '/shop' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Admin Portal', href: '/admin' },
  ];

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slide-up bg-obsidian-900 text-cream-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-300/30">
          <Sparkles className="w-5 h-5 text-rose-300 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={dismissToast}
            className="ml-2 text-rose-200 hover:text-white text-xs underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Floating Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-rose-200/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link href="/" data-tour="storefront-brand" className="flex items-center gap-3 group">
            <Image
              src={settings.logo_url || '/logo.png'}
              alt="Petal & Ink Logo"
              width={42}
              height={42}
              unoptimized
              style={{ background: 'transparent' }}
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 group-hover:scale-105 transition-transform duration-300 bg-transparent border-0 outline-none"
            />
            <div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-obsidian-900 block group-hover:text-rose-700 transition-colors">
                {settings.brand_name}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-rose-600 font-medium block">
                Digital Design Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav data-tour="storefront-nav" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-rose-700 font-semibold'
                      : 'text-obsidian-800 hover:text-rose-600 font-medium'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400 rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* WhatsApp Contact quick pill */}
            <a
              href="https://wa.me/?text=Hello%20Petal%20%26%20Ink%2C%20I%20have%20an%20inquiry%20about%20a%20custom%20design."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-sage-100 text-sage-800 border border-sage-200 hover:bg-sage-200 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sage-600" />
              <span>WhatsApp Inquiry</span>
            </a>

            {/* Cart Icon Link */}
            <Link
              href="/cart"
              data-tour="storefront-cart"
              className="relative p-2.5 rounded-full bg-cream-200/80 hover:bg-rose-100/80 text-obsidian-900 transition-colors border border-rose-200/50"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5.5 h-5.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-obsidian-800 hover:bg-cream-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cream-50 border-b border-rose-200/60 px-6 py-6 space-y-4 animate-slide-up shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-obsidian-800 hover:text-rose-700 py-1"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-rose-200/50">
              <a
                href="https://wa.me/?text=Hello%20Petal%20%26%20Ink%2C%20I%20have%20an%20inquiry%20about%20a%20custom%20design."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sage-700 text-white font-medium text-sm shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Designer on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
