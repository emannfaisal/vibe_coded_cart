'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TurnstileWidget from '@/components/TurnstileWidget';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { validateAdminLoginInput } from '@/lib/validation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real-time error calculations
  const getEmailError = (): string | null => {
    const clean = email.trim();
    if (!clean) return 'Email address is required.';
    if (!EMAIL_REGEX.test(clean)) return 'Please enter a valid email address (e.g., admin@petal.com).';
    return null;
  };

  const getPasswordError = (): string | null => {
    if (!password) return 'Password is required.';
    if (password.length < 8)
      return `Password must be at least 8 characters long (currently ${password.length}/8).`;
    return null;
  };

  const emailError = getEmailError();
  const passwordError = getPasswordError();

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErrorMsg(null);

    const validation = validateAdminLoginInput(email, password);
    if (!validation.isValid) {
      setErrorMsg(Object.values(validation.errors)[0]);
      return;
    }

    const siteKeyConfigured =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.includes('your-turnstile-site-key');

    // Require bot protection verification if Turnstile site key is configured
    if (siteKeyConfigured && !captchaToken) {
      setErrorMsg('Please complete the bot protection verification check.');
      return;
    }

    setLoading(true);

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

          const isCaptchaTokenMissing =
            error.message?.toLowerCase().includes('no captcha_token found') ||
            error.message?.toLowerCase().includes('captcha protection');

          if (isRateLimited) {
            setErrorMsg('Too many login attempts. Please wait 5 minutes before trying again.');
          } else if (isCaptchaTokenMissing) {
            setErrorMsg(
              'CAPTCHA bot protection is active on Supabase. Please add NEXT_PUBLIC_TURNSTILE_SITE_KEY to Vercel Environment Variables.'
            );
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
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            {/* Email Field with Real-time Validation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-obsidian-900">Email Address</label>
                {touched.email && !emailError && email.length > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    touched.email && emailError
                      ? 'text-rose-500'
                      : touched.email && !emailError && email.length > 0
                      ? 'text-emerald-500'
                      : 'text-obsidian-800/40'
                  }`}
                />
                <input
                  type="email"
                  placeholder="admin@petal.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
                  }}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all outline-none ${
                    touched.email && emailError
                      ? 'bg-rose-50/40 border-2 border-rose-500/80 text-rose-950 placeholder:text-rose-300 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                      : touched.email && !emailError && email.length > 0
                      ? 'bg-emerald-50/20 border border-emerald-500/80 text-obsidian-950 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                      : 'bg-cream-50/80 border border-rose-200/80 text-obsidian-950 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                  }`}
                />
              </div>

              {/* Real-time Inline Red Error for Email */}
              {touched.email && emailError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field with Real-time Validation & Strength Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-obsidian-900">Password</label>
                {touched.password && !passwordError && password.length >= 8 && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Minimum met
                  </span>
                )}
              </div>
              <div className="relative">
                <KeyRound
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    touched.password && passwordError
                      ? 'text-rose-500'
                      : touched.password && !passwordError && password.length >= 8
                      ? 'text-emerald-500'
                      : 'text-obsidian-800/40'
                  }`}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
                  }}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all outline-none ${
                    touched.password && passwordError
                      ? 'bg-rose-50/40 border-2 border-rose-500/80 text-rose-950 placeholder:text-rose-300 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                      : touched.password && !passwordError && password.length >= 8
                      ? 'bg-emerald-50/20 border border-emerald-500/80 text-obsidian-950 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                      : 'bg-cream-50/80 border border-rose-200/80 text-obsidian-950 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                  }`}
                />
              </div>

              {/* Real-time Inline Red Error for Password */}
              {touched.password && passwordError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Real-time Password Requirement Progress Bar */}
              {touched.password && (
                <div className="space-y-1 pt-1.5">
                  <div className="flex justify-between items-center text-[11px] font-medium text-obsidian-800/70">
                    <span>Required Length (Min 8 Chars)</span>
                    <span
                      className={
                        password.length >= 8
                          ? 'text-emerald-600 font-semibold'
                          : 'text-rose-600 font-semibold'
                      }
                    >
                      {password.length}/8 characters
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        password.length >= 8 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (password.length / 8) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cloudflare Turnstile Bot Protection Widget */}
            <TurnstileWidget
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
