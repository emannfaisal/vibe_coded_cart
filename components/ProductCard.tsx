'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { formatPKR } from '@/lib/utils';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const mainImage = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop';
  const customFieldCount = product.custom_fields?.length || 0;

  return (
    <div className="group rounded-3xl glass-card overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 flex flex-col h-full border border-rose-200/50 hover:border-rose-300">
      
      {/* 105mm x 148mm A6 Card Portrait Frame */}
      <div className="relative aspect-[105/148] w-full overflow-hidden bg-rose-50/40 p-4 border-b border-rose-100/70 flex items-center justify-center">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Category Pill */}
        {product.category && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium bg-white/90 text-obsidian-800 backdrop-blur-md border border-rose-100 shadow-sm z-10">
            {product.category.name}
          </span>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white backdrop-blur-md shadow-sm flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-obsidian-900 group-hover:text-rose-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-obsidian-800/70 text-xs mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-600 font-semibold tracking-wider uppercase block">Price</span>
            <span className="font-serif text-lg font-bold text-obsidian-900">
              {formatPKR(product.price)}
            </span>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-obsidian-900 text-cream-50 hover:bg-rose-600 text-xs font-semibold tracking-wide transition-all shadow-md group-hover:translate-x-0.5"
          >
            <span>Customize</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-300" />
          </Link>
        </div>

        {/* Customization tag */}
        <div className="text-[11px] text-sage-700 bg-sage-50 px-3 py-1 rounded-xl flex items-center justify-between border border-sage-200/60">
          <span>Custom fields required:</span>
          <span className="font-bold">{customFieldCount} field{customFieldCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

    </div>
  );
};
