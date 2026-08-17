'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, PhoneCall, Heart, Sparkles } from 'lucide-react';
import { getSiteSettings } from '@/lib/supabase/api';
import { SiteSettings } from '@/types/database';

export const Footer: React.FC = () => {
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

  return (
    <footer className="bg-obsidian-900 text-cream-100 border-t border-rose-900/30 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-obsidian-800">
          
          {/* Brand Intro */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={settings.logo_url || '/logo.png'}
                alt="Petal & Ink Logo"
                width={40}
                height={40}
                unoptimized
                style={{ background: 'transparent' }}
                className="w-10 h-10 object-contain shrink-0 bg-transparent border-0 outline-none"
              />
              <span className="font-serif text-2xl font-bold text-cream-50 tracking-tight">
                {settings.brand_name}
              </span>
            </div>
            <p className="text-cream-200/80 text-sm leading-relaxed max-w-md">
              {settings.tagline || 'Bespoke custom digital design products. Every card and invitation is tailored individually to your specifications.'}
            </p>
            <div className="p-4 rounded-2xl bg-obsidian-800/80 border border-rose-300/10 space-y-1">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                <span>Handcrafted Studio</span>
              </div>
              <p className="text-xs text-cream-200/70 leading-relaxed">
                We take your exact custom details and create polished, high-resolution digital design files delivered straight to your WhatsApp or email.
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-rose-200">Explore Shop</h4>
            <ul className="space-y-2 text-sm text-cream-200/70">
              <li>
                <Link href="/shop" className="hover:text-rose-300 transition-colors">
                  All Products Catalog
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wedding-invitations" className="hover:text-rose-300 transition-colors">
                  Wedding Invitations
                </Link>
              </li>
              <li>
                <Link href="/shop?category=greeting-cards" className="hover:text-rose-300 transition-colors">
                  Greeting Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-rose-200">Contact Studio</h4>
            <div className="space-y-3 text-sm text-cream-200/80">
              <a
                href={`mailto:${settings.contact_email}`}
                className="flex items-center gap-2.5 hover:text-rose-300 transition-colors break-all"
              >
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{settings.contact_email}</span>
              </a>
              <a
                href="https://wa.me/?text=Hello%20Petal%20%26%20Ink%2C%20I%20have%20an%20order%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sage-300 hover:text-white transition-colors"
              >
                <PhoneCall className="w-4 h-4 shrink-0 text-sage-400" />
                <span>WhatsApp Direct Support</span>
              </a>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-block text-xs px-3 py-1.5 rounded-lg bg-obsidian-800 text-rose-300 border border-rose-400/20 hover:bg-rose-950 transition-colors"
                >
                  Admin Portal Login
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-200/50 gap-4">
          <p>© {new Date().getFullYear()} {settings.brand_name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> for elegant moments.
          </p>
        </div>
      </div>
    </footer>
  );
};
