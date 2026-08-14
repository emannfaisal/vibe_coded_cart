'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getProducts, getSiteSettings } from '@/lib/supabase/api';
import { Category, Product, SiteSettings } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  PenTool,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    contact_email: 'efaisal375@gmail.com',
    brand_name: 'Petal & Ink',
    tagline: 'Crafted with Elegance. Delivered with Love.',
    logo_url: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, setts] = await Promise.all([
          getCategories(),
          getProducts({ activeOnly: true }),
          getSiteSettings(),
        ]);
        setCategories(cats);
        // Take featured products, or first 3 active products
        const featured = prods.filter((p) => p.is_featured);
        setFeaturedProducts(featured.length > 0 ? featured : prods.slice(0, 3));
        if (setts) setSettings(setts);
      } catch (e) {
        console.error('Error loading homepage data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const mainFeatured = featuredProducts[0];
  const mainImage = mainFeatured?.image_urls?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop';

  return (
    <div className="space-y-24 pb-12">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Soft Background Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-200/40 via-cream-200/50 to-sage-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 text-xs font-semibold tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Bespoke Digital Artistry</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-obsidian-950 leading-[1.15]">
                Custom Design Creations <br />
                <span className="italic font-normal text-rose-700 font-serif">Tailored for Your Moments</span>
              </h1>

              <p className="text-obsidian-800/80 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {settings.tagline || 'Exquisite custom-made wedding invitations, greeting cards, and bespoke digital stationery. Handcrafted individually by our studio.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-obsidian-900 text-cream-50 hover:bg-rose-600 text-sm font-semibold tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Explore Shop Catalog</span>
                  <ArrowRight className="w-4 h-4 text-rose-300" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-cream-200/80 hover:bg-rose-100 text-obsidian-900 border border-rose-200/70 text-sm font-semibold transition-all"
                >
                  <span>How Custom Ordering Works</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-rose-200/50 grid grid-cols-3 gap-4 text-left max-w-xl mx-auto lg:mx-0">
                <div>
                  <span className="font-serif text-xl font-bold text-obsidian-900 block">100%</span>
                  <span className="text-xs text-obsidian-800/70">Custom Tailored Text</span>
                </div>
                <div>
                  <span className="font-serif text-xl font-bold text-obsidian-900 block">Fast</span>
                  <span className="text-xs text-obsidian-800/70">WhatsApp Delivery</span>
                </div>
                <div>
                  <span className="font-serif text-xl font-bold text-obsidian-900 block">PKR</span>
                  <span className="text-xs text-obsidian-800/70">Manual Local Payments</span>
                </div>
              </div>
            </div>

            {/* Right Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none aspect-[105/148] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 transform rotate-1 hover:rotate-0 transition-transform duration-500 bg-rose-50/50 p-4 flex items-center justify-center">
                <Image
                  src={mainImage}
                  alt={mainFeatured?.name || "Petal & Ink Wedding Invitation Showcase"}
                  fill
                  priority
                  unoptimized
                  className="object-contain p-2"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl glass-panel text-obsidian-900 space-y-1 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Featured Design</span>
                  <h3 className="font-serif text-lg font-bold">{mainFeatured?.name || 'Ethereal Botanical Wedding Suite'}</h3>
                  <p className="text-xs text-obsidian-800/80">Customized with Bride & Groom names, date & venue details.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-600">Curated Collections</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
            Browse Design Categories
          </h2>
          <p className="text-obsidian-800/70 text-sm">
            Select a collection below to view products tailored specifically for your celebration or business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-soft hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-6 border border-rose-100"
            >
              <Image
                src={cat.image_url || '/images/thank-you-greeting-card.png'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/85 via-obsidian-950/30 to-transparent group-hover:from-obsidian-950/95 transition-colors" />

              <div className="relative z-10 space-y-1">
                <h3 className="font-serif text-xl font-bold text-cream-50 group-hover:text-rose-200 transition-colors">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-300">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-600">Popular Creations</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950 mt-1">
              Featured Custom Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors"
          >
            <span>View All Storefront Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-obsidian-800/60 font-medium">
            Loading products catalog...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-600">Seamless & Personal</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
            How Custom Ordering Works
          </h2>
          <p className="text-obsidian-800/70 text-sm">
            We don't do instant cookie-cutter downloads. Every design is custom built by our lead designer with your personal text details.
          </p>
        </div>

        {/* Grid divider layout format matching reference image */}
        <div className="bg-[#f6f4ee] border-y border-rose-900/15 rounded-2xl overflow-hidden shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-rose-900/15">
            
            {/* Step 1 */}
            <div className="p-6 sm:p-8 flex flex-col justify-start space-y-3 bg-[#f6f4ee] hover:bg-[#f2efe5] transition-colors">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700/80">
                STEP 01
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-obsidian-950 leading-snug">
                Browse & Select
              </h3>
              <p className="text-xs text-obsidian-800/75 leading-relaxed font-sans">
                Explore our boutique catalog and pick the invitation or greeting card design you love.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 sm:p-8 flex flex-col justify-start space-y-3 bg-[#f6f4ee] hover:bg-[#f2efe5] transition-colors">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700/80">
                STEP 02
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-obsidian-950 leading-snug">
                Fill Custom Text
              </h3>
              <p className="text-xs text-obsidian-800/75 leading-relaxed font-sans">
                Provide names, dates, venue, or special messaging in the dynamic product customization form before adding to cart.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 sm:p-8 flex flex-col justify-start space-y-3 bg-[#f6f4ee] hover:bg-[#f2efe5] transition-colors">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700/80">
                STEP 03
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-obsidian-950 leading-snug">
                Guest Checkout
              </h3>
              <p className="text-xs text-obsidian-800/75 leading-relaxed font-sans">
                Enter your contact details (WhatsApp phone & optional email) to place your pending order. No account login needed.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 sm:p-8 flex flex-col justify-start space-y-3 bg-[#f6f4ee] hover:bg-[#f2efe5] transition-colors">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700/80">
                STEP 04
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-obsidian-950 leading-snug">
                Confirm Payment
              </h3>
              <p className="text-xs text-obsidian-800/75 leading-relaxed font-sans">
                Email or WhatsApp us to transfer payment (JazzCash, Easypaisa, or Bank Transfer) with your order reference.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-6 sm:p-8 flex flex-col justify-start space-y-3 bg-[#f6f4ee] hover:bg-[#f2efe5] transition-colors">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700/80">
                STEP 05
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-obsidian-950 leading-snug">
                Receive Final Design
              </h3>
              <p className="text-xs text-obsidian-800/75 leading-relaxed font-sans">
                Our designer hand-crafts your high-resolution custom files and delivers them directly via WhatsApp/email!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Boutique Promise Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-obsidian-900 text-cream-50 flex flex-col md:flex-row items-center justify-between gap-8 border border-rose-900/40 shadow-2xl">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-300">Have a custom inquiry?</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Need a completely bespoke design concept?
            </h3>
            <p className="text-cream-200/80 text-sm">
              We also create custom colorways, custom stationery sets, and bespoke web interfaces upon request.
            </p>
          </div>
          <a
            href={`mailto:${settings.contact_email}?subject=Bespoke%20Design%20Inquiry%20-%20Petal%20%26%20Ink`}
            className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-all shadow-lg shrink-0"
          >
            Email Studio Directly
          </a>
        </div>
      </section>

    </div>
  );
}
