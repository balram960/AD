import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Shirt, Tag, Sun, Calendar, Palette } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { WardrobeItem } from '@/lib/database.types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function ClothingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('wardrobe_items').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      setItem(data);
      setLoading(false);
    });
  }, [id]);

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    if (item.image_path) {
      await supabase.storage.from('wardrobe-images').remove([item.image_path]);
    }
    const { error } = await supabase.from('wardrobe_items').delete().eq('id', item.id);
    if (error) { toast('Failed to delete', 'error'); setDeleting(false); return; }
    toast('Item deleted');
    navigate('/wardrobe');
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-16">
        <p className="text-stone-500">Item not found.</p>
        <Link to="/wardrobe" className="text-stone-800 hover:underline text-sm mt-2 block">Back to wardrobe</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl('wardrobe-images', item.image_path);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/wardrobe')} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-800 flex-1 truncate">{item.name}</h1>
        <div className="flex gap-2">
          <Link to={`/wardrobe/${item.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-square">
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <Shirt className="w-20 h-20" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-stone-800 mb-3">{item.name}</h2>
            {item.description && <p className="text-sm text-stone-500 mb-4">{item.description}</p>}
            <div className="flex flex-wrap gap-2">
              <Badge>{item.category}</Badge>
              {item.style && <Badge variant="info">{item.style}</Badge>}
              {item.brand && <Badge variant="default">{item.brand}</Badge>}
              {item.size && <Badge variant="default">Size: {item.size}</Badge>}
            </div>
          </div>

          {(item.primary_color || (item.secondary_colors?.length ?? 0) > 0) && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-stone-500" />
                <h3 className="text-sm font-semibold text-stone-700">Colors</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.primary_color && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-white">
                    {item.primary_color} (primary)
                  </span>
                )}
                {item.secondary_colors?.map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>
            </div>
          )}

          {((item.season?.length ?? 0) > 0 || (item.occasions?.length ?? 0) > 0) && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
              {(item.season?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-stone-500" />
                    <h3 className="text-sm font-semibold text-stone-700">Seasons</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.season.map((s) => <Badge key={s}>{s}</Badge>)}
                  </div>
                </div>
              )}
              {(item.occasions?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-stone-500" />
                    <h3 className="text-sm font-semibold text-stone-700">Occasions</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.occasions.map((o) => <Badge key={o} variant="info">{o}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {(item.tags?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-stone-500" />
                <h3 className="text-sm font-semibold text-stone-700">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
            </div>
          )}

          <p className="text-xs text-stone-400">
            Added {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete item">
        <p className="text-stone-600 mb-6">Are you sure you want to delete <strong>{item.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
