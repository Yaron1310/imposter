'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl block">🕵️</Link>
          <h1 className="font-heading text-4xl text-text tracking-wider">BLINDSPOT</h1>
          <p className="text-muted font-body text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs text-muted font-body uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs text-muted font-body uppercase tracking-widest">Password</label>
              <Link href="/forgot-password" className="text-xs text-muted hover:text-accent font-body transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && <p className="text-accent text-xs font-body">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-muted font-body">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-text hover:text-accent transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
