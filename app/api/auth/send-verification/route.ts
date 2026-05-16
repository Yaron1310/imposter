import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const existing = await redis.get<string>(`user:email:${email}`);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Rate-limit: one code per email per minute
    const rateLimitKey = `email:verify:ratelimit:${email}`;
    const limited = await redis.get(rateLimitKey);
    if (limited) {
      return NextResponse.json({ error: 'Please wait before requesting another code' }, { status: 429 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await Promise.all([
      redis.set(`email:verify:${email}`, code, { ex: 900 }),
      redis.set(rateLimitKey, '1', { ex: 60 }),
    ]);

    await sendVerificationEmail(email, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/auth/send-verification error:', err);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
