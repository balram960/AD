import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Shirt, ArrowLeft } from 'lucide-react';
import { supabase, getImageUrl, uploadImage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { WardrobeItem } from '@/lib/database.types';
import { CATEGORIES, COLORS, SEASONS, OCCASIONS, STYLES, SIZES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useToast } from '@/components/ui/Toast';

const BLANK: Partial<WardrobeItem> = {
  name: '', description: '', category: '', subcategory: '',
  primary_color: '', secondary_colors: [], style: '',
  season: [], occasions: [], tags: [], brand: '', size: '',
};

export default function AddEditClothingPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(BLANK);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    supabase.from('wardrobe_items').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm(data);
        setExistingImagePath(data.image_path);
        if (data.image_path) {
          setImagePreview(getImageUrl('wardrobe-images', data.image_path));
        }
      }
      setFetchLoading(false);
    });
  }, [id, isEdit]);

  function set<K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFile(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast('Only JPEG, PNG, WebP, or GIF images allowed', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Image must be under 10 MB', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast('Name is required', 'error'); return; }
    if (!form.category) { toast('Category is required', 'error'); return; }
    if (!user) return;

    setLoading(true);
    try {
      let imagePath = existingImagePath ?? null;
      if (imageFile) {
        if (existingImagePath) {
          await supabase.storage.from('wardrobe-images').remove([existingImagePath]);
        }
        imagePath = await uploadImage('wardrobe-images', user.id, imageFile, 'clothes');
      }

      const payload = {
        name: form.name!.trim(),
        description: form.description ?? null,
        category: form.category!,
        subcategory: form.subcategory ?? null,
        primary_color: form.primary_color ?? null,
        secondary_colors: form.secondary_colors ?? [],
        style: form.style ?? null,
        season: form.season ?? [],
        occasions: form.occasions ?? [],
        tags: form.tags ?? [],
        brand: form.brand ?? null,
        size: form.size ?? null,
        image_path: imagePath,
      };

      if (isEdit && id) {
        const { error } = await supabase.from('wardrobe_items').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        toast('Item updated!');
        navigate(`/wardrobe/${id}`);
      } else {
        const { data, error } = await supabase.from('wardrobe_items').insert(payload).select().single();
        if (error) throw error;
        toast('Item added to your wardrobe!');
        navigate(`/wardrobe/${data.id}`);
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to save item', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{isEdit ? 'Edit Item' : 'Add Clothing'}</h1>
          <p className="text-stone-500 text-sm mt-0.5">{isEdit ? 'Update item details' : 'Add a new item to your wardrobe'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image upload */}
          <div className="lg:col-span-1">
            <label className="text-sm font-medium text-stone-700 block mb-2">Photo</label>
            <div
              className={`relative aspect-square rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
                imagePreview ? 'border-transparent' : 'border-stone-200 hover:border-stone-400 bg-stone-50'
              }`}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); setExistingImagePath(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Upload photo</p>
                    <p className="text-xs text-stone-400 mt-1">Drag & drop or click · Max 10 MB</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {/* Form fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Basic Info</h2>
              <Input label="Name *" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. White Linen Shirt" required />
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Optional notes about this item…"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category *"
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  value={form.category ?? ''}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Select category"
                  required
                />
                <Select
                  label="Style"
                  options={STYLES.map((s) => ({ value: s, label: s }))}
                  value={form.style ?? ''}
                  onChange={(e) => set('style', e.target.value)}
                  placeholder="Select style"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Brand" value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Zara" />
                <Select
                  label="Size"
                  options={SIZES.map((s) => ({ value: s, label: s }))}
                  value={form.size ?? ''}
                  onChange={(e) => set('size', e.target.value)}
                  placeholder="Select size"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Color</h2>
              <Select
                label="Primary Color"
                options={COLORS.map((c) => ({ value: c, label: c }))}
                value={form.primary_color ?? ''}
                onChange={(e) => set('primary_color', e.target.value)}
                placeholder="Select primary color"
              />
              <MultiSelect
                label="Secondary Colors"
                options={COLORS}
                value={form.secondary_colors ?? []}
                onChange={(v) => set('secondary_colors', v)}
              />
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Occasions & Seasons</h2>
              <MultiSelect
                label="Suitable Seasons"
                options={SEASONS}
                value={form.season ?? []}
                onChange={(v) => set('season', v)}
              />
              <MultiSelect
                label="Suitable Occasions"
                options={OCCASIONS}
                value={form.occasions ?? []}
                onChange={(v) => set('occasions', v)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>
            <Shirt className="w-4 h-4" />
            {isEdit ? 'Save changes' : 'Add to wardrobe'}
          </Button>
        </div>
      </form>
    </div>
  );
}
