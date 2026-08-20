'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useCart } from '@/context/CartContext';
import { createOrder, getSiteSettings } from '@/lib/supabase/api';
import { Order, SiteSettings } from '@/types/database';
import { formatPKR } from '@/lib/utils';
import {
  CheckCircle2,
  Mail,
  Phone,
  User,
  FileText,
  Copy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  ShoppingBag,
} from 'lucide-react';

import { validateCheckoutInput, sanitizeInput } from '@/lib/validation';
import Coachmarks, { TourTriggerButton, TourStep } from '@/components/Coachmarks';

const CHECKOUT_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="checkout-form"]',
    title: 'Customer Contact Information',
    description: 'Enter your Full Name and WhatsApp phone number so designer files can be delivered to you.',
  },
  {
    target: '[data-tour="checkout-summary"]',
    title: 'Order Item Summary & Total',
    description: 'Review custom items, customized text choices, and total PKR amount payable.',
  },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [settings, setSettings] = useState<SiteSettings>({
    contact_email: 'efaisal375@gmail.com',
    brand_name: 'Petal & Ink',
    tagline: 'Custom Bespoke Digital Design Studio',
    logo_url: '',
  });

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCheckoutInput({
      customerName: formData.customer_name,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
    });

    if (!validation.isValid) {
      setErrors({
        customer_name: validation.errors.customerName || '',
        phone: validation.errors.phone || '',
        email: validation.errors.email || '',
        notes: validation.errors.notes || '',
      });
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder(
        {
          customer_name: sanitizeInput(formData.customer_name),
          phone: sanitizeInput(formData.phone),
          email: formData.email.trim() ? sanitizeInput(formData.email) : null,
          notes: formData.notes.trim() ? sanitizeInput(formData.notes) : null,
        },
        items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
          customFieldValues: i.customFieldValues,
        }))
      );

      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCompletedOrder(order);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred submitting your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyContactEmail = () => {
    navigator.clipboard.writeText(settings.contact_email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  // SUCCESS CONFIRMATION VIEW
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-fade-in">
        
        {/* Celebration Header Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-600">Order Received</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
              Thank You, {completedOrder.customer_name}!
            </h1>
            <p className="text-xs font-mono text-obsidian-800/60 pt-1">
              Order Reference ID: <span className="font-bold text-obsidian-900">{completedOrder.id}</span>
            </p>
          </div>

          {/* Explicit Manual Payment Instruction Box */}
          <div className="p-6 rounded-2xl bg-cream-100/90 border border-rose-200 text-left space-y-4 my-6">
            <div className="flex items-center gap-2 text-rose-800 font-serif font-bold text-lg">
              <Mail className="w-5 h-5 text-rose-600" />
              <span>Next Step: Confirm Payment via Email / WhatsApp</span>
            </div>

            <p className="text-xs text-obsidian-800 leading-relaxed">
              Your order has been recorded with status <strong className="uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">pending</strong>. 
              Please email us at{' '}
              <strong className="text-obsidian-950 underline font-semibold">{settings.contact_email}</strong>{' '}
              or message us on WhatsApp with your order details to confirm payment (JazzCash / Easypaisa / Bank Transfer), and our designer will get started on your design.
            </p>

            {/* Email Copy Button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200">
              <span className="text-xs font-mono font-semibold text-obsidian-900">{settings.contact_email}</span>
              <button
                onClick={copyContactEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-900 hover:bg-rose-600 text-white text-xs font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
              </button>
            </div>
          </div>

          {/* Order Details Reference Box for Customer */}
          <div className="p-6 rounded-2xl bg-white border border-rose-100 text-left space-y-4">
            <h3 className="font-serif text-base font-bold text-obsidian-900 border-b border-rose-100 pb-2">
              Order Item Reference Summary
            </h3>

            <div className="space-y-3">
              {completedOrder.order_items?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-cream-50/70 border border-cream-200/80 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-obsidian-900">
                    <span>{item.product_name_snapshot} (x{item.quantity})</span>
                    <span>{formatPKR(item.price_at_purchase * item.quantity)}</span>
                  </div>
                  {item.custom_field_values && (
                    <div className="text-[11px] text-obsidian-800/80 pt-1 space-y-0.5 border-t border-rose-100/60 mt-1">
                      {Object.entries(item.custom_field_values).map(([k, v]) => (
                        <div key={k}>
                          <strong className="text-obsidian-900">{k}:</strong> {v || '(blank)'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-sm font-bold text-obsidian-950 border-t border-rose-100">
              <span>Total Amount:</span>
              <span className="font-serif text-lg text-rose-700">{formatPKR(completedOrder.total_price)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:${settings.contact_email}?subject=Payment%20Confirmation%20for%20Order%20${completedOrder.id}&body=Hello%20Petal%20%26%20Ink%2C%0A%0AI%20have%20placed%20order%20${completedOrder.id}%20for%20${completedOrder.customer_name}.%20Please%20send%20payment%20details%20(JazzCash/Easypaisa/Bank).`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-lg transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Payment Confirmation Now</span>
            </a>

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-cream-200 text-obsidian-900 hover:bg-rose-100 text-xs font-semibold border border-rose-200 transition-colors"
            >
              <span>Return to Storefront</span>
            </Link>
          </div>

        </div>

      </div>
    );
  }

  // CHECKOUT FORM VIEW
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-obsidian-900">Your Cart is Empty</h2>
        <p className="text-xs text-obsidian-800/70">
          Please add customized design items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-obsidian-900 text-cream-50 text-xs font-semibold hover:bg-rose-600 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Shop Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-600">Guest Checkout</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-950">
          Complete Your Order
        </h1>
        <p className="text-xs text-obsidian-800/70">
          No customer registration or credit card required. Fill in your contact info below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Contact Information Form */}
        <div data-tour="checkout-form" className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-rose-200/80 shadow-soft space-y-6">
            
            <div className="border-b border-rose-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-obsidian-900 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-600" />
                Customer Contact Details
              </h3>
              <p className="text-xs text-obsidian-800/70 mt-1">
                Our designer will use these contact details to send finalized files.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-obsidian-900">
                Full Name <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="e.g. Ayesha Khan"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm border transition-all ${
                    errors.customer_name
                      ? 'border-rose-500 bg-rose-50/40'
                      : 'border-rose-200/80 bg-cream-50/50 focus:bg-white focus:ring-2 focus:ring-rose-400'
                  } focus:outline-none`}
                />
              </div>
              {errors.customer_name && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.customer_name}</p>
              )}
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-obsidian-900">
                Phone Number (WhatsApp Preferred) <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +92 300 1234567"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm border transition-all ${
                    errors.phone
                      ? 'border-rose-500 bg-rose-50/40'
                      : 'border-rose-200/80 bg-cream-50/50 focus:bg-white focus:ring-2 focus:ring-rose-400'
                  } focus:outline-none`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-obsidian-900">
                Email Address <span className="text-obsidian-800/50 font-normal italic">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ayesha@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border border-rose-200/80 bg-cream-50/50 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes / Special Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-obsidian-900">
                Delivery Notes / Design Preferences <span className="text-obsidian-800/50 font-normal italic">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-3 text-obsidian-800/40" />
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any specific requests regarding color shades or font styles..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border border-rose-200/80 bg-cream-50/50 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-obsidian-900 hover:bg-rose-700 text-cream-50 font-semibold text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 text-rose-300" />
                  <span>Place Order & View Payment Instructions</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div data-tour="checkout-summary" className="lg:col-span-5 p-8 rounded-3xl bg-white border border-rose-200/80 shadow-soft space-y-6">
          <h3 className="font-serif text-xl font-bold text-obsidian-950 border-b border-rose-100 pb-3">
            Items in Your Order ({items.length})
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                <div className="flex justify-between items-start text-xs font-bold text-obsidian-950">
                  <span>{item.product.name} (x{item.quantity})</span>
                  <span className="font-serif text-rose-700">{formatPKR(item.product.price * item.quantity)}</span>
                </div>

                {Object.keys(item.customFieldValues || {}).length > 0 && (
                  <div className="text-[11px] text-obsidian-800/70 pt-1 space-y-0.5 border-t border-rose-100/60 mt-1">
                    {Object.entries(item.customFieldValues).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <strong className="text-obsidian-900">{k}:</strong> {v || '(blank)'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-rose-100 pt-4 flex justify-between items-center">
            <span className="text-sm font-bold text-obsidian-900">Total Payable Amount:</span>
            <span className="font-serif text-2xl font-bold text-rose-700">{formatPKR(subtotal)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              Payment Policy
            </div>
            <p className="text-[11px]">
              No automatic charge today. Upon placing your order, payment details (JazzCash/Easypaisa/Bank Transfer) will be displayed.
            </p>
          </div>
        </div>

      </div>

      {/* Page-Specific Coachmarks Guide Tour */}
      <Coachmarks
        steps={CHECKOUT_TOUR_STEPS}
        tourKey="checkout"
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      <TourTriggerButton onClick={() => setTourOpen(true)} />

    </div>
  );
}
