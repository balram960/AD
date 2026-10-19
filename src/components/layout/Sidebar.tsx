import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Shirt, PlusCircle, Layers, Heart, Sparkles,
  Palette, Camera, User, Settings, LogOut, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/supabase';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wardrobe', icon: Shirt, label: 'My Wardrobe' },
  { to: '/wardrobe/add', icon: PlusCircle, label: 'Add Clothing' },
  { to: '/outfit-builder', icon: Layers, label: 'Outfit Builder' },
  { to: '/outfits', icon: Heart, label: 'Saved Outfits' },
  { to: '/recommendations', icon: Sparkles, label: 'Recommendations' },
  { to: '/color-matching', icon: Palette, label: 'Color Matching' },
  { to: '/virtual-try-on', icon: Camera, label: 'Virtual Try-On' },
];

const bottomItems = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const avatarUrl = getImageUrl('avatars', profile?.avatar_url);

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-stone-100 ${mobile ? 'w-72' : 'w-64'}`}>
      <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center shrink-0">
            <Shirt className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-800 leading-none">Smart Wardrobe</p>
            <p className="text-xs text-stone-400 mt-0.5">Fashion Assistant</p>
          </div>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-stone-100 space-y-0.5">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-stone-50">
          <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs font-semibold">
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-800 truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-stone-400">My Account</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
