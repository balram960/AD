import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Layers, Trash2, Edit, Star, StarOff, Shirt } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { Outfit, WardrobeItem } from '@/lib/database.types';
import { OCCASIONS, SEASONS, STYLES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

interface OutfitWithItems extends Outfit {
  items: WardrobeItem[];
}

export default function SavedOutfitsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editOutfit, setEditOutfit] = useState<Outfit | null>(null);
  const [editName, setEditName] = useState('');
  const [editOccasion, setEditOccasion] = useState('');
  const [editSeason, setEditSeason] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [filterFavorite, setFilterFavorite] = useState(false);

  const fetchOutfits = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('outfits').select('*').order('created_at', { ascending: false });
    if (filterFavorite) q = q.eq('is_favorite', true);
    const { data: outfitData } = await q;
    if (!outfitData) { setLoading(false); return; }

    const outfitsWithItems = await Promise.all(
      outfitData.map(async (outfit) => {
        const { data: outfitItems } = await supabase
          .from('outfit_items')
          .select('wardrobe_item_id')
          .eq('outfit_id', outfit.id);
        const ids = (outfitItems ?? []).map((oi) => oi.wardrobe_item_id);
        let items: WardrobeItem[] = [];
        if (ids.length > 0) {
          const { data } = await supabase.from('wardrobe_items').select('*').in('id', ids);
          items = data ?? [];
        }
        return { ...outfit, items };
      })
    );
    setOutfits(outfitsWithItems);
    setLoading(false);
  }, [filterFavorite]);

  useEffect(() => { fetchOutfits(); }, [fetchOutfits]);

  async function toggleFavorite(outfit: Outfit) {
    const { error } = await supabase.from('outfits').update({ is_favorite: !outfit.is_favorite }).eq('id', outfit.id);
    if (!error) {
      setOutfits((prev) => prev.map((o) => o.id === outfit.id ? { ...o, is_favorite: !o.is_favorite } : o));
      toast(outfit.is_favorite ? 'Removed from favourites' : 'Added to favourites');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('outfits').delete().eq('id', deleteId);
    if (error) { toast('Failed to delete', 'error'); }
    else { toast('Outfit deleted'); setOutfits((prev) => prev.filter((o) => o.id !== deleteId)); }
    setDeleteId(null);
    setDeleting(false);
  }

  function openEdit(outfit: Outfit) {
    setEditOutfit(outfit);
    setEditName(outfit.name);
    setEditOccasion(outfit.occasion ?? '');
    setEditSeason(outfit.season ?? '');
    setEditStyle(outfit.style ?? '');
    setEditNotes(outfit.notes ?? '');
  }

  async function handleEdit() {
    if (!editOutfit || !editName.trim()) { toast('Name required', 'error'); return; }
    setEditSaving(true);
    const { error } = await supabase.from('outfits').update({
      name: editName.trim(),
      occasion: editOccasion || null,
      season: editSeason || null,
      style: editStyle || null,
      notes: editNotes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', editOutfit.id);
    if (error) { toast('Failed to save', 'error'); }
    else {
      toast('Outfit updated');
      setOutfits((prev) => prev.map((o) => o.id === editOutfit.id
        ? { ...o, name: editName.trim(), occasion: editOccasion || null, season: editSeason || null, style: editStyle || null, notes: editNotes || null }
        : o
      ));
      setEditOutfit(null);
    }
    setEditSaving(false);
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Saved Outfits</h1>
          <p className="text-stone-500 text-sm mt-0.5">{outfits.length} outfit{outfits.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterFavorite ? 'primary' : 'outline'}
            onClick={() => setFilterFavorite(!filterFavorite)}
            size="sm"
          >
            <Heart className={`w-4 h-4 ${filterFavorite ? 'fill-current' : ''}`} />
            Favourites
          </Button>
          <Button onClick={() => navigate('/outfit-builder')}>
            <Layers className="w-4 h-4" />
            New Outfit
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3 animate-pulse">
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="w-16 h-16 bg-stone-100 rounded-xl" />
                ))}
              </div>
              <div className="h-5 bg-stone-100 rounded w-2/3" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-16 h-16" />}
          title={filterFavorite ? 'No favourite outfits' : 'No saved outfits yet'}
          description={filterFavorite ? 'Mark outfits as favourites to see them here' : 'Build your first outfit using items from your wardrobe'}
          action={filterFavorite ? undefined : { label: 'Build an outfit', onClick: () => navigate('/outfit-builder') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-4">
              {/* Item thumbnails */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {outfit.items.slice(0, 4).map((item) => {
                  const url = getImageUrl('wardrobe-images', item.image_path);
                  return (
                    <div key={item.id} className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                      {url ? (
                        <img src={url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Shirt className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {outfit.items.length > 4 && (
                  <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <span className="text-xs text-stone-500 font-medium">+{outfit.items.length - 4}</span>
                  </div>
                )}
                {outfit.items.length === 0 && (
                  <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-stone-300" />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-stone-800 flex-1">{outfit.name}</h3>
                <button onClick={() => toggleFavorite(outfit)} className="text-stone-400 hover:text-rose-500 transition-colors shrink-0">
                  {outfit.is_favorite ? <Heart className="w-4 h-4 text-rose-500 fill-current" /> : <Heart className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {outfit.occasion && <Badge variant="info">{outfit.occasion}</Badge>}
                {outfit.season && <Badge>{outfit.season}</Badge>}
                {outfit.style && <Badge variant="default">{outfit.style}</Badge>}
              </div>

              {outfit.notes && <p className="text-xs text-stone-500 mb-3 line-clamp-2">{outfit.notes}</p>}

              <p className="text-xs text-stone-400 mb-3">{outfit.items.length} item{outfit.items.length !== 1 ? 's' : ''}</p>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => openEdit(outfit)} className="flex-1">
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(outfit.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete outfit">
        <p className="text-stone-600 mb-6">Are you sure you want to delete this outfit? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Modal open={!!editOutfit} onClose={() => setEditOutfit(null)} title="Edit outfit">
        <div className="space-y-4">
          <Input label="Name *" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Occasion" options={OCCASIONS.map((o) => ({ value: o, label: o }))} value={editOccasion} onChange={(e) => setEditOccasion(e.target.value)} placeholder="Select" />
            <Select label="Season" options={SEASONS.map((s) => ({ value: s, label: s }))} value={editSeason} onChange={(e) => setEditSeason(e.target.value)} placeholder="Select" />
          </div>
          <Select label="Style" options={STYLES.map((s) => ({ value: s, label: s }))} value={editStyle} onChange={(e) => setEditStyle(e.target.value)} placeholder="Select" />
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Notes</label>
            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditOutfit(null)}>Cancel</Button>
            <Button loading={editSaving} onClick={handleEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
