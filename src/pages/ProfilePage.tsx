import { useEffect, useRef, useState } from 'react';
import { User, Camera, Save } from 'lucide-react';
import { supabase, getImageUrl, uploadImage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, STYLES, SEASONS, OCCASIONS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [preferredSeasons, setPreferredSeasons] = useState<string[]>([]);
  const [preferredOccasions, setPreferredOccasions] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setBio(profile.bio ?? '');
      setPreferredStyles(profile.preferred_styles ?? []);
      setFavoriteColors(profile.favorite_colors ?? []);
      setPreferredSeasons(profile.preferred_seasons ?? []);
      setPreferredOccasions(profile.preferred_occasions ?? []);
      if (profile.avatar_url) setAvatarPreview(getImageUrl('avatars', profile.avatar_url));
    }
  }, [profile]);

  function handleAvatarChange(file: File) {
    if (!file.type.startsWith('image/')) { toast('Please upload an image', 'error'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatarFile) {
        if (profile?.avatar_url) {
          await supabase.storage.from('avatars').remove([profile.avatar_url]);
        }
        avatarUrl = await uploadImage('avatars', user.id, avatarFile);
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        preferred_styles: preferredStyles,
        favorite_colors: favoriteColors,
        preferred_seasons: preferredSeasons,
        preferred_occasions: preferredOccasions,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await refreshProfile();
      toast('Profile updated!');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Profile</h1>
        <p className="text-stone-500 text-sm mt-0.5">Manage your personal information and style preferences</p>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Profile photo</h2>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full bg-stone-200 overflow-hidden relative cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500 text-2xl font-semibold">
                  {fullName?.[0]?.toUpperCase() ?? <User className="w-8 h-8 text-stone-400" />}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera className="w-4 h-4" />
                Change photo
              </Button>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG or WebP · Max 5 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700">Basic information</h2>
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-stone-500 text-sm bg-stone-50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your style…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>
        </div>

        {/* Style preferences */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700">Style preferences</h2>
          <MultiSelect label="Preferred styles" options={STYLES} value={preferredStyles} onChange={setPreferredStyles} />
          <MultiSelect label="Favourite colors" options={COLORS} value={favoriteColors} onChange={setFavoriteColors} />
          <MultiSelect label="Preferred seasons" options={SEASONS} value={preferredSeasons} onChange={setPreferredSeasons} />
          <MultiSelect label="Preferred occasions" options={OCCASIONS} value={preferredOccasions} onChange={setPreferredOccasions} />
        </div>

        <div className="flex justify-end">
          <Button loading={saving} onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save profile
          </Button>
        </div>
      </div>
    </div>
  );
}
