'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, KeyRound, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!error) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('petal_admin_auth', 'true');
          }
          router.push('/admin/orders');
          return;
        }
      }

      // Demo login fallback credentials
      if ((email.trim().toLowerCase() === 'admin@petal.com' && password === 'admin123') || (email.trim().length > 0 && password.length >= 4)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('petal_admin_auth', 'true');
        }
        router.push('/admin/orders');
      } else {
        setErrorMsg('Invalid admin credentials. Please enter email & password.');
        setLoading(false);
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('petal_admin_auth', 'true');
      }
      router.push('/admin/orders');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      {/* Background Soft Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-rose-200/40 via-cream-200/50 to-sage-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        
        {/* Brand Top Header */}
        <div className="text-center space-y-3">
          <Image
            src="/logo.png"
            alt="Petal & Ink Logo"
            width={64}
            height={64}
            unoptimized
            style={{ background: 'transparent' }}
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto object-contain bg-transparent border-0 outline-none"
          />
          <h1 className="font-serif text-3xl font-bold text-obsidian-950">
            Petal & Ink Admin Portal
          </h1>
          <p className="text-xs text-obsidian-800/70">
            Sign in to manage custom design products, customer orders, categories, and studio settings.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-xl space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-obsidian-900">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="email"
                  required
                  placeholder="admin@petal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50/80 border border-rose-200/80 text-obsidian-950 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-obsidian-800/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-obsidian-900">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50/80 border border-rose-200/80 text-obsidian-950 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-obsidian-800/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Note */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-[11px] text-rose-900 space-y-1 text-center">
            <span className="text-rose-700 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Demo Access Mode Enabled
            </span>
            <p>Enter any email/password to sign into the admin preview dashboard.</p>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-obsidian-800/70 hover:text-rose-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Storefront</span>
          </a>
        </div>

      </div>

    </div>
  );
}
