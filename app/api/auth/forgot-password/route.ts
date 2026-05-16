import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Always return ok to avoid email enumeration
    const userId = await redis.get<string>(`user:email:${email}`);
    if (!userId) {
      return NextResponse.json({ ok: true });
    }

    // Rate-limit: one reset email per email per 5 minutes
    const rateLimitKey = `password:reset:ratelimit:${email}`;
    const limited = await redis.get(rateLimitKey);
    if (limited) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomUUID();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await Promise.all([
      redis.set(`password:reset:${token}`, email, { ex: 3600 }),
      redis.set(rateLimitKey, '1', { ex: 300 }),
    ]);

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/auth/forgot-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
