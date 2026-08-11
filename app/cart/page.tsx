'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/utils';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Sparkles, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
          Your Cart is Empty
        </h1>
        <p className="text-obsidian-800/75 text-sm max-w-md mx-auto leading-relaxed">
          You haven't added any custom digital design items to your shopping cart yet. Browse our boutique collections to get started.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-obsidian-900 text-cream-50 text-xs font-semibold hover:bg-rose-600 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 text-rose-300" />
          <span>Explore Design Storefront</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-rose-200/60 pb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
            Shopping Cart
          </h1>
          <p className="text-xs text-obsidian-800/70 mt-1">
            Review your custom order details before proceeding to guest checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Item List */}
        <div className="lg:col-span-8 space-y-6">
          {items.map((item) => {
            const product = item.product;
            const mainImg = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop';
            const customKeys = Object.keys(item.customFieldValues || {});

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-rose-200/80 shadow-soft space-y-4 relative"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-28 aspect-[4/3] rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shrink-0">
                    <Image src={mainImg} alt={product.name} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-xl font-bold text-obsidian-900">
                        {product.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-obsidian-800/40 hover:text-rose-600 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-rose-700 font-serif">
                      {formatPKR(product.price)} each
                    </div>

                    {/* Submitted Custom Field Values Badge List */}
                    {customKeys.length > 0 && (
                      <div className="p-3 rounded-2xl bg-cream-100/70 border border-cream-300/60 space-y-1 mt-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-rose-500" />
                          Submitted Custom Text:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-obsidian-800">
                          {customKeys.map((key) => (
                            <div key={key} className="truncate">
                              <span className="font-semibold text-obsidian-950">{key}:</span>{' '}
                              <span className="text-obsidian-800">
                                {item.customFieldValues[key] || '(blank)'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity & Subtotal bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-rose-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-obsidian-800/70">Qty:</span>
                        <div className="flex items-center gap-2 border border-rose-200 rounded-xl px-2 py-1 bg-cream-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-obsidian-800 hover:text-rose-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-obsidian-800 hover:text-rose-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-obsidian-800/50 block">Subtotal</span>
                        <span className="font-serif text-lg font-bold text-obsidian-950">
                          {formatPKR(product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-white border border-rose-200/80 shadow-soft space-y-6">
          <h3 className="font-serif text-xl font-bold text-obsidian-950 border-b border-rose-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-obsidian-800/80">
              <span>Items Total ({items.length})</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-obsidian-800/80">
              <span>Designer Fulfillment</span>
              <span className="text-sage-700 font-semibold text-xs bg-sage-100 px-2.5 py-0.5 rounded-full">Included</span>
            </div>
            <div className="border-t border-rose-100 pt-3 flex items-center justify-between text-base font-bold text-obsidian-950">
              <span>Total Payable</span>
              <span className="font-serif text-2xl text-rose-700">{formatPKR(subtotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 rounded-2xl bg-obsidian-900 hover:bg-rose-700 text-cream-50 font-semibold text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-rose-300" />
          </Link>

          <p className="text-[11px] text-obsidian-800/60 text-center leading-relaxed">
            Guest checkout. No credit card required now. Payment details (JazzCash/Easypaisa/Bank) provided upon order confirmation.
          </p>
        </div>

      </div>

    </div>
  );
}
