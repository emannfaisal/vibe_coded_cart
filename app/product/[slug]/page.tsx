'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProductBySlug, getSiteSettings } from '@/lib/supabase/api';
import { Product, SiteSettings } from '@/types/database';
import { formatPKR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { validateCustomFields, sanitizeInput } from '@/lib/validation';
import {
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';

import Coachmarks, { TourTriggerButton, TourStep } from '@/components/Coachmarks';

const PRODUCT_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="product-gallery"]',
    title: 'High-Res Preview Gallery',
    description: 'Preview the digital invitation layout in 105mm x 148mm print format.',
  },
  {
    target: '[data-tour="product-custom-fields"]',
    title: 'Personalize Customization Text',
    description: 'Fill in your Bride & Groom names, event date, venue address, and special request notes.',
  },
  {
    target: '[data-tour="product-add-to-cart-btn"]',
    title: 'Add Customized Design to Cart',
    description: 'Validates required text fields and saves your custom order to your cart.',
  },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const paramsHook = useParams();
  const slug = params?.slug || (paramsHook?.slug as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customFormState, setCustomFormState] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isAdded, setIsAdded] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    async function loadProduct() {
      setLoading(true);
      try {
        const [prod, setts] = await Promise.all([
          getProductBySlug(slug),
          getSiteSettings(),
        ]);
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.image_urls?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop');
          
          // Pre-populate empty form state for each custom field
          const initialForm: Record<string, string> = {};
          prod.custom_fields?.forEach((field) => {
            initialForm[field.name] = '';
          });
          setCustomFormState(initialForm);
        }
        setSettings(setts);
      } catch (e) {
        console.error('Error loading product detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleInputChange = (fieldName: string, value: string) => {
    setCustomFormState((prev) => ({ ...prev, [fieldName]: value }));
    if (formErrors[fieldName]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const validation = validateCustomFields(product.custom_fields || [], customFormState);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // Sanitize all custom field values before adding to cart
    const sanitizedValues: Record<string, string> = {};
    Object.keys(customFormState).forEach((key) => {
      sanitizedValues[key] = sanitizeInput(customFormState[key]);
    });

    addItem(product, sanitizedValues, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-300 border-t-rose-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-obsidian-800/70">Loading custom design suite...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="font-serif text-3xl font-bold text-obsidian-900">Product Not Found</h2>
        <p className="text-sm text-obsidian-800/70">
          The requested product may have been archived or moved.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-obsidian-900 text-cream-50 text-xs font-semibold hover:bg-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Back Button Link */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-obsidian-800/70 hover:text-rose-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Large 105mm x 148mm Print Display Frame */}
          <div data-tour="product-gallery" className="relative aspect-[105/148] max-w-lg mx-auto w-full rounded-3xl overflow-hidden bg-rose-50/50 border border-rose-200/70 shadow-xl p-4 flex items-center justify-center">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              unoptimized
              className="object-contain p-2 transition-all duration-500"
            />
            {product.category && (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/90 text-obsidian-900 backdrop-blur-md border border-rose-200 shadow-md z-10">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Thumbnails list if multiple */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
              {product.image_urls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-[105/148] w-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-rose-50/40 ${
                    selectedImage === img
                      ? 'border-rose-600 scale-105 shadow-md'
                      : 'border-rose-200/70 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill unoptimized className="object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Customer Process Guarantee */}
          <div className="p-6 rounded-3xl bg-cream-200/60 border border-rose-200/70 space-y-3 mt-6">
            <h4 className="font-serif text-base font-bold text-obsidian-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              Handcrafted Custom Fulfillment
            </h4>
            <p className="text-xs text-obsidian-800/80 leading-relaxed">
              When you order, our designer receives your submitted details and creates your finalized design. You will receive final files via WhatsApp/email upon manual payment confirmation.
            </p>
          </div>

        </div>

        {/* Right Column: Customization Form & Purchase */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
              {product.name}
            </h1>
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl font-bold text-rose-700">
                {formatPKR(product.price)}
              </span>
              <span className="text-xs text-sage-800 font-semibold bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
                Custom Order
              </span>
            </div>
            <p className="text-obsidian-800/80 text-sm leading-relaxed border-t border-rose-100 pt-3">
              {product.description}
            </p>
          </div>

          {/* Dynamic Customization Form */}
          <form onSubmit={handleAddToCart} className="space-y-6 pt-2">
            
            <div data-tour="product-custom-fields" className="p-6 rounded-3xl bg-white border border-rose-200/80 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-obsidian-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  Step 1: Customize Your Details
                </h3>
                <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Required Fields *</span>
              </div>

              {product.custom_fields && product.custom_fields.length > 0 ? (
                <div className="space-y-4">
                  {product.custom_fields.map((field) => {
                    const hasError = !!formErrors[field.name];
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-obsidian-900">
                          {field.name}{' '}
                          {field.required ? (
                            <span className="text-rose-600 font-bold">*</span>
                          ) : (
                            <span className="text-obsidian-800/50 font-normal italic">(Optional)</span>
                          )}
                        </label>

                        <input
                          type="text"
                          value={customFormState[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.name.toLowerCase()}...`}
                          className={`w-full px-4 py-3 rounded-2xl text-sm border transition-all ${
                            hasError
                              ? 'border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
                              : 'border-rose-200/80 bg-cream-50/50 focus:bg-white focus:ring-2 focus:ring-rose-400'
                          } focus:outline-none`}
                        />

                        {hasError && (
                          <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {formErrors[field.name]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-obsidian-800/70 italic">
                  No additional custom text fields required for this standard template.
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-rose-200/80">
              <span className="text-xs font-semibold text-obsidian-900">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-xl bg-cream-200 text-obsidian-900 hover:bg-rose-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm min-w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 rounded-xl bg-cream-200 text-obsidian-900 hover:bg-rose-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="submit"
              data-tour="product-add-to-cart-btn"
              className="w-full py-4 rounded-2xl bg-obsidian-900 hover:bg-rose-700 text-cream-50 font-semibold text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5 text-rose-300" />
              <span>Add Customized Product to Cart</span>
            </button>

          </form>

        </div>

      </div>

      {/* Page-Specific Coachmarks Guide Tour */}
      <Coachmarks
        steps={PRODUCT_TOUR_STEPS}
        tourKey="product_customizer"
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      <TourTriggerButton onClick={() => setTourOpen(true)} />

    </div>
  );
}
