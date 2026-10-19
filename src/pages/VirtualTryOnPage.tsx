import { useRef, useState } from 'react';
import { Camera, Upload, Shirt, Info, X, Download } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { WardrobeItem } from '@/lib/database.types';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function VirtualTryOnPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    supabase.from('wardrobe_items').select('*').order('category').then(({ data }) => {
      setWardrobe(data ?? []);
    });
  }, []);

  function handlePhoto(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setUserPhoto(url);
  }

  function toggleItem(item: WardrobeItem) {
    setSelectedItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }

  const categories = [...new Set(wardrobe.map((i) => i.category))].sort();
  const filteredWardrobe = filterCategory
    ? wardrobe.filter((i) => i.category === filterCategory)
    : wardrobe;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Virtual Try-On</h1>
        <p className="text-stone-500 text-sm mt-0.5">Visualize how outfits look with your photo</p>
      </div>

      {/* AI service notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Realistic AI try-on requires an external service</p>
          <p className="text-sm text-amber-700 mt-1">
            Photorealistic virtual try-on needs a dedicated AI model (e.g. OOTDiffusion, TryOnDiffusion, or a
            commercial API like Fashn.ai). The outfit preview below shows a side-by-side layout of your photo
            and selected items. Connect an AI service by adding your API key to a Supabase Edge Function —
            see the setup instructions in the README.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload area */}
        <div>
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Your photo</h2>
          <div
            className={`rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
              userPhoto ? 'border-transparent' : 'border-stone-200 hover:border-stone-400 bg-stone-50'
            }`}
            style={{ aspectRatio: '3/4' }}
            onClick={() => fileRef.current?.click()}
          >
            {userPhoto ? (
              <div className="relative w-full h-full">
                <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); setUserPhoto(null); URL.revokeObjectURL(userPhoto); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white/80 bg-black/40 rounded-lg px-2 py-1 text-center">
                    Your photo (private, not uploaded)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-700">Upload your photo</p>
                  <p className="text-xs text-stone-400 mt-1">Full-body photo works best</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />
          <p className="text-xs text-stone-400 mt-2 text-center">
            Your photo stays in your browser only — it is not uploaded to any server.
          </p>
        </div>

        {/* Wardrobe picker */}
        <div>
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Select items to try</h2>
          <div className="mb-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white text-stone-700"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredWardrobe.length === 0 ? (
              <div className="text-center py-8">
                <Shirt className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No items in your wardrobe</p>
              </div>
            ) : (
              filteredWardrobe.map((item) => {
                const selected = selectedItems.some((i) => i.id === item.id);
                const url = getImageUrl('wardrobe-images', item.image_path);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all ${
                      selected ? 'border-stone-800 bg-stone-50' : 'border-transparent hover:border-stone-200 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      {url ? (
                        <img src={url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Shirt className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-700 truncate">{item.name}</p>
                      <Badge>{item.category}</Badge>
                    </div>
                    {selected && <div className="w-5 h-5 bg-stone-800 rounded-full flex items-center justify-center shrink-0"><span className="text-white text-xs">✓</span></div>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Outfit preview</h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 min-h-64">
            {!userPhoto && selectedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Camera className="w-10 h-10 text-stone-200 mb-2" />
                <p className="text-sm text-stone-400">Upload your photo and select items to see a preview</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {userPhoto && (
                    <div>
                      <p className="text-xs text-stone-400 mb-1 text-center">You</p>
                      <div className="rounded-xl overflow-hidden bg-stone-100" style={{ aspectRatio: '3/4' }}>
                        <img src={userPhoto} alt="You" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {selectedItems.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-400 mb-1 text-center">Outfit</p>
                      <div className="space-y-2">
                        {selectedItems.slice(0, 4).map((item) => {
                          const url = getImageUrl('wardrobe-images', item.image_path);
                          return (
                            <div key={item.id} className="rounded-xl overflow-hidden bg-stone-100 aspect-square">
                              {url ? (
                                <img src={url} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <Shirt className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {selectedItems.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-stone-700 mb-2">Selected items:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 text-xs text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          {item.name}
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-stone-50 rounded-xl">
                  <p className="text-xs text-stone-500 text-center">
                    This is a basic side-by-side preview. For photorealistic AI try-on, connect a compatible AI service.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
