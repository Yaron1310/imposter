import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import type { RoomState, PlayerStateView } from '@/lib/types';
import { tallyVotes } from '@/lib/game-logic';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const playerName = request.nextUrl.searchParams.get('name') ?? '';

    const room = await redis.get<RoomState>(`room:${roomId}`);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Rolling 2-hour TTL — reset on every poll so active rooms never expire
    await redis.expire(`room:${roomId}`, 7200);

    const isStandby = room.standby.includes(playerName);
    const playerData = room.players[playerName];
    const myRole: 'word' | 'imposter' | '' = playerData?.role ?? '';
    const myTurn = playerData?.turn ?? 0;

    // Determine what word to show this player
    let myWord = '';
    if (room.phase === 'reveal' || room.phase === 'result') {
      if (myRole === 'imposter') {
        myWord = room.mode === 'super' ? room.imposterWord : '';
      } else if (myRole === 'word') {
        myWord = room.word;
      }
    }

    // Strip role info from players
    const strippedPlayers: PlayerStateView['players'] = {};
    for (const [name, data] of Object.entries(room.players)) {
      strippedPlayers[name] = { ready: data.ready, turn: data.turn };
    }

    // Only reveal imposter identity in result phase
    const imposterVisible = room.phase === 'result' ? room.imposter : '';

    // Compute tally for result phase
    let resultWithTally: PlayerStateView['result'] = null;
    if (room.result) {
      const tally = tallyVotes(room.votes);
      resultWithTally = { ...room.result, tally };
    }

    const view: PlayerStateView = {
      roomId: room.roomId,
      roomName: room.roomName,
      host: room.host,
      mode: room.mode,
      phase: room.phase,
      round: room.round,
      players: strippedPlayers,
      myRole,
      myWord,
      myTurn,
      isStandby,
      imposter: imposterVisible,
      scores: room.scores,
      votes: room.votes,
      category: room.phase === 'result' ? room.category : (room.mode === 'super' ? room.category : ''),
      result: resultWithTally,
      turnOrder: room.turnOrder,
      readyStartedAt: room.readyStartedAt ?? 0,
      ...(room.ownerUsername ? { ownerUsername: room.ownerUsername } : {}),
    };

    return NextResponse.json(view);
  } catch (err) {
    console.error('GET /api/rooms/[roomId]/state error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
