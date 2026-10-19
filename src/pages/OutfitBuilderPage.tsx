import { useEffect, useState } from 'react';
import { Layers, Plus, X, Save, Shirt, Search } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { WardrobeItem } from '@/lib/database.types';
import { OCCASIONS, SEASONS, STYLES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export default function OutfitBuilderPage() {
  const { toast } = useToast();
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveOccasion, setSaveOccasion] = useState('');
  const [saveSeason, setSaveSeason] = useState('');
  const [saveStyle, setSaveStyle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [wardrobeLoading, setWardrobeLoading] = useState(true);

  useEffect(() => {
    supabase.from('wardrobe_items').select('*').order('category').then(({ data }) => {
      setWardrobe(data ?? []);
      setWardrobeLoading(false);
    });
  }, []);

  const filteredWardrobe = wardrobe.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(wardrobe.map((i) => i.category))].sort();

  function toggleItem(item: WardrobeItem) {
    setSelectedItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }

  async function handleSave() {
    if (!saveName.trim()) { toast('Please enter an outfit name', 'error'); return; }
    if (selectedItems.length === 0) { toast('Add at least one item to your outfit', 'error'); return; }
    setSaving(true);
    try {
      const { data: outfit, error: outfitErr } = await supabase
        .from('outfits')
        .insert({ name: saveName.trim(), occasion: saveOccasion || null, season: saveSeason || null, style: saveStyle || null, notes: saveNotes || null })
        .select()
        .single();
      if (outfitErr) throw outfitErr;

      const outfitItems = selectedItems.map((item) => ({ outfit_id: outfit.id, wardrobe_item_id: item.id }));
      const { error: itemsErr } = await supabase.from('outfit_items').insert(outfitItems);
      if (itemsErr) throw itemsErr;

      toast('Outfit saved!');
      setShowSaveModal(false);
      setSaveName(''); setSaveOccasion(''); setSaveSeason(''); setSaveStyle(''); setSaveNotes('');
      setSelectedItems([]);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to save outfit', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Outfit Builder</h1>
          <p className="text-stone-500 text-sm mt-0.5">Mix and match items from your wardrobe</p>
        </div>
        <Button onClick={() => setShowSaveModal(true)} disabled={selectedItems.length === 0}>
          <Save className="w-4 h-4" />
          Save Outfit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wardrobe picker */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Select from your wardrobe</h2>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-36">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white text-stone-700"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {wardrobeLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredWardrobe.length === 0 ? (
            <EmptyState
              icon={<Shirt className="w-12 h-12" />}
              title="No items found"
              description="Add clothing to your wardrobe first"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {filteredWardrobe.map((item) => {
                const selected = selectedItems.some((i) => i.id === item.id);
                const url = getImageUrl('wardrobe-images', item.image_path);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className={`relative group text-left rounded-xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-stone-800 shadow-md' : 'border-transparent hover:border-stone-300'
                    }`}
                  >
                    <div className="aspect-square bg-stone-100">
                      {url ? (
                        <img src={url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Shirt className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-stone-700 truncate">{item.name}</p>
                      <p className="text-xs text-stone-400">{item.category}</p>
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Outfit canvas */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">
            Current outfit <span className="text-stone-400 font-normal">({selectedItems.length} items)</span>
          </h2>

          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-3">
                <Layers className="w-7 h-7 text-stone-300" />
              </div>
              <p className="text-sm text-stone-400">Select items from your wardrobe to build an outfit</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {selectedItems.map((item) => {
                const url = getImageUrl('wardrobe-images', item.image_path);
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                      {url ? (
                        <img src={url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <Shirt className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                      <Badge>{item.category}</Badge>
                    </div>
                    <button onClick={() => toggleItem(item)} className="p-1 text-stone-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <Button className="w-full" onClick={() => setShowSaveModal(true)}>
                <Save className="w-4 h-4" />
                Save this outfit
              </Button>
              <button
                onClick={() => setSelectedItems([])}
                className="w-full mt-2 text-xs text-stone-400 hover:text-stone-700 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)} title="Save outfit">
        <div className="space-y-4">
          <Input label="Outfit name *" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Summer casual" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Occasion"
              options={OCCASIONS.map((o) => ({ value: o, label: o }))}
              value={saveOccasion}
              onChange={(e) => setSaveOccasion(e.target.value)}
              placeholder="Select occasion"
            />
            <Select
              label="Season"
              options={SEASONS.map((s) => ({ value: s, label: s }))}
              value={saveSeason}
              onChange={(e) => setSaveSeason(e.target.value)}
              placeholder="Select season"
            />
          </div>
          <Select
            label="Style"
            options={STYLES.map((s) => ({ value: s, label: s }))}
            value={saveStyle}
            onChange={(e) => setSaveStyle(e.target.value)}
            placeholder="Select style"
          />
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Notes</label>
            <textarea
              value={saveNotes}
              onChange={(e) => setSaveNotes(e.target.value)}
              placeholder="Any notes about this outfit…"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-stone-50 rounded-xl">
            <Plus className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-500">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} will be saved in this outfit.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>Save outfit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
