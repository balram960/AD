import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stone-800 to-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 border border-white rounded-full"
              style={{ left: `${(i % 5) * 25}%`, top: `${Math.floor(i / 5) * 30}%`, opacity: 0.3 + (i % 3) * 0.2 }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shirt className="w-6 h-6" />
            </div>
            <span className="text-xl font-semibold">Smart Wardrobe</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Start your<br />style journey
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed">
            Upload your clothes, create outfits, and discover personalized recommendations tailored to you.
          </p>
          <div className="mt-12 space-y-4">
            {[
              { n: '1', t: 'Create your account', d: 'Set up your profile in seconds' },
              { n: '2', t: 'Upload your wardrobe', d: 'Add clothes with photos and details' },
              { n: '3', t: 'Get recommendations', d: 'Receive personalized outfit ideas' },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="font-medium">{step.t}</p>
                  <p className="text-stone-400 text-sm">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-stone-800">Smart Wardrobe</span>
          </div>

          <h2 className="text-3xl font-bold text-stone-800 mb-2">Create account</h2>
          <p className="text-stone-500 mb-8">Start building your digital wardrobe</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-stone-800 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
