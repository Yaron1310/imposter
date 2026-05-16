'use client';

import Link from 'next/link';
import type { PlayerStateView } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { PlayerList } from '@/components/ui/PlayerList';

interface LobbyScreenProps {
  state: PlayerStateView;
  playerName: string;
  onReady: () => void;
  onForceStart: () => void;
  onLeave: () => void;
  loading?: boolean;
}

export function LobbyScreen({ state, playerName, onReady, onForceStart, onLeave, loading }: LobbyScreenProps) {
  const isHost = state.host === playerName;
  const myPlayer = state.players[playerName];
  const isReady = myPlayer?.ready ?? false;
  const playerNames = Object.keys(state.players);
  const allReady = playerNames.length > 0 && playerNames.every((p) => state.players[p].ready);
  const waitingCount = playerNames.filter((p) => !state.players[p].ready).length;
  const canStart = playerNames.length >= 2;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="grid grid-cols-3 items-center">
          <button onClick={onLeave} className="text-muted hover:text-text transition-colors font-body text-sm text-left">
            ← Rooms
          </button>
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-text hover:opacity-80 transition-opacity">
              <span className="text-xl">🕵️</span>
              <span className="font-heading text-xl tracking-wider">BLINDSPOT</span>
            </Link>
          </div>
          <div />
        </div>

        {/* Room info */}
        <div className="bg-card border border-border rounded-[14px] p-6 space-y-3">
          <div>
            <h1 className="font-heading text-3xl text-text leading-none">{state.roomName}</h1>
            <p className="text-xs text-muted font-body mt-1">Room ID: {state.roomId}</p>
          </div>
          {state.round > 0 && <p className="text-sm text-muted font-body">Round {state.round}</p>}
        </div>

        {/* Player list */}
        <div className="bg-card border border-border rounded-[14px] p-6 space-y-4">
          <h2 className="font-heading text-xl text-text">PLAYERS ({playerNames.length})</h2>
          <PlayerList players={state.players} host={state.host} myName={playerName} />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isReady && (
            <Button onClick={onReady} disabled={loading} className="w-full text-lg py-4" variant="primary">
              {loading ? 'Loading...' : "I'm Ready ✓"}
            </Button>
          )}

          {isHost && (
            <Button
              onClick={onForceStart}
              disabled={loading || !canStart}
              className="w-full text-lg py-4"
              variant="secondary"
            >
              {loading ? 'Starting...' : 'Start Game →'}
            </Button>
          )}

          <p className="text-center text-sm text-muted font-body">
            {allReady
              ? 'Starting game...'
              : !isReady
              ? `${waitingCount} player${waitingCount !== 1 ? 's' : ''} not ready`
              : `Waiting for ${waitingCount} player${waitingCount !== 1 ? 's' : ''}...`}
          </p>
        </div>

        {/* Scoreboard */}
        {state.round > 0 && Object.keys(state.scores).length > 0 && (
          <div className="bg-card border border-border rounded-[14px] p-6 space-y-3">
            <h2 className="font-heading text-xl text-text">SCORES</h2>
            <div className="space-y-2">
              {Object.entries(state.scores)
                .sort((a, b) => b[1] - a[1])
                .map(([name, score]) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="font-body text-text text-sm">{name}</span>
                    <span className="font-heading text-gold">{score}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
