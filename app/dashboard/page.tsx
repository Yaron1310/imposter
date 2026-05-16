'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { Gamezone } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [gamezones, setGamezones] = useState<Gamezone[]>([]);
  const [gzLoading, setGzLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/gamezones')
      .then((r) => r.json())
      .then((data) => setGamezones(Array.isArray(data) ? data : []))
      .catch(() => setGamezones([]))
      .finally(() => setGzLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/gamezones/${id}`, { method: 'DELETE' });
    setGamezones((prev) => prev.filter((g) => g.id !== id));
  };

  const handleCopyUrl = useCallback(() => {
    const url = `${window.location.origin}/${user!.username}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-muted font-body">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-muted hover:text-text font-body text-sm transition-colors">← Home</Link>
            <h1 className="font-heading text-4xl text-text mt-1">DASHBOARD</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted hover:text-accent font-body text-sm transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Profile */}
        <div className="bg-card border border-border rounded-[14px] p-6 space-y-2">
          <p className="font-heading text-2xl text-text">@{user.username}</p>
          <p className="text-muted font-body text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <a
              href={`/${user.username}`}
              className="text-accent hover:underline font-body text-xs break-all"
            >
              {typeof window !== 'undefined' ? `${window.location.origin}/${user.username}` : `/${user.username}`}
            </a>
            <button
              onClick={handleCopyUrl}
              className="shrink-0 text-xs text-muted hover:text-text font-body border border-border rounded-[8px] px-2 py-0.5 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Gamezones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-text">GAMEZONES</h2>
            <Link
              href="/dashboard/gamezones/new"
              className="bg-accent hover:bg-red-600 text-white font-body font-medium px-4 py-2 rounded-[14px] transition-all text-sm"
            >
              + New
            </Link>
          </div>

          {gzLoading ? (
            <p className="text-muted font-body text-sm">Loading...</p>
          ) : gamezones.length === 0 ? (
            <div className="bg-card border border-border rounded-[14px] p-8 text-center space-y-2">
              <p className="text-muted font-body text-sm">No gamezones yet.</p>
              <Link href="/dashboard/gamezones/new" className="text-accent font-body text-sm hover:underline">
                Create your first gamezone →
              </Link>
            </div>
          ) : (
            gamezones.map((gz) => (
              <div key={gz.id} className="bg-card border border-border rounded-[14px] p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-xl text-text">{gz.name}</p>
                    <p className="text-muted font-body text-xs mt-1">
                      {gz.categories.length} {gz.categories.length === 1 ? 'category' : 'categories'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/gamezones/${gz.id}`}
                      className="text-muted hover:text-text font-body text-sm transition-colors px-3 py-1 border border-border rounded-[10px]"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(gz.id)}
                      className="text-muted hover:text-accent font-body text-sm transition-colors px-3 py-1 border border-border rounded-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {gz.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {gz.categories.map((cat) => (
                      <span key={cat.id} className="bg-bg border border-border rounded-[8px] px-3 py-1 text-xs text-muted font-body">
                        {cat.name} ({cat.words.length})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
