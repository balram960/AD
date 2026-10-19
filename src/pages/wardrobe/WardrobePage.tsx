import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Shirt, Edit, Trash2, SlidersHorizontal } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { WardrobeItem } from '@/lib/database.types';
import { CATEGORIES, COLORS, SEASONS, OCCASIONS, STYLES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export default function WardrobePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterOccasion, setFilterOccasion] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('wardrobe_items').select('*').order('created_at', { ascending: sortBy === 'oldest' });
    if (filterCategory) query = query.eq('category', filterCategory);
    if (filterColor) query = query.eq('primary_color', filterColor);
    if (filterSeason) query = query.contains('season', [filterSeason]);
    if (filterOccasion) query = query.contains('occasions', [filterOccasion]);
    if (filterStyle) query = query.eq('style', filterStyle);
    const { data } = await query;
    const filtered = (data ?? []).filter((i) =>
      search ? i.name.toLowerCase().includes(search.toLowerCase()) : true
    );
    setItems(filtered);
    setLoading(false);
  }, [filterCategory, filterColor, filterSeason, filterOccasion, filterStyle, sortBy, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const item = items.find((i) => i.id === deleteId);
    if (item?.image_path) {
      await supabase.storage.from('wardrobe-images').remove([item.image_path]);
    }
    const { error } = await supabase.from('wardrobe_items').delete().eq('id', deleteId);
    if (error) {
      toast('Failed to delete item', 'error');
    } else {
      toast('Item deleted');
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
    }
    setDeleteId(null);
    setDeleting(false);
  }

  const activeFilters = [filterCategory, filterColor, filterSeason, filterOccasion, filterStyle].filter(Boolean).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Wardrobe</h1>
          <p className="text-stone-500 text-sm mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/wardrobe/add">
          <Button>
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Search & filters */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>
          <Select
            options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="w-40"
          />
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-stone-100">
            <Select
              placeholder="All categories"
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            />
            <Select
              placeholder="All colors"
              options={COLORS.map((c) => ({ value: c, label: c }))}
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
            />
            <Select
              placeholder="All seasons"
              options={SEASONS.map((s) => ({ value: s, label: s }))}
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
            />
            <Select
              placeholder="All occasions"
              options={OCCASIONS.map((o) => ({ value: o, label: o }))}
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
            />
            <Select
              placeholder="All styles"
              options={STYLES.map((s) => ({ value: s, label: s }))}
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
            />
            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterCategory(''); setFilterColor(''); setFilterSeason(''); setFilterOccasion(''); setFilterStyle(''); }}
                className="text-xs text-stone-500 hover:text-stone-800 transition-colors col-span-full sm:col-span-1"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-square bg-stone-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-stone-100 animate-pulse rounded" />
                <div className="h-3 bg-stone-100 animate-pulse rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Shirt className="w-16 h-16" />}
          title="Your wardrobe is empty"
          description="Start adding your clothing items to build your digital wardrobe and get personalized recommendations."
          action={{ label: 'Add your first item', onClick: () => navigate('/wardrobe/add') }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => {
            const url = getImageUrl('wardrobe-images', item.image_path);
            return (
              <div key={item.id} className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/wardrobe/${item.id}`}>
                  <div className="aspect-square bg-stone-50 overflow-hidden relative">
                    {url ? (
                      <img src={url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-200">
                        <Shirt className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/wardrobe/${item.id}`}>
                    <p className="text-sm font-medium text-stone-800 truncate hover:text-stone-600">{item.name}</p>
                  </Link>
                  <div className="flex items-center justify-between mt-1">
                    <Badge>{item.category}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/wardrobe/${item.id}/edit`)}
                        className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.primary_color && (
                    <p className="text-xs text-stone-400 mt-1">{item.primary_color}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete item">
        <p className="text-stone-600 mb-6">Are you sure you want to delete this item? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
