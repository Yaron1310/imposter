import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { hashPassword } from '@/lib/auth';
import type { UserRecord } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: string; password?: string };
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const email = await redis.get<string>(`password:reset:${token}`);
    if (!email) {
      return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
    }

    const userId = await redis.get<string>(`user:email:${email}`);
    if (!userId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const user = await redis.get<UserRecord>(`user:id:${userId}`);
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const passwordHash = await hashPassword(password);
    await Promise.all([
      redis.set(`user:id:${userId}`, { ...user, passwordHash }),
      redis.del(`password:reset:${token}`),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/auth/reset-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
