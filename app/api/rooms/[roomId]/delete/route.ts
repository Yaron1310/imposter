import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import type { RoomState } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const body = await request.json() as { name: string };
    const { name } = body;

    const room = await redis.get<RoomState>(`room:${roomId}`);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.host !== name) {
      return NextResponse.json({ error: 'Only the host can delete the room' }, { status: 403 });
    }

    const normalizedName = room.roomName.trim().toLowerCase().replace(/\s+/g, ' ');
    await redis.del(`room:${roomId}`, `room:name:${normalizedName}`);
    await redis.srem('rooms:index', roomId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/rooms/[roomId]/delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
