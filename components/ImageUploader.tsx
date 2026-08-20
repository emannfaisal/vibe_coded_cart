'use client';

import React, { useState, useRef } from 'react';
import { uploadImage } from '@/lib/supabase/storage';
import {
  Upload,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Star,
  Loader2,
} from 'lucide-react';
interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
  bucket?: string;
}
export default function ImageUploader({
  images = [],
  onChange,
  multiple = true,
  label = 'Product Sample Images',
  bucket = 'product-images',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map((file) => uploadImage(file, bucket));
      const rawUrls = await Promise.all(uploadPromises);
      const uploadedUrls = rawUrls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
      if (uploadedUrls.length > 0) {
        if (multiple) {
          // Prepend new uploaded images so the newly uploaded file automatically becomes the cover image (index 0)
          onChange([...uploadedUrls, ...images]);
        } else {
          onChange([uploadedUrls[0]]);
        }
      }
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    if (multiple) {
      onChange([customUrl.trim(), ...images]);
    } else {
      onChange([customUrl.trim()]);
    }
    setCustomUrl('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-obsidian-900">
          {label} {multiple ? '(Upload 1 or more files)' : ''}
        </label>
        <div className="flex items-center gap-3">
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-rose-700 hover:text-rose-800 font-medium transition-colors"
            >
              Clear All Images
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-obsidian-800/70 hover:text-obsidian-950 flex items-center gap-1 transition-colors font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL input' : 'Paste image URL'}</span>
          </button>
        </div>
      </div>

      {/* Manual URL input block */}
      {showUrlInput && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-grow px-3 py-2 rounded-xl bg-cream-50/80 border border-rose-200 text-obsidian-950 text-xs font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 shadow-sm"
          >
            Add Image
          </button>
        </form>
      )}

      {/* File Upload Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragActive
            ? 'border-rose-500 bg-rose-50'
            : 'border-rose-300/80 bg-cream-50/70 hover:bg-cream-100/80 hover:border-rose-400'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-3 space-y-2 text-rose-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-medium">Uploading image file(s)...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="p-3 rounded-full bg-white border border-rose-200 text-rose-600 shadow-sm">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-obsidian-950">
                Click to select or drop sample image files here
              </p>
              <p className="text-[11px] text-obsidian-800/60 mt-0.5">
                Newly uploaded image automatically becomes the primary cover image
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Thumbnail Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-obsidian-800/70 font-medium">
              Image Gallery ({images.length} file{images.length > 1 ? 's' : ''})
            </p>
            <p className="text-[10px] text-obsidian-800/50">
              First image is used as primary product thumbnail
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden bg-white border border-rose-200/80 aspect-square flex items-center justify-center shadow-sm p-1"
              >
                <img
                  src={url}
                  alt={`Sample ${idx + 1}`}
                  className="w-full h-full object-contain bg-transparent"
                />

                {/* Cover / Main Tag */}
                {idx === 0 ? (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-[9px] font-bold text-white shadow flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" /> Primary Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCover(idx);
                    }}
                    className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-white/90 hover:bg-rose-600 text-[9px] font-semibold text-obsidian-900 hover:text-white transition-colors opacity-90 group-hover:opacity-100 shadow-sm border border-rose-200/60"
                    title="Set as primary cover image"
                  >
                    Make Cover
                  </button>
                )}

                {/* Control overlay */}
                <div className="absolute inset-0 bg-obsidian-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                  {multiple && idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, 'left');
                      }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-obsidian-900"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {multiple && idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, 'right');
                      }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-obsidian-900"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform hover:scale-105"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
