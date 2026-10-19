import type { WardrobeItem } from './database.types';
import { COLOR_HARMONY, getCategoryRole } from './constants';

export interface RecommendedOutfit {
  items: WardrobeItem[];
  score: number;
  explanation: string[];
  occasion: string;
  season: string;
}

function colorCompatibility(a: string | null, b: string | null): number {
  if (!a || !b) return 0.5;
  if (a === b) return 0.8;
  const compatibles = COLOR_HARMONY[a] ?? [];
  return compatibles.includes(b) ? 1.0 : 0.3;
}

function occasionScore(itemOccasions: string[], targetOccasion: string): number {
  if (itemOccasions.length === 0) return 0.5;
  return itemOccasions.some(
    (o) => o.toLowerCase() === targetOccasion.toLowerCase() || o.toLowerCase() === 'casual'
  )
    ? 1.0
    : 0.2;
}

function seasonScore(itemSeasons: string[], targetSeason: string): number {
  if (itemSeasons.length === 0) return 0.5;
  return itemSeasons.some(
    (s) =>
      s.toLowerCase() === targetSeason.toLowerCase() ||
      s.toLowerCase() === 'all-season'
  )
    ? 1.0
    : 0.2;
}

export function generateRecommendations(
  items: WardrobeItem[],
  occasion: string,
  season: string,
  count = 5
): RecommendedOutfit[] {
  const tops = items.filter((i) => getCategoryRole(i.category) === 'top');
  const bottoms = items.filter((i) => getCategoryRole(i.category) === 'bottom');
  const dresses = items.filter((i) => getCategoryRole(i.category) === 'dress');
  const footwear = items.filter((i) => getCategoryRole(i.category) === 'footwear');
  const outers = items.filter((i) => getCategoryRole(i.category) === 'outer');
  const bags = items.filter((i) => getCategoryRole(i.category) === 'bag');
  const accessories = items.filter((i) => getCategoryRole(i.category) === 'accessory');

  const outfits: RecommendedOutfit[] = [];

  const tryBuild = (
    top: WardrobeItem | undefined,
    bottom: WardrobeItem | undefined,
    dress: WardrobeItem | undefined
  ) => {
    const base: WardrobeItem[] = [];
    const explanations: string[] = [];
    let score = 0;
    let scoreFactors = 0;

    if (dress) {
      base.push(dress);
      const ds = seasonScore(dress.season, season);
      const dos = occasionScore(dress.occasions, occasion);
      score += ds + dos;
      scoreFactors += 2;
      if (ds > 0.8) explanations.push(`${dress.name} is ideal for ${season}`);
      if (dos > 0.8) explanations.push(`${dress.name} suits ${occasion} occasions`);
    } else if (top && bottom) {
      base.push(top, bottom);
      const ts = seasonScore(top.season, season) + occasionScore(top.occasions, occasion);
      const bs = seasonScore(bottom.season, season) + occasionScore(bottom.occasions, occasion);
      const colorSc = colorCompatibility(top.primary_color, bottom.primary_color);
      score += ts + bs + colorSc * 2;
      scoreFactors += 5;
      if (colorSc > 0.8) {
        explanations.push(
          `${top.primary_color ?? 'The top color'} pairs well with ${bottom.primary_color ?? 'the bottom color'}`
        );
      }
      if (ts > 1.5) explanations.push(`${top.name} is great for ${occasion} in ${season}`);
    } else {
      return;
    }

    const shoe = footwear
      .map((s) => ({
        s,
        score: seasonScore(s.season, season) + colorCompatibility(s.primary_color, base[0].primary_color),
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (shoe) {
      base.push(shoe.s);
      score += shoe.score;
      scoreFactors += 2;
      if (shoe.score > 1.5)
        explanations.push(`${shoe.s.name} complements the outfit color palette`);
    }

    const outerNeeded = ['Winter', 'Autumn', 'Spring'].includes(season);
    if (outerNeeded && outers.length > 0) {
      const outer = outers
        .map((o) => ({
          o,
          score: seasonScore(o.season, season) + colorCompatibility(o.primary_color, base[0].primary_color),
        }))
        .sort((a, b) => b.score - a.score)[0];
      if (outer) {
        base.push(outer.o);
        score += outer.score;
        scoreFactors += 2;
        explanations.push(`${outer.o.name} is a great layering piece for ${season}`);
      }
    }

    const bag = bags
      .map((b) => ({
        b,
        score: colorCompatibility(b.primary_color, base[0].primary_color) + occasionScore(b.occasions, occasion),
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (bag) {
      base.push(bag.b);
      score += bag.score;
      scoreFactors += 2;
    }

    const acc = accessories.slice(0, 1);
    if (acc.length > 0) {
      base.push(acc[0]);
      score += 0.5;
      scoreFactors += 1;
    }

    const finalScore = scoreFactors > 0 ? Math.min(10, (score / scoreFactors) * 10) : 5;

    outfits.push({
      items: base,
      score: Math.round(finalScore * 10) / 10,
      explanation:
        explanations.length > 0
          ? explanations
          : [`A ${occasion.toLowerCase()} outfit for ${season.toLowerCase()}`],
      occasion,
      season,
    });
  };

  // Dress-based outfits
  for (const dress of dresses) {
    if (outfits.length >= count) break;
    tryBuild(undefined, undefined, dress);
  }

  // Top + bottom combinations
  for (const top of tops) {
    for (const bottom of bottoms) {
      if (outfits.length >= count * 2) break;
      tryBuild(top, bottom, undefined);
    }
  }

  // Sort by score, deduplicate by item set
  const seen = new Set<string>();
  return outfits
    .filter((o) => {
      const key = o.items
        .map((i) => i.id)
        .sort()
        .join(',');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
