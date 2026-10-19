import { useState } from 'react';
import { Settings, Shield, Bell, Trash2, LogOut, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast('Passwords do not match', 'error'); return; }
    if (newPassword.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast(error.message, 'error'); }
    else { toast('Password updated!'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    setPasswordLoading(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        <p className="text-stone-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="space-y-5">
        {/* Account info */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-700">Account</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-400 block mb-1">Email address</label>
              <p className="text-sm font-medium text-stone-800">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs text-stone-400 block mb-1">Account created</label>
              <p className="text-sm text-stone-700">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-700">Change password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 6 characters)"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <Button type="submit" loading={passwordLoading} variant="outline" size="sm">
              Update password
            </Button>
          </form>
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-stone-700">Sign out</h2>
              <p className="text-xs text-stone-400 mt-0.5">Sign out of your Smart Wardrobe account</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Delete account</p>
              <p className="text-xs text-stone-400 mt-0.5">Permanently remove your account and all wardrobe data</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} title="Delete account">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-1">This action is permanent</p>
            <p className="text-sm text-red-600">All your wardrobe items, outfits, and preferences will be deleted and cannot be recovered.</p>
          </div>
          <p className="text-sm text-stone-600">Type <strong>DELETE</strong> to confirm:</p>
          <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={async () => {
                toast('Account deletion requires contacting support. Please email support@smartwardrobe.app', 'info');
                setShowDeleteModal(false);
              }}
            >
              Delete account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
