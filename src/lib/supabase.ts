import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function getImageUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(
  bucket: string,
  userId: string,
  file: File,
  folder = ''
): Promise<string> {
  const ext = file.name.split('.').pop();
  const filename = `${userId}/${folder ? folder + '/' : ''}${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    upsert: true,
  });
  if (error) throw error;
  return filename;
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
