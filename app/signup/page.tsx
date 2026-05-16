'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'form' | 'verify';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send verification email');
        return;
      }
      setStep('verify');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Signup failed');
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
          <p className="text-muted font-body text-sm">
            {step === 'form' ? 'Create your account' : 'Check your email'}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-muted font-body uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="your-name"
                required
                minLength={3}
                maxLength={20}
                className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-xs text-muted font-body">3–20 chars, letters, numbers, hyphens</p>
            </div>

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
              <label className="block text-xs text-muted font-body uppercase tracking-widest">Password</label>
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
              <label className="block text-xs text-muted font-body uppercase tracking-widest">Confirm Password</label>
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
              {loading ? 'Sending code...' : 'Continue →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="bg-card border border-border rounded-[14px] px-4 py-3 text-sm text-muted font-body">
              We sent a 6-digit code to <span className="text-text">{email}</span>. Enter it below to verify your email.
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-muted font-body uppercase tracking-widest">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
                className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors text-center text-2xl tracking-widest"
              />
            </div>

            {error && <p className="text-accent text-xs font-body">{error}</p>}

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="w-full bg-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('form'); setError(''); setVerificationCode(''); }}
              className="w-full text-sm text-muted hover:text-text font-body transition-colors"
            >
              ← Back
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted font-body">
          Already have an account?{' '}
          <Link href="/login" className="text-text hover:text-accent transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
