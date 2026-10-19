# Smart Wardrobe – Personalized Fashion Assistant

A full-stack web application for digitizing your wardrobe, building outfits, and getting personalized style recommendations.

## Features

- **Digital Wardrobe** – Upload clothing with photos, category, color, style, season, and occasion metadata
- **Outfit Builder** – Mix and match wardrobe items and save complete outfits
- **Smart Recommendations** – Rule-based engine generates outfit suggestions by occasion and season
- **Color Matching** – Color harmony system suggests compatible colors and accessories
- **Virtual Try-On** – Side-by-side outfit preview (AI try-on requires external service)
- **Profile & Preferences** – Personalized style preferences feed into recommendations
- **Authentication** – Email/password sign-up and sign-in via Supabase

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router v6
- Supabase (Auth, Database, Storage)

## Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Local development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

### Supabase setup

The database schema and RLS policies are applied automatically when deploying through Bolt. If setting up manually:

1. Run the SQL from the migration files in your Supabase SQL editor
2. Create two storage buckets: `wardrobe-images` (public) and `avatars` (public)
3. Apply the storage RLS policies from the `storage_policies` migration

### Virtual Try-On (AI integration)

Realistic photorealistic try-on requires an external AI service. To connect one:

1. Create a Supabase Edge Function: `supabase/functions/virtual-tryon/index.ts`
2. Add your AI provider API key as a Supabase secret
3. Call your provider's API (e.g. Fashn.ai, OOTD Diffusion) from the Edge Function
4. Update `VirtualTryOnPage.tsx` to call your Edge Function instead of showing the static preview

Compatible services: Fashn.ai, Klingai, or any service that accepts a person image + clothing image and returns a composited result.

## Project Structure

```
src/
  contexts/       # AuthContext
  components/
    ui/           # Reusable UI: Button, Input, Modal, Toast, etc.
    layout/       # Sidebar, AppLayout
  pages/
    auth/         # Login, SignUp, ForgotPassword
    wardrobe/     # WardrobePage, AddEditClothingPage, ClothingDetailPage
    Dashboard, OutfitBuilder, SavedOutfits, Recommendations,
    ColorMatching, VirtualTryOn, Profile, Settings, Landing
  lib/
    supabase.ts           # Supabase client + storage helpers
    database.types.ts     # TypeScript types
    constants.ts          # Categories, colors, occasions, seasons, color harmony
    recommendations.ts    # Rule-based recommendation engine
```

## Deployment

Deploy to Vercel, Netlify, or any static host. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting platform.
