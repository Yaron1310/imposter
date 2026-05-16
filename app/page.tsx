'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HowToPlayModal } from '@/components/ui/HowToPlayModal';

export default function LandingPage() {
  const router = useRouter();
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('playerName') || '';
    if (stored) setName(stored);
    if (new URLSearchParams(window.location.search).get('play') === '1') {
      setShowPlayModal(true);
    }
  }, []);

  const handlePlay = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name');
      return;
    }
    if (trimmed.length > 24) {
      setError('Name must be 24 characters or fewer');
      return;
    }
    sessionStorage.setItem('playerName', trimmed);
    router.push('/rooms');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handlePlay();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-3">
          <div className="text-7xl">🕵️</div>
          <h1 className="font-heading text-6xl text-text tracking-wider">BLINDSPOT</h1>
          <p className="text-muted font-body text-sm">A word-based social deduction game</p>
        </div>

        {/* Buttons */}
        {!showPlayModal ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowPlayModal(true)}
              className="w-full bg-accent hover:bg-red-600 text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
            >
              ▶ Play a random game
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-card hover:bg-border border border-border text-text font-body font-medium py-4 rounded-[14px] transition-all text-sm"
            >
              Login / Sign Up to create custom games
            </button>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="w-full text-muted hover:text-text font-body text-sm py-2 transition-colors"
            >
              ? How to play
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="block text-xs text-muted font-body uppercase tracking-widest">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name..."
                maxLength={24}
                autoFocus
                className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
              {error && <p className="text-accent text-xs font-body">{error}</p>}
              <p className="text-xs text-muted font-body text-right">{name.length}/24</p>
            </div>

            <button
              onClick={handlePlay}
              disabled={!name.trim()}
              className="w-full bg-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
            >
              Continue →
            </button>
            <button
              onClick={() => { setShowPlayModal(false); setError(''); }}
              className="w-full text-muted font-body text-sm py-2 hover:text-text transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
