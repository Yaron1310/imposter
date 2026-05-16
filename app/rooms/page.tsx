'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RoomList } from '@/components/ui/RoomList';

function AppHeader() {
  return (
    <Link href="/" className="flex items-center gap-2 text-text hover:opacity-80 transition-opacity">
      <span className="text-xl">🕵️</span>
      <span className="font-heading text-xl tracking-wider">BLINDSPOT</span>
    </Link>
  );
}

interface RoomInfo {
  id: string;
  name: string;
  host: string;
  phase: string;
  playerCount: number;
  mode: 'imposter' | 'super';
  ownerUsername?: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('playerName') || '';
    if (!stored) {
      router.push('/');
      return;
    }
    setPlayerName(stored);
  }, [router]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) return;
      const data = await res.json() as Record<string, {
        name: string;
        host: string;
        phase: string;
        playerCount: number;
        mode: 'imposter' | 'super';
        ownerUsername?: string;
      }>;
      const roomList: RoomInfo[] = Object.entries(data)
        .filter(([, room]) => !room.ownerUsername)
        .map(([id, room]) => ({
          id,
          name: room.name,
          host: room.host,
          phase: room.phase,
          playerCount: room.playerCount,
          mode: room.mode,
        }));
      setRooms(roomList);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    if (!playerName) {
      router.push('/');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomName.trim(), hostName: playerName, mode: 'super' }),
      });
      const data = await res.json() as { ok?: boolean; roomId?: string; error?: string };
      if (!res.ok || !data.roomId) {
        setError(data.error ?? 'Failed to create room');
        return;
      }
      router.push(`/rooms/${data.roomId}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (roomId: string) => {
    if (!playerName) {
      router.push('/');
      return;
    }
    setJoining(roomId);
    setError('');
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to join room');
        return;
      }
      router.push(`/rooms/${roomId}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-md mx-auto space-y-4 pt-8">
        <AppHeader />
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-text">GAME ROOMS</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-body">Playing as</span>
            <span className="text-sm text-text font-body font-medium">{playerName}</span>
            <Link
              href="/?play=1"
              className="text-xs text-muted hover:text-text font-body transition-colors ml-1"
            >
              (change)
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-950 border border-accent rounded-[14px] px-4 py-3 text-accent text-sm font-body">
            {error}
          </div>
        )}

        {/* Create Room */}
        <Card className="space-y-4">
          <h2 className="font-heading text-xl text-text">CREATE ROOM</h2>
          <div className="space-y-2">
            <label className="block text-xs text-muted font-body uppercase tracking-widest">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Friday Night..."
              maxLength={40}
              className="w-full bg-surface border border-border rounded-[14px] px-4 py-3 text-text font-body placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating || !roomName.trim()}
            className="w-full"
            variant="primary"
          >
            {creating ? 'Creating...' : 'Create Room'}
          </Button>
        </Card>

        {/* Open Rooms */}
        <Card className="space-y-4">
          <h2 className="font-heading text-xl text-text">OPEN ROOMS</h2>
          <RoomList
            rooms={rooms}
            onJoin={(id) => !joining && handleJoin(id)}
          />
        </Card>
      </div>
    </div>
  );
}
