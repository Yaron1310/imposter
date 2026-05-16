'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Gamezone } from '@/lib/types';

interface PublicProfile {
  username: string;
  gamezones: Gamezone[];
}

interface RoomInfo {
  id: string;
  name: string;
  host: string;
  playerCount: number;
  gamezoneId: string;
}

function AppHeader() {
  return (
    <Link href="/" className="flex items-center gap-2 text-text hover:opacity-80 transition-opacity">
      <span className="text-xl">🕵️</span>
      <span className="font-heading text-xl tracking-wider">BLINDSPOT</span>
    </Link>
  );
}

export default function UserPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);

  // Modal state
  const [modal, setModal] = useState<{ gz: Gamezone; joinRoomId?: string } | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('playerName') || '';
    if (stored) setPlayerName(stored);
  }, []);

  useEffect(() => {
    fetch(`/api/users/${params.username}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProfile(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.username]);

  const fetchRooms = useCallback(async () => {
    if (!params.username) return;
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) return;
      const data = await res.json() as Record<string, {
        name: string; host: string; playerCount: number;
        ownerUsername?: string; gamezoneId?: string;
      }>;
      const matching: RoomInfo[] = Object.entries(data)
        .filter(([, r]) => r.ownerUsername === params.username && r.gamezoneId)
        .map(([id, r]) => ({
          id,
          name: r.name,
          host: r.host,
          playerCount: r.playerCount,
          gamezoneId: r.gamezoneId!,
        }));
      setActiveRooms(matching);
    } catch {
      // silently ignore
    }
  }, [params.username]);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const openCreateModal = (gz: Gamezone) => {
    setModal({ gz });
    setRoomName('');
    setNameError('');
  };

  const openJoinModal = (gz: Gamezone, joinRoomId: string) => {
    setModal({ gz, joinRoomId });
    setNameError('');
  };

  const handleSubmit = async () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) { setNameError('Please enter your name'); return; }
    if (trimmedName.length > 24) { setNameError('Name must be 24 characters or fewer'); return; }

    if (!modal?.joinRoomId) {
      const trimmedRoom = roomName.trim();
      if (!trimmedRoom) { setNameError('Please enter a room name'); return; }
      if (trimmedRoom.length > 40) { setNameError('Room name must be 40 characters or fewer'); return; }
    }

    if (!modal) return;
    setNameError('');
    setSubmitting(true);
    sessionStorage.setItem('playerName', trimmedName);

    try {
      if (modal.joinRoomId) {
        const res = await fetch(`/api/rooms/${modal.joinRoomId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/rooms/${modal.joinRoomId}`);
        } else {
          setNameError(data.error ?? 'Failed to join room');
        }
      } else {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomName.trim(),
            hostName: trimmedName,
            mode: 'super',
            ownerUsername: profile!.username,
            gamezoneId: modal.gz.id,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/rooms/${data.roomId}`);
        } else {
          setNameError(data.error ?? 'Failed to create room');
        }
      }
    } catch {
      setNameError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-muted font-body">Loading...</p>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="font-heading text-4xl text-text">404</p>
        <p className="text-muted font-body">User not found</p>
        <Link href="/" className="text-accent font-body text-sm hover:underline">← Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader />

        <div>
          <p className="text-muted font-body text-xs uppercase tracking-widest">Gamezones by</p>
          <h1 className="font-heading text-3xl text-text">@{profile!.username}</h1>
        </div>

        {profile!.gamezones.length === 0 ? (
          <div className="bg-card border border-border rounded-[14px] p-8 text-center">
            <p className="text-muted font-body text-sm">No gamezones published yet.</p>
          </div>
        ) : (
          profile!.gamezones.map((gz) => {
            const gzRooms = activeRooms.filter((r) => r.gamezoneId === gz.id);
            return (
              <div key={gz.id} className="bg-card border border-border rounded-[14px] p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-2xl text-text">{gz.name}</p>
                    <p className="text-muted font-body text-xs mt-1">
                      {gz.categories.length} {gz.categories.length === 1 ? 'category' : 'categories'}
                    </p>
                  </div>
                  <button
                    onClick={() => openCreateModal(gz)}
                    className="bg-card hover:bg-border border border-border text-text font-body font-medium px-4 py-2 rounded-[14px] transition-all text-sm"
                  >
                    + Create Room
                  </button>
                </div>

                {gz.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {gz.categories.map((cat) => (
                      <span key={cat.id} className="bg-bg border border-border rounded-[8px] px-3 py-1 text-xs text-muted font-body">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {gzRooms.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-border">
                    <p className="text-xs text-muted font-body uppercase tracking-widest pt-2">Open Rooms</p>
                    {gzRooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between gap-2 bg-bg border border-border rounded-[10px] px-4 py-3">
                        <div>
                          <p className="font-body text-sm text-text">{room.name}</p>
                          <p className="font-body text-xs text-muted">
                            host: {room.host} · {room.playerCount} {room.playerCount === 1 ? 'player' : 'players'}
                          </p>
                        </div>
                        <button
                          onClick={() => openJoinModal(gz, room.id)}
                          className="bg-accent hover:bg-red-600 text-white font-body font-medium px-4 py-2 rounded-[10px] transition-all text-sm"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setModal(null)}>
          <div className="bg-card border border-border rounded-[14px] p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl text-text">
              {modal.joinRoomId ? 'JOIN ROOM' : 'CREATE ROOM'}
            </h2>
            <p className="text-muted font-body text-sm">
              Gamezone: <strong className="text-text">{modal.gz.name}</strong>
            </p>

            {!modal.joinRoomId && (
              <div className="space-y-2">
                <label className="block text-xs text-muted font-body uppercase tracking-widest">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => { setRoomName(e.target.value); setNameError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="Friday Night..."
                  maxLength={40}
                  autoFocus
                  className="w-full bg-bg border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs text-muted font-body uppercase tracking-widest">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setNameError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="Enter your name..."
                maxLength={24}
                autoFocus={!!modal.joinRoomId}
                className="w-full bg-bg border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
              {nameError && <p className="text-accent text-xs font-body">{nameError}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-4 rounded-[14px] transition-all text-lg"
            >
              {submitting ? '...' : modal.joinRoomId ? 'Join →' : 'Create Room →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
