'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      setSent(true);
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
          <p className="text-muted font-body text-sm">Reset your password</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-[14px] px-4 py-4 text-sm text-muted font-body text-center">
              If an account exists for <span className="text-text">{email}</span>, we&apos;ve sent a reset link. Check your inbox.
            </div>
            <Link
              href="/login"
              className="block w-full text-center bg-accent hover:bg-red-600 text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
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

            {error && <p className="text-accent text-xs font-body">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
            >
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>

            <p className="text-center text-sm text-muted font-body">
              <Link href="/login" className="text-text hover:text-accent transition-colors">
                ← Back to Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
