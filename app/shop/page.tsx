'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCategories, getProducts } from '@/lib/supabase/api';
import { Category, Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategorySlug = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts({ activeOnly: true }),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed loading shop catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${slug}`);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by Category
    if (activeCategorySlug !== 'all') {
      const cat = categories.find((c) => c.slug === activeCategorySlug);
      if (cat) {
        list = list.filter((p) => p.category_id === cat.id);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // featured / default
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  }, [products, categories, activeCategorySlug, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-800 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Bespoke Design Collection</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-obsidian-950">
          Digital Products Storefront
        </h1>
        <p className="text-obsidian-800/75 text-base leading-relaxed">
          Choose a design below and customize it with your specific text (names, dates, location, & notes) before placing your order.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-6 pt-4">
        
        {/* Top Controls: Search Bar & Sort Dropdown */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/50" />
            <input
              type="text"
              placeholder="Search products or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-rose-200/80 text-sm text-obsidian-900 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-800/50 hover:text-obsidian-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-obsidian-800/70 font-medium flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-2xl bg-white border border-rose-200/80 text-xs font-semibold text-obsidian-900 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeCategorySlug === 'all'
                ? 'bg-obsidian-900 text-cream-50 shadow-md'
                : 'bg-white/80 text-obsidian-800 hover:bg-rose-100/70 border border-rose-200/60'
            }`}
          >
            All Products ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            const isSelected = activeCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-white/80 text-obsidian-800 hover:bg-rose-100/70 border border-rose-200/60'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-cream-200/50 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-cream-100/50 rounded-3xl border border-rose-200/60 space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold font-serif">
            !
          </div>
          <h3 className="font-serif text-2xl font-bold text-obsidian-900">No products found</h3>
          <p className="text-xs text-obsidian-800/70">
            No design products match your current search or category filter. Try clearing filters or searching another keyword.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('all');
            }}
            className="px-6 py-2.5 rounded-2xl bg-obsidian-900 text-cream-50 text-xs font-semibold hover:bg-rose-600 transition-colors shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-obsidian-800/70 font-medium">Loading studio catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
