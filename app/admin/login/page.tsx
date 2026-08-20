'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TurnstileWidget from '@/components/TurnstileWidget';
import { Lock, Mail, KeyRound, ArrowLeft, Sparkles } from 'lucide-react';

import { validateAdminLoginInput } from '@/lib/validation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const validation = validateAdminLoginInput(email, password);
    if (!validation.isValid) {
      setErrorMsg(Object.values(validation.errors)[0]);
      setLoading(false);
      return;
    }

    const siteKeyConfigured =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.includes('your-turnstile-site-key');

    // Require bot protection verification if Turnstile site key is configured
    if (siteKeyConfigured && !captchaToken) {
      setErrorMsg('Please complete the bot protection verification check.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
          options: {
            captchaToken: captchaToken || undefined,
          },
        });

        if (error) {
          const isRateLimited =
            error.status === 429 ||
            error.message?.toLowerCase().includes('rate limit') ||
            error.message?.toLowerCase().includes('too many requests');

          if (isRateLimited) {
            setErrorMsg('Too many login attempts. Please wait 5 minutes before trying again.');
          } else {
            setErrorMsg(error.message || 'Invalid admin credentials. Please enter email & password.');
          }
          setLoading(false);
          return;
        }

        router.push('/admin/orders');
        return;
      }

      setErrorMsg('Invalid admin credentials. Please enter email & password.');
      setLoading(false);
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.toLowerCase().includes('rate limit')) {
        setErrorMsg('Too many login attempts. Please wait 5 minutes before trying again.');
      } else {
        setErrorMsg('An unexpected error occurred during login. Please try again.');
      }
      setLoading(false);
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

            {/* Cloudflare Turnstile Bot Protection Widget */}
            <TurnstileWidget
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />

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
