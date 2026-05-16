'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { RevealScreen } from '@/components/screens/RevealScreen';
import { DiscussScreen } from '@/components/screens/DiscussScreen';
import { VoteScreen } from '@/components/screens/VoteScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import { Spinner } from '@/components/ui/Spinner';

type ClientPhase = 'lobby' | 'reveal' | 'discuss' | 'vote' | 'result';

interface GameContainerProps {
  roomId: string;
  playerName: string;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-4 text-muted hover:text-text transition-colors font-body text-sm flex items-center gap-1 z-10"
    >
      ← Leave
    </button>
  );
}

export function GameContainer({ roomId, playerName }: GameContainerProps) {
  const router = useRouter();
  const [clientPhase, setClientPhase] = useState<ClientPhase>('lobby');
  const [loading, setLoading] = useState(false);
  const prevServerPhase = useRef<string>('');

  // Derive polling interval from current phase + player state
  // Will be computed after first fetch gives us state
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  const { state, error, refetch } = useGameState(roomId, playerName, pollingInterval);

  const isHost = state?.host === playerName;
  const isReady = state?.players[playerName]?.ready ?? false;
  const hasVoted = state ? state.votes[playerName] !== undefined : false;

  // Recompute polling interval whenever relevant state changes
  const nextInterval = useMemo(() => {
    if (!state) return null;
    if (clientPhase === 'lobby' && isReady) return 3000;
    if (clientPhase === 'vote' && hasVoted) return 3000;
    if (clientPhase === 'result' && !isHost) return 3000;
    return null;
  }, [clientPhase, isReady, hasVoted, isHost, state]);

  useEffect(() => {
    setPollingInterval(nextInterval);
  }, [nextInterval]);

  // Sync client phase with server phase changes
  useEffect(() => {
    if (!state) return;
    const serverPhase = state.phase;
    if (serverPhase !== prevServerPhase.current) {
      prevServerPhase.current = serverPhase;
      if (serverPhase === 'lobby') setClientPhase('lobby');
      else if (serverPhase === 'reveal' && clientPhase === 'lobby') setClientPhase('reveal');
      else if (serverPhase === 'result') setClientPhase('result');
    }
  }, [state, clientPhase]);

  // Redirect on room not found
  useEffect(() => {
    if (error === 'Room not found') router.push(state?.ownerUsername ? `/${state.ownerUsername}` : '/rooms');
  }, [error, router, state?.ownerUsername]);

  const apiCall = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`${endpoint} error:`, err);
      }
      await refetch();
    } catch (err) {
      console.error(`${endpoint} network error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleReady = () => apiCall('ready', { name: playerName });
  const handleForceStart = () => apiCall('start', { name: playerName, force: true });
  const handleVote = (target: string) => apiCall('vote', { voter: playerName, target });
  const handleNewRound = () => apiCall('next-round', { name: playerName });
  const backUrl = state?.ownerUsername ? `/${state.ownerUsername}` : '/rooms';

  const handleCloseRoom = async () => {
    await apiCall('delete', { name: playerName });
    router.push(backUrl);
  };
  const handleLeave = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName }),
      });
    } catch { /* ignore */ }
    router.push(backUrl);
  };

  // Loading — waiting for first state fetch
  if (!state) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-muted font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Standby — player joined mid-round
  if (state.isStandby) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
        <BackButton onClick={handleLeave} />
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-5xl">⏳</div>
          <h1 className="font-heading text-4xl text-text">ROUND IN PROGRESS</h1>
          <p className="text-muted font-body">
            A round is underway. You&apos;ll automatically join when it ends.
          </p>
          <div className="flex justify-center"><Spinner /></div>
          <p className="text-xs text-muted font-body">{state.roomName}</p>
        </div>
      </div>
    );
  }

  if (clientPhase === 'lobby') {
    return (
      <LobbyScreen
        state={state}
        playerName={playerName}
        onReady={handleReady}
        onForceStart={handleForceStart}
        onLeave={handleLeave}
        loading={loading}
      />
    );
  }

  if (clientPhase === 'reveal') {
    return (
      <div className="relative">
        <BackButton onClick={handleLeave} />
        <RevealScreen
          myRole={state.myRole}
          myWord={state.myWord}
          myTurn={state.myTurn}
          turnOrder={state.turnOrder}
          category={state.category}
          mode={state.mode}
          onContinue={() => setClientPhase('discuss')}
        />
      </div>
    );
  }

  if (clientPhase === 'discuss') {
    return (
      <div className="relative">
        <BackButton onClick={handleLeave} />
        <DiscussScreen
          mode={state.mode}
          turnOrder={state.turnOrder}
          myName={playerName}
          myTurn={state.myTurn}
          onStartVoting={() => setClientPhase('vote')}
        />
      </div>
    );
  }

  if (clientPhase === 'vote') {
    return (
      <div className="relative">
        <BackButton onClick={handleLeave} />
        <VoteScreen
          players={state.players}
          myName={playerName}
          myRole={state.myRole}
          mode={state.mode}
          hasVoted={hasVoted}
          votes={state.votes}
          onVote={handleVote}
          loading={loading}
        />
      </div>
    );
  }

  if (clientPhase === 'result') {
    return (
      <ResultScreen
        result={state.result}
        scores={state.scores}
        isHost={isHost}
        playerName={playerName}
        onNewRound={handleNewRound}
        onCloseRoom={handleCloseRoom}
        loading={loading}
      />
    );
  }

  return null;
}
