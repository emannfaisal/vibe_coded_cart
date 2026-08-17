'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/supabase/api';
import { SiteSettings } from '@/types/database';
import ImageUploader from '@/components/ImageUploader';
import { Settings, Save, Mail, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [formState, setFormState] = useState<SiteSettings>({
    contact_email: 'efaisal375@gmail.com',
    brand_name: 'Petal & Ink',
    tagline: 'Crafted with Elegance. Delivered with Love.',
    logo_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    getSiteSettings().then((res) => {
      if (res) setFormState(res);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(formState);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error('Error updating site settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div className="border-b border-rose-200/60 pb-6">
        <h1 className="font-serif text-3xl font-bold text-obsidian-950">Storefront Site Settings</h1>
        <p className="text-xs text-obsidian-800/70 mt-1">
          Configure contact email, brand name, logo image, and studio tagline across the public storefront.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-sage-600" />
          <span>Site settings successfully updated and live on storefront!</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-3xl bg-white border border-rose-100 animate-pulse" />
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-rose-200/80 space-y-6 shadow-soft text-obsidian-950">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-obsidian-900">
              Studio Contact Email *
            </label>
            <p className="text-[11px] text-obsidian-800/60">
              Displayed on checkout confirmation screen for manual payment instructions.
            </p>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
              <input
                type="email"
                required
                value={formState.contact_email}
                onChange={(e) => setFormState({ ...formState, contact_email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50/80 border border-rose-200 text-obsidian-950 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-obsidian-900">
              Store Brand Name *
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
              <input
                type="text"
                required
                value={formState.brand_name}
                onChange={(e) => setFormState({ ...formState, brand_name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50/80 border border-rose-200 text-obsidian-950 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-serif font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-obsidian-900">
              Tagline / Studio Subtitle *
            </label>
            <textarea
              rows={2}
              required
              value={formState.tagline}
              onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-cream-50/80 border border-rose-200 text-obsidian-950 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
          </div>

          {/* Logo Upload Feature */}
          <div className="space-y-2">
            <ImageUploader
              images={formState.logo_url ? [formState.logo_url] : []}
              onChange={(imgs) => setFormState({ ...formState, logo_url: imgs[0] || '' })}
              multiple={false}
              label="Storefront & Admin Studio Logo Image"
              bucket="product-images"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-obsidian-800/60">
                Uploaded logo files with dark backgrounds are automatically processed into transparent PNGs.
              </span>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, logo_url: '/logo.png' })}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 underline underline-offset-2 transition-colors"
              >
                Use Clean Feather Logo (/logo.png)
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Settings...' : 'Save Site Settings'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
