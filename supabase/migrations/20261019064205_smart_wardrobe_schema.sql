
/*
# Smart Wardrobe – Personalized Fashion Assistant: Initial Schema

## Summary
Creates all core tables for the Smart Wardrobe application. This is a multi-user
app with Supabase Auth; every table uses Row Level Security so each user can only
access their own data.

## New Tables

1. **profiles** – Extended user profile (linked to auth.users via trigger).
   Stores display name, avatar, and aggregated fashion preferences.

2. **wardrobe_items** – Individual clothing items uploaded by a user.
   Includes category, color, style, season, occasion metadata, and image path.

3. **outfits** – Named outfit collections created by a user.
   Linked to wardrobe_items via outfit_items.

4. **outfit_items** – Join table between outfits and wardrobe_items.
   Prevents duplicate items in one outfit.

5. **outfit_recommendations** – Persisted recommendation results with scoring
   and explanation text.

6. **user_preferences** – Dedicated preference record per user (one-to-one).

## Security
- RLS enabled on all tables.
- Authenticated-only policies scoped to the row owner via auth.uid().
- Profiles are created automatically via a trigger on auth.users insert.

## Important Notes
- user_id defaults to auth.uid() so client inserts can omit the column.
- outfit_items has a UNIQUE(outfit_id, wardrobe_item_id) to prevent duplicates.
- Cascading deletes keep orphan rows from accumulating.
*/

-- ─── PROFILES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text,
  avatar_url          text,
  preferred_styles    text[]        DEFAULT '{}',
  favorite_colors     text[]        DEFAULT '{}',
  preferred_seasons   text[]        DEFAULT '{}',
  preferred_occasions text[]        DEFAULT '{}',
  clothing_sizes      jsonb         DEFAULT '{}',
  bio                 text,
  created_at          timestamptz   DEFAULT now(),
  updated_at          timestamptz   DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── WARDROBE ITEMS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  category         text NOT NULL,
  subcategory      text,
  primary_color    text,
  secondary_colors text[]      DEFAULT '{}',
  style            text,
  season           text[]      DEFAULT '{}',
  occasions        text[]      DEFAULT '{}',
  image_path       text,
  image_url        text,
  tags             text[]      DEFAULT '{}',
  brand            text,
  size             text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wardrobe_items_user_id_idx ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS wardrobe_items_category_idx ON wardrobe_items(category);

ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wardrobe" ON wardrobe_items;
CREATE POLICY "select_own_wardrobe" ON wardrobe_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wardrobe" ON wardrobe_items;
CREATE POLICY "insert_own_wardrobe" ON wardrobe_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_wardrobe" ON wardrobe_items;
CREATE POLICY "update_own_wardrobe" ON wardrobe_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wardrobe" ON wardrobe_items;
CREATE POLICY "delete_own_wardrobe" ON wardrobe_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── OUTFITS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  occasion    text,
  season      text,
  style       text,
  notes       text,
  is_favorite boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outfits_user_id_idx ON outfits(user_id);

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_outfits" ON outfits;
CREATE POLICY "select_own_outfits" ON outfits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_outfits" ON outfits;
CREATE POLICY "insert_own_outfits" ON outfits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_outfits" ON outfits;
CREATE POLICY "update_own_outfits" ON outfits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_outfits" ON outfits;
CREATE POLICY "delete_own_outfits" ON outfits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── OUTFIT ITEMS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfit_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id         uuid NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  wardrobe_item_id  uuid NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(outfit_id, wardrobe_item_id)
);

CREATE INDEX IF NOT EXISTS outfit_items_outfit_id_idx ON outfit_items(outfit_id);

ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_outfit_items" ON outfit_items;
CREATE POLICY "select_own_outfit_items" ON outfit_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_outfit_items" ON outfit_items;
CREATE POLICY "insert_own_outfit_items" ON outfit_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_outfit_items" ON outfit_items;
CREATE POLICY "update_own_outfit_items" ON outfit_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_outfit_items" ON outfit_items;
CREATE POLICY "delete_own_outfit_items" ON outfit_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

-- ─── OUTFIT RECOMMENDATIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfit_recommendations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_data          jsonb NOT NULL DEFAULT '{}',
  occasion             text,
  season               text,
  recommendation_score numeric(4,2),
  explanation          text,
  is_saved             boolean DEFAULT false,
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outfit_recommendations_user_id_idx ON outfit_recommendations(user_id);

ALTER TABLE outfit_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recommendations" ON outfit_recommendations;
CREATE POLICY "select_own_recommendations" ON outfit_recommendations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_recommendations" ON outfit_recommendations;
CREATE POLICY "insert_own_recommendations" ON outfit_recommendations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_recommendations" ON outfit_recommendations;
CREATE POLICY "update_own_recommendations" ON outfit_recommendations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_recommendations" ON outfit_recommendations;
CREATE POLICY "delete_own_recommendations" ON outfit_recommendations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── USER PREFERENCES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_colors    text[]    DEFAULT '{}',
  preferred_styles    text[]    DEFAULT '{}',
  preferred_occasions text[]    DEFAULT '{}',
  preferred_seasons   text[]    DEFAULT '{}',
  budget_range        text,
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_preferences" ON user_preferences;
CREATE POLICY "select_own_preferences" ON user_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_preferences" ON user_preferences;
CREATE POLICY "insert_own_preferences" ON user_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_preferences" ON user_preferences;
CREATE POLICY "update_own_preferences" ON user_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_preferences" ON user_preferences;
CREATE POLICY "delete_own_preferences" ON user_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
