import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Layers, Heart, Sparkles, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/supabase';
import type { WardrobeItem, Outfit } from '@/lib/database.types';
import { Button } from '@/components/ui/Button';

interface Stats {
  wardrobeCount: number;
  outfitCount: number;
  favoriteCount: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ wardrobeCount: 0, outfitCount: 0, favoriteCount: 0 });
  const [recentItems, setRecentItems] = useState<WardrobeItem[]>([]);
  const [recentOutfits, setRecentOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [wardrobeRes, outfitsRes, favRes, itemsRes, outRes] = await Promise.all([
        supabase.from('wardrobe_items').select('id', { count: 'exact', head: true }),
        supabase.from('outfits').select('id', { count: 'exact', head: true }),
        supabase.from('outfits').select('id', { count: 'exact', head: true }).eq('is_favorite', true),
        supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('outfits').select('*').order('created_at', { ascending: false }).limit(3),
      ]);
      setStats({
        wardrobeCount: wardrobeRes.count ?? 0,
        outfitCount: outfitsRes.count ?? 0,
        favoriteCount: favRes.count ?? 0,
      });
      setRecentItems(itemsRes.data ?? []);
      setRecentOutfits(outRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const statCards = [
    { label: 'Wardrobe Items', value: stats.wardrobeCount, icon: Shirt, color: 'bg-stone-800 text-white', href: '/wardrobe' },
    { label: 'Saved Outfits', value: stats.outfitCount, icon: Layers, color: 'bg-amber-50 text-amber-800', href: '/outfits' },
    { label: 'Favourites', value: stats.favoriteCount, icon: Heart, color: 'bg-rose-50 text-rose-800', href: '/outfits' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800">
          {greeting}, {firstName}!
        </h1>
        <p className="text-stone-500 mt-1">Here's what's in your wardrobe today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} to={href} className="group">
            <div className={`rounded-2xl p-5 flex items-center gap-4 transition-transform group-hover:-translate-y-0.5 ${color}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'bg-stone-800 text-white' ? 'bg-white/20' : 'bg-white'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{loading ? '—' : value}</p>
                <p className="text-sm opacity-80">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link to="/wardrobe/add">
          <Button className="w-full justify-start gap-3" size="lg">
            <Plus className="w-5 h-5" />
            Add Clothing
          </Button>
        </Link>
        <Link to="/outfit-builder">
          <Button variant="outline" className="w-full justify-start gap-3" size="lg">
            <Layers className="w-5 h-5" />
            Build Outfit
          </Button>
        </Link>
        <Link to="/recommendations">
          <Button variant="outline" className="w-full justify-start gap-3" size="lg">
            <Sparkles className="w-5 h-5" />
            Get Recommendations
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent wardrobe items */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-800">Recently Added</h2>
            <Link to="/wardrobe" className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-8">
              <Shirt className="w-10 h-10 text-stone-200 mx-auto mb-2" />
              <p className="text-sm text-stone-400">Your wardrobe is empty</p>
              <Link to="/wardrobe/add" className="text-xs text-stone-600 hover:underline mt-1 block">Add your first item</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recentItems.map((item) => {
                const url = getImageUrl('wardrobe-images', item.image_path);
                return (
                  <Link key={item.id} to={`/wardrobe/${item.id}`} className="group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                      {url ? (
                        <img src={url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Shirt className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{item.name}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent outfits + daily tip */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-800">Recent Outfits</h2>
              <Link to="/outfits" className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentOutfits.length === 0 ? (
              <div className="text-center py-6">
                <Layers className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No outfits yet</p>
                <Link to="/outfit-builder" className="text-xs text-stone-600 hover:underline mt-1 block">Create your first outfit</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOutfits.map((outfit) => (
                  <Link key={outfit.id} to="/outfits" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                    <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-stone-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{outfit.name}</p>
                      <p className="text-xs text-stone-400">{outfit.occasion ?? 'Any occasion'} · {outfit.season ?? 'All seasons'}</p>
                    </div>
                    {outfit.is_favorite && <Heart className="w-4 h-4 text-rose-400 fill-current shrink-0" />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Styling tip */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Daily Tip</p>
            </div>
            <p className="text-sm leading-relaxed text-stone-200">
              Neutral tones like beige, white, and grey form the perfect base for any outfit. 
              Build around them with one statement piece to create a polished, effortless look.
            </p>
            <Link to="/recommendations" className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/80 hover:text-white transition-colors">
              Get personalized suggestions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
