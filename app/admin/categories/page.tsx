'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, deleteCategory } from '@/lib/supabase/api';
import { Category } from '@/types/database';
import { slugify } from '@/lib/utils';
import ImageUploader from '@/components/ImageUploader';
import { Grid, Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    slug: '',
    image_url: '',
  });

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (e) {
      console.error('Error loading admin categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormState({
      name: '',
      slug: '',
      image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormState({
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || '',
    });
    setModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    setFormState({
      ...formState,
      name: nameVal,
      slug: editingCategory ? formState.slug : slugify(nameVal),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCategory({
        id: editingCategory?.id,
        name: formState.name.trim(),
        slug: formState.slug.trim(),
        image_url: formState.image_url.trim(),
      });
      setModalOpen(false);
      loadData();
    } catch (e) {
      console.error('Failed saving category:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Categories Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, update, and organize dynamic store product categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-2xl bg-slate-950 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <Grid className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No categories found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={cat.image_url || '/images/thank-you-greeting-card.png'}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{cat.name}</h3>
                  <p className="text-xs font-mono text-slate-400">/{cat.slug}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl bg-slate-900 text-rose-400 hover:bg-rose-950 border border-slate-800 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="font-serif text-2xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Wedding Invitations"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Category Slug *</label>
                <input
                  type="text"
                  required
                  value={formState.slug}
                  onChange={(e) => setFormState({ ...formState, slug: slugify(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <ImageUploader
                images={formState.image_url ? [formState.image_url] : []}
                onChange={(imgs) => setFormState({ ...formState, image_url: imgs[0] || '' })}
                multiple={false}
                label="Category Cover Image"
                bucket="product-images"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
