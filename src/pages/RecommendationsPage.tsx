import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Save, Shirt, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { WardrobeItem } from '@/lib/database.types';
import { OCCASIONS, SEASONS } from '@/lib/constants';
import { generateRecommendations, type RecommendedOutfit } from '@/lib/recommendations';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

export default function RecommendationsPage() {
  const { toast } = useToast();
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [occasion, setOccasion] = useState('Casual');
  const [season, setSeason] = useState('Summer');
  const [recommendations, setRecommendations] = useState<RecommendedOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [wardrobeLoading, setWardrobeLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('wardrobe_items').select('*').then(({ data }) => {
      setWardrobe(data ?? []);
      setWardrobeLoading(false);
    });
  }, []);

  function generate() {
    if (wardrobe.length === 0) { toast('Add items to your wardrobe first', 'info'); return; }
    setLoading(true);
    setTimeout(() => {
      const recs = generateRecommendations(wardrobe, occasion, season, 6);
      setRecommendations(recs);
      setLoading(false);
    }, 600);
  }

  async function saveRecommendation(rec: RecommendedOutfit, idx: number) {
    setSavingId(idx);
    try {
      const { data: outfit, error: outfitErr } = await supabase
        .from('outfits')
        .insert({
          name: `${rec.occasion} outfit – ${rec.season}`,
          occasion: rec.occasion,
          season: rec.season,
          notes: rec.explanation.join('; '),
        })
        .select()
        .single();
      if (outfitErr) throw outfitErr;

      const outfitItems = rec.items.map((item) => ({ outfit_id: outfit.id, wardrobe_item_id: item.id }));
      const { error: itemsErr } = await supabase.from('outfit_items').insert(outfitItems);
      if (itemsErr) throw itemsErr;

      await supabase.from('outfit_recommendations').insert({
        outfit_data: { outfit_id: outfit.id, item_ids: rec.items.map((i) => i.id) },
        occasion: rec.occasion,
        season: rec.season,
        recommendation_score: rec.score,
        explanation: rec.explanation.join('; '),
        is_saved: true,
      });

      toast('Outfit saved to your collection!');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSavingId(null);
    }
  }

  const scoreColor = (score: number) =>
    score >= 8 ? 'text-emerald-600 bg-emerald-50' : score >= 6 ? 'text-amber-600 bg-amber-50' : 'text-stone-600 bg-stone-50';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Recommendations</h1>
        <p className="text-stone-500 text-sm mt-0.5">Get personalized outfit suggestions based on your wardrobe</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">What are you dressing for?</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <Select
              label="Occasion"
              options={OCCASIONS.map((o) => ({ value: o, label: o }))}
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              label="Season"
              options={SEASONS.map((s) => ({ value: s, label: s }))}
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            />
          </div>
          <Button onClick={generate} loading={loading} disabled={wardrobeLoading}>
            <Sparkles className="w-4 h-4" />
            {recommendations.length > 0 ? 'Regenerate' : 'Get recommendations'}
          </Button>
          {recommendations.length > 0 && (
            <Button variant="ghost" onClick={generate} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {wardrobeLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : wardrobe.length < 3 ? (
        <EmptyState
          icon={<Shirt className="w-16 h-16" />}
          title="Not enough items"
          description="Add at least 3 items to your wardrobe to get outfit recommendations."
        />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse space-y-3">
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => <div key={j} className="w-16 h-16 bg-stone-100 rounded-xl" />)}
              </div>
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">Select your occasion and season, then click "Get recommendations"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${scoreColor(rec.score)}`}>
                    {rec.score}/10
                  </span>
                  <span className="text-xs text-stone-500">match score</span>
                </div>
                <div className="flex gap-1.5">
                  <Badge variant="info">{rec.occasion}</Badge>
                  <Badge>{rec.season}</Badge>
                </div>
              </div>

              {/* Item thumbnails */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {rec.items.map((item) => {
                  const url = getImageUrl('wardrobe-images', item.image_path);
                  return (
                    <div key={item.id} className="shrink-0 w-16 h-16 rounded-xl bg-stone-100 overflow-hidden relative group/item">
                      {url ? (
                        <img src={url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Shirt className="w-5 h-5" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-1">
                        <p className="text-white text-[10px] leading-tight line-clamp-2">{item.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div>
                <button
                  onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 transition-colors mb-2"
                >
                  Why this outfit?
                  {expandedId === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {expandedId === idx && (
                  <ul className="space-y-1 mb-3">
                    {rec.explanation.map((e, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-stone-600">
                        <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                className="w-full"
                size="sm"
                variant="outline"
                loading={savingId === idx}
                onClick={() => saveRecommendation(rec, idx)}
              >
                <Save className="w-3.5 h-3.5" />
                Save to my outfits
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
