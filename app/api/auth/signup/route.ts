import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { hashPassword, signToken, isValidUsername, COOKIE_NAME } from '@/lib/auth';
import type { UserRecord } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username?: string; email?: string; password?: string; verificationCode?: string };
    const { username: rawUsername, email: rawEmail, password, verificationCode } = body;

    if (!rawUsername || !rawEmail || !password || !verificationCode) {
      return NextResponse.json({ error: 'username, email, password, and verification code are required' }, { status: 400 });
    }

    const username = rawUsername.trim().toLowerCase();
    const email = rawEmail.trim().toLowerCase();

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 chars, alphanumeric/hyphens, not a reserved word' },
        { status: 400 }
      );
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const [existingByEmail, existingByUsername, storedCode] = await Promise.all([
      redis.get<string>(`user:email:${email}`),
      redis.get<string>(`user:username:${username}`),
      redis.get<string>(`email:verify:${email}`),
    ]);

    if (existingByEmail) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    if (existingByUsername) {
      return NextResponse.json({ error: 'This username is already taken' }, { status: 409 });
    }
    if (!storedCode || storedCode !== verificationCode.trim()) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    const user: UserRecord = { id: userId, username, email, passwordHash, createdAt: Date.now() };

    await Promise.all([
      redis.set(`user:id:${userId}`, user),
      redis.set(`user:email:${email}`, userId),
      redis.set(`user:username:${username}`, userId),
      redis.sadd('users:index', userId),
      redis.del(`email:verify:${email}`),
    ]);

    const token = signToken({ userId, username, email });

    const response = NextResponse.json({ ok: true, username });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('POST /api/auth/signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
