
/*
# Storage Bucket Policies for Smart Wardrobe

Creates RLS-style policies on the Supabase Storage objects table so that:
- Authenticated users can upload to their own folder (user_id prefix).
- Public read is allowed on the wardrobe-images and avatars buckets (images are served publicly).
- Users can only delete/update their own files.
*/

-- wardrobe-images bucket policies
DROP POLICY IF EXISTS "wardrobe_images_select" ON storage.objects;
CREATE POLICY "wardrobe_images_select" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'wardrobe-images');

DROP POLICY IF EXISTS "wardrobe_images_insert" ON storage.objects;
CREATE POLICY "wardrobe_images_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'wardrobe-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "wardrobe_images_update" ON storage.objects;
CREATE POLICY "wardrobe_images_update" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'wardrobe-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "wardrobe_images_delete" ON storage.objects;
CREATE POLICY "wardrobe_images_delete" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'wardrobe-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatars bucket policies
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
