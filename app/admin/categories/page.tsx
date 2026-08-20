'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, deleteCategory } from '@/lib/supabase/api';
import { Category } from '@/types/database';
import { validateCategoryInput, sanitizeInput, slugify } from '@/lib/validation';
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

    const validation = validateCategoryInput({
      name: formState.name,
      slug: formState.slug,
      imageUrl: formState.image_url,
    });

    if (!validation.isValid) {
      alert(Object.values(validation.errors).join('\n'));
      return;
    }

    setSaving(true);
    try {
      const cleanName = sanitizeInput(formState.name);
      const cleanSlug = slugify(formState.slug || cleanName);

      await saveCategory({
        id: editingCategory?.id,
        name: cleanName,
        slug: cleanSlug,
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
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-200/60 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-obsidian-950">Categories Management</h1>
          <p className="text-xs text-obsidian-800/70 mt-1">
            Create, update, and organize dynamic store product categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-3xl bg-white border border-rose-100 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-rose-200/80 space-y-3 shadow-soft">
          <Grid className="w-8 h-8 text-rose-300 mx-auto" />
          <h3 className="text-base font-semibold text-obsidian-950">No categories found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-3xl bg-white border border-rose-200/80 space-y-4 flex flex-col justify-between shadow-soft hover:shadow-elevated transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  src={cat.image_url || '/images/thank-you-greeting-card.png'}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover bg-cream-50 border border-cream-200 shrink-0"
                />
                <div>
                  <h3 className="font-serif text-lg font-bold text-obsidian-950">{cat.name}</h3>
                  <p className="text-xs font-mono text-obsidian-800/60">/{cat.slug}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl bg-obsidian-900 text-cream-50 hover:bg-rose-600 border border-obsidian-900 transition-colors shadow-sm"
                  title="Edit category"
                >
                  <Edit2 className="w-4 h-4 text-rose-300" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-obsidian-950/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl text-obsidian-950 overflow-hidden">
            
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-rose-100 p-5 sm:p-6 shrink-0 bg-white">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-obsidian-950">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-obsidian-800/60 hover:text-obsidian-950 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Scrollable Form Body & Sticky Footer */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-obsidian-900">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Wedding Invitations"
                    className="w-full px-4 py-2.5 rounded-2xl bg-cream-50/80 border border-rose-200 text-obsidian-950 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-obsidian-900">Category Slug *</label>
                  <input
                    type="text"
                    required
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: slugify(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-cream-50/80 border border-rose-200 text-obsidian-950 text-xs font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                <ImageUploader
                  images={formState.image_url ? [formState.image_url] : []}
                  onChange={(imgs) => setFormState({ ...formState, image_url: imgs[0] || '' })}
                  multiple={false}
                  label="Category Cover Image"
                  bucket="product-images"
                />
              </div>

              {/* Sticky Footer */}
              <div className="flex justify-end gap-3 p-4 sm:p-5 border-t border-rose-100 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-obsidian-800 hover:text-obsidian-950 text-xs font-semibold border border-rose-200/80 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-600/20"
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
