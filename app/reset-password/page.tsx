'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to reset password');
        return;
      }
      router.push('/login?reset=1');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted font-body text-sm">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-text hover:text-accent font-body transition-colors">
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs text-muted font-body uppercase tracking-widest">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
        />
        <p className="text-xs text-muted font-body">At least 6 characters</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-muted font-body uppercase tracking-widest">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? 'Resetting...' : 'Reset Password →'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl block">🕵️</Link>
          <h1 className="font-heading text-4xl text-text tracking-wider">BLINDSPOT</h1>
          <p className="text-muted font-body text-sm">Set a new password</p>
        </div>

        <Suspense fallback={<p className="text-muted font-body text-sm text-center">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-muted font-body">
          <Link href="/login" className="text-text hover:text-accent transition-colors">
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
