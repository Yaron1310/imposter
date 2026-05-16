import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@blindspot.game';

export async function sendVerificationEmail(to: string, code: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your BLINDSPOT verification code',
    html: `
      <div style="font-family:monospace;max-width:400px;margin:0 auto;padding:32px">
        <h2 style="letter-spacing:0.1em">BLINDSPOT</h2>
        <p>Your verification code is:</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:0.3em;padding:16px 0">${code}</div>
        <p style="color:#888;font-size:0.85rem">Expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your BLINDSPOT password',
    html: `
      <div style="font-family:monospace;max-width:400px;margin:0 auto;padding:32px">
        <h2 style="letter-spacing:0.1em">BLINDSPOT</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#e53e3e;color:#fff;text-decoration:none;border-radius:8px">Reset Password</a>
        <p style="color:#888;font-size:0.85rem">Expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
