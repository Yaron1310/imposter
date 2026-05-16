import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import type { RoomState } from '@/lib/types';

export async function GET() {
  try {
    const roomIds = await redis.smembers('rooms:index');
    if (!roomIds || roomIds.length === 0) {
      return NextResponse.json({});
    }

    const rooms: Record<string, {
      name: string;
      host: string;
      phase: string;
      playerCount: number;
      mode: string;
      ownerUsername?: string;
      gamezoneId?: string;
    }> = {};

    await Promise.all(
      roomIds.map(async (roomId) => {
        const room = await redis.get<RoomState>(`room:${roomId}`);
        if (!room) {
          // Key expired — remove ghost entry from the index
          await redis.srem('rooms:index', roomId);
          return;
        }
        if (room.phase === 'lobby') {
          rooms[roomId] = {
            name: room.roomName,
            host: room.host,
            phase: room.phase,
            playerCount: Object.keys(room.players).length,
            mode: room.mode,
            ...(room.ownerUsername ? { ownerUsername: room.ownerUsername } : {}),
            ...(room.gamezoneId ? { gamezoneId: room.gamezoneId } : {}),
          };
        }
      })
    );

    return NextResponse.json(rooms);
  } catch (err) {
    console.error('GET /api/rooms error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { roomName: string; hostName: string; mode: 'imposter' | 'super'; ownerUsername?: string; gamezoneId?: string };
    const { roomName, hostName, mode, ownerUsername, gamezoneId } = body;

    if (!roomName || roomName.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }
    if (!hostName || hostName.trim().length === 0 || hostName.length > 24) {
      return NextResponse.json({ error: 'Host name must be 1-24 characters' }, { status: 400 });
    }
    if (mode !== 'imposter' && mode !== 'super') {
      return NextResponse.json({ error: 'Mode must be imposter or super' }, { status: 400 });
    }

    const normalizedName = roomName.trim().toLowerCase().replace(/\s+/g, ' ');
    const existingRoomId = await redis.get<string>(`room:name:${normalizedName}`);
    if (existingRoomId) {
      return NextResponse.json({ error: 'A room with this name already exists' }, { status: 409 });
    }

    const slug = normalizedName.replace(/\s+/g, '');
    const roomId = `${slug}_${Math.random().toString(36).slice(2, 7)}`;

    const state: RoomState = {
      roomId,
      roomName: roomName.trim(),
      host: hostName.trim(),
      mode,
      phase: 'lobby',
      round: 0,
      players: {
        [hostName.trim()]: { ready: false, role: '', turn: 0 },
      },
      word: '',
      imposterWord: '',
      category: '',
      imposter: '',
      lastImposter: '',
      lastWord: '',
      usedWords: [],
      usedCategories: [],
      standby: [],
      votes: {},
      scores: { [hostName.trim()]: 0 },
      result: null,
      turnOrder: {},
      readyStartedAt: 0,
      updatedAt: Date.now(),
      ...(ownerUsername ? { ownerUsername } : {}),
      ...(gamezoneId ? { gamezoneId } : {}),
    };

    await redis.set(`room:${roomId}`, state, { ex: 7200 });
    await redis.set(`room:name:${normalizedName}`, roomId, { ex: 7200 });
    await redis.sadd('rooms:index', roomId);

    return NextResponse.json({ ok: true, roomId, roomName: state.roomName, mode });
  } catch (err) {
    console.error('POST /api/rooms error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
