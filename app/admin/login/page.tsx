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
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center px-4 py-12">
      
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {/* Brand Top Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-cream-50 p-2 flex items-center justify-center mx-auto shadow-2xl border border-rose-200">
            <Image
              src="/logo.png"
              alt="Petal & Ink Logo"
              width={56}
              height={56}
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif text-3xl font-bold text-cream-50">
            Petal & Ink Admin Portal
          </h1>
          <p className="text-xs text-cream-200/60">
            Sign in to manage custom design products, customer orders, categories, and studio settings.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-8 rounded-3xl bg-obsidian-900 border border-rose-400/20 shadow-2xl space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-cream-200">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-200/40" />
                <input
                  type="email"
                  required
                  placeholder="admin@petal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-obsidian-950 border border-rose-400/20 text-cream-50 text-sm focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-cream-200">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-200/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-obsidian-950 border border-rose-400/20 text-cream-50 text-sm focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
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
          <div className="p-4 rounded-2xl bg-obsidian-950/70 border border-rose-400/10 text-[11px] text-cream-200/60 space-y-1 text-center">
            <span className="text-rose-300 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Demo Access Mode Enabled
            </span>
            <p>Enter any email/password to sign into the admin preview dashboard.</p>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-cream-200/60 hover:text-cream-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Storefront</span>
          </a>
        </div>

      </div>

    </div>
  );
}
