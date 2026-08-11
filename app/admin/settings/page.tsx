'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/supabase/api';
import { SiteSettings } from '@/types/database';
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
      
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Storefront Site Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure contact email, brand name, and studio tagline across the public storefront.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Site settings successfully updated and live on storefront!</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-3xl bg-slate-950 animate-pulse" />
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 shadow-2xl">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Studio Contact Email *
            </label>
            <p className="text-[11px] text-slate-500">
              Displayed on checkout confirmation screen for manual payment instructions.
            </p>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={formState.contact_email}
                onChange={(e) => setFormState({ ...formState, contact_email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Store Brand Name *
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={formState.brand_name}
                onChange={(e) => setFormState({ ...formState, brand_name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 font-serif font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Tagline / Studio Subtitle *
            </label>
            <textarea
              rows={2}
              required
              value={formState.tagline}
              onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Logo Image URL <span className="text-slate-500 font-normal italic">(Optional)</span>
            </label>
            <input
              type="text"
              value={formState.logo_url || ''}
              onChange={(e) => setFormState({ ...formState, logo_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition-all flex items-center gap-2"
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
