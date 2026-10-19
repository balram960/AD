import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-800">Smart Wardrobe</span>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Check your email</h2>
            <p className="text-stone-500 mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-stone-800 mb-2">Reset password</h2>
            <p className="text-stone-500 mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" loading={loading} size="lg" className="w-full">
                Send reset link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
