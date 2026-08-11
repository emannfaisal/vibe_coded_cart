'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, saveProduct, deleteProduct, toggleProductActive } from '@/lib/supabase/api';
import { Product, Category, CustomField } from '@/types/database';
import { formatPKR, slugify } from '@/lib/utils';
import ImageUploader from '@/components/ImageUploader';
import {
  Package,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Star,
  Trash2,
  X,
  Check,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Create / Edit
  const [formState, setFormState] = useState<{
    id?: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    category_id: string;
    image_urls: string[];
    custom_fields: CustomField[];
    is_active: boolean;
    is_featured: boolean;
  }>({
    name: '',
    slug: '',
    description: '',
    price: 3000,
    category_id: '',
    image_urls: [],
    custom_fields: [],
    is_active: true,
    is_featured: false,
  });

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts({ activeOnly: false }),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error('Failed loading admin products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      slug: '',
      description: '',
      price: 3000,
      category_id: categories[0]?.id || '',
      image_urls: [],
      custom_fields: [
        { name: 'Bride Name', type: 'text', required: true },
        { name: 'Groom Name', type: 'text', required: true },
      ],
      is_active: true,
      is_featured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      image_urls: product.image_urls ? [...product.image_urls] : [],
      custom_fields: product.custom_fields ? [...product.custom_fields] : [],
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    setFormState((prev) => ({
      ...prev,
      name: nameVal,
      slug: prev.slug && editingProduct ? prev.slug : slugify(nameVal),
    }));
  };

  const handleAddField = () => {
    setFormState((prev) => ({
      ...prev,
      custom_fields: [...prev.custom_fields, { name: '', type: 'text', required: true }],
    }));
  };

  const handleRemoveField = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      custom_fields: prev.custom_fields.filter((_, idx) => idx !== index),
    }));
  };

  const handleFieldChange = (index: number, key: 'name' | 'required', val: any) => {
    setFormState((prev) => {
      const updated = [...prev.custom_fields];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, custom_fields: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanName = formState.name.trim() || 'Untitled Design';
      const cleanSlug = formState.slug.trim() || slugify(cleanName) || `design-${Date.now()}`;
      const cleanCategoryId = formState.category_id || categories[0]?.id || '';
      const cleanImageUrls = formState.image_urls.filter((url) => typeof url === 'string' && url.trim().length > 0);
      const cleanCustomFields = formState.custom_fields.filter((f) => f.name.trim().length > 0);

      await saveProduct({
        ...formState,
        name: cleanName,
        slug: cleanSlug,
        category_id: cleanCategoryId,
        image_urls: cleanImageUrls,
        custom_fields: cleanCustomFields,
      });

      setModalOpen(false);
      await loadData();
    } catch (e) {
      console.error('Error saving product:', e);
      alert('Failed saving product: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      await deleteProduct(product.id);
      await loadData();
    }
  };

  const handleToggleActive = async (product: Product) => {
    const nextState = !product.is_active;
    await toggleProductActive(product.id, nextState);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: nextState } : p))
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Products Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create and edit custom design products, prices, images, and customization text field lists.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product</span>
        </button>
      </div>

      {/* Product List Table / Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-slate-950 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <Package className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No products created yet</h3>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className={`p-6 rounded-3xl bg-slate-950 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                prod.is_active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
              }`}
            >
              
              <div className="flex items-center gap-4">
                <img
                  src={prod.image_urls?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop'}
                  alt=""
                  className="w-14 aspect-[105/148] rounded-xl object-contain bg-slate-900 shrink-0 border border-slate-800 p-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-white">{prod.name}</h3>
                    {prod.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-rose-300" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">/{prod.slug}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="text-rose-400 font-bold font-serif">{formatPKR(prod.price)}</span>
                    <span>•</span>
                    <span>{prod.category?.name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">
                      {prod.custom_fields?.length || 0} custom text field(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleToggleActive(prod)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    prod.is_active
                      ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-950'
                  }`}
                  title={prod.is_active ? 'Soft-hide from storefront shop' : 'Activate on storefront shop'}
                >
                  {prod.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{prod.is_active ? 'Active (Visible)' : 'Inactive (Hidden)'}</span>
                </button>

                <button
                  onClick={() => openEditModal(prod)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </button>

                <button
                  onClick={() => handleDeleteProduct(prod)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Delete Product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="font-serif text-2xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Create New Digital Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Ethereal Botanical Suite"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">URL Slug (Auto-generated)</label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: slugify(e.target.value) })}
                    placeholder="auto-generated-from-name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Category *</label>
                  <select
                    value={formState.category_id}
                    onChange={(e) => setFormState({ ...formState, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price (PKR) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Price in PKR (Whole Amount) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Describe this product..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Sample Product Images Uploader */}
              <ImageUploader
                images={formState.image_urls}
                onChange={(newImages) => setFormState({ ...formState, image_urls: newImages })}
                multiple={true}
                label="Product Sample Images"
                bucket="product-images"
              />

              {/* Toggles */}
              <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_active}
                    onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                  <span>Active (Visible on Storefront)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_featured}
                    onChange={(e) => setFormState({ ...formState, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              {/* Dynamic Custom Fields List Builder */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Custom Text Input Fields Setup
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formState.custom_fields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <input
                        type="text"
                        placeholder="Field Label e.g. Bride Name"
                        value={field.name}
                        onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                        className="flex-grow px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                      />

                      <label className="flex items-center gap-1.5 text-xs text-slate-300 shrink-0 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                          className="w-3.5 h-3.5 accent-rose-500"
                        />
                        <span>Required</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
