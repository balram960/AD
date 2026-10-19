import { useEffect, useState } from 'react';
import { Palette, Shirt, ArrowRight, Info } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import type { WardrobeItem } from '@/lib/database.types';
import { COLOR_HARMONY, COLORS } from '@/lib/constants';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

const COLOR_SWATCHES: Record<string, string> = {
  Black: '#1c1c1c', White: '#f9f9f9', Grey: '#9ca3af', Beige: '#d4b896', Brown: '#92400e',
  Navy: '#1e3a5f', Blue: '#3b82f6', 'Light Blue': '#93c5fd', Green: '#16a34a', Olive: '#65721e',
  Red: '#dc2626', Burgundy: '#7f1d1d', Pink: '#f472b6', Rose: '#fb7185', Orange: '#f97316',
  Yellow: '#fbbf24', Purple: '#7c3aed', Lavender: '#c4b5fd', Cream: '#fef3c7',
  Gold: '#d97706', Silver: '#94a3b8', Multicolor: 'linear-gradient(135deg,#f87171,#60a5fa,#34d399)',
};

export default function ColorMatchingPage() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [matchingItems, setMatchingItems] = useState<WardrobeItem[]>([]);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('wardrobe_items').select('*').then(({ data }) => {
      setWardrobe(data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedColor) { setMatchingItems([]); setSuggestedColors([]); return; }
    const compatible = COLOR_HARMONY[selectedColor] ?? [];
    setSuggestedColors(compatible);
    const matches = wardrobe.filter(
      (item) =>
        item.primary_color !== selectedColor &&
        (compatible.includes(item.primary_color ?? '') ||
          item.secondary_colors?.some((c) => compatible.includes(c)))
    );
    setMatchingItems(matches);
  }, [selectedColor, wardrobe]);

  const colorsInWardrobe = [...new Set(wardrobe.map((i) => i.primary_color).filter(Boolean))] as string[];
  const accessories = wardrobe.filter((i) => ['Accessories', 'Bags', 'Shoes'].includes(i.category));
  const suggestedAccessories = accessories.filter(
    (a) => suggestedColors.includes(a.primary_color ?? '') || a.primary_color === selectedColor
  );

  function colorSwatch(color: string) {
    const swatch = COLOR_SWATCHES[color];
    if (!swatch) return <div className="w-5 h-5 rounded-full bg-stone-200 border border-stone-300" />;
    if (swatch.startsWith('linear')) {
      return <div className="w-5 h-5 rounded-full border border-stone-200" style={{ background: swatch }} />;
    }
    return (
      <div
        className="w-5 h-5 rounded-full border border-stone-200"
        style={{ backgroundColor: swatch }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Color Matching</h1>
        <p className="text-stone-500 text-sm mt-0.5">Discover compatible colors and accessories from your wardrobe</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : wardrobe.length === 0 ? (
        <EmptyState
          icon={<Palette className="w-16 h-16" />}
          title="No items in your wardrobe"
          description="Add clothing items to explore color matching and accessory suggestions."
        />
      ) : (
        <>
          {/* Color selector */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Select a color to match</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {colorsInWardrobe.length > 0 ? (
                colorsInWardrobe.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedColor === color
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {colorSwatch(color)}
                    {color}
                  </button>
                ))
              ) : (
                <p className="text-sm text-stone-400">No colors recorded in your wardrobe items. Edit items to add colors.</p>
              )}
            </div>
            <div className="flex items-start gap-2 p-3 bg-stone-50 rounded-xl text-xs text-stone-500">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              Showing colors recorded in your wardrobe. Edit clothing items to add or update color information.
            </div>
          </div>

          {selectedColor && (
            <>
              {/* Suggested colors */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
                <h2 className="text-sm font-semibold text-stone-700 mb-4">
                  Colors that complement <span className="text-stone-900">{selectedColor}</span>
                </h2>
                {suggestedColors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedColors.map((color) => (
                      <div key={color} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50">
                        {colorSwatch(color)}
                        <span className="text-sm text-stone-700">{color}</span>
                        {colorsInWardrobe.includes(color) && (
                          <Badge variant="success">In wardrobe</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-400">No color harmony data available for this color.</p>
                )}
              </div>

              {/* Matching items */}
              {matchingItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowRight className="w-4 h-4 text-stone-500" />
                    <h2 className="text-sm font-semibold text-stone-700">
                      Matching items from your wardrobe ({matchingItems.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {matchingItems.map((item) => {
                      const url = getImageUrl('wardrobe-images', item.image_path);
                      return (
                        <div key={item.id} className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
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
                            <div className="flex items-center gap-1 mt-1">
                              {colorSwatch(item.primary_color ?? '')}
                              <span className="text-xs text-stone-400">{item.primary_color}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accessory suggestions */}
              {suggestedAccessories.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-stone-700 mb-4">
                    Accessories & footwear that work with {selectedColor}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {suggestedAccessories.map((item) => {
                      const url = getImageUrl('wardrobe-images', item.image_path);
                      return (
                        <div key={item.id} className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
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
                            <Badge>{item.category}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchingItems.length === 0 && suggestedAccessories.length === 0 && (
                <div className="text-center py-12">
                  <Palette className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm">
                    No matching items found for <strong>{selectedColor}</strong> in your wardrobe.
                    Try adding more items or updating their colors.
                  </p>
                </div>
              )}
            </>
          )}

          {/* All colors reference */}
          {!selectedColor && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-stone-700 mb-4">Color harmony reference</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(COLOR_HARMONY).slice(0, 12).map(([color, matches]) => (
                  <div key={color} className="p-3 rounded-xl border border-stone-100 bg-stone-50">
                    <div className="flex items-center gap-2 mb-2">
                      {colorSwatch(color)}
                      <span className="text-sm font-medium text-stone-800">{color}</span>
                    </div>
                    <p className="text-xs text-stone-500">Pairs with: {matches.slice(0, 3).join(', ')}{matches.length > 3 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
