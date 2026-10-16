import crypto from 'crypto';

export const OTP_TTL_MS = 10 * 60 * 1000;
export function normalizeRegistrationEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function otpSecret() {
  const secret = process.env.REGISTRATION_OTP_SECRET || process.env.RESEND_API_KEY;
  if (!secret) throw new Error('Email service is not configured');
  return secret;
}
export function hashRegistrationOtp(email: string, code: string) {
  return crypto.createHmac('sha256', otpSecret()).update(`${email}:${code}`).digest('hex');
}
export function matchesRegistrationOtp(email: string, code: string, hash: string) {
  if (!/^\d{6}$/.test(code) || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return crypto.timingSafeEqual(Buffer.from(hashRegistrationOtp(email, code), 'hex'), Buffer.from(hash, 'hex'));
}
export async function sendRegistrationOtp(email: string, code: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.AUTH_EMAIL_FROM, to: [email],
      subject: 'Mã xác thực đăng ký Adaptive English',
      text: `Mã OTP đăng ký Adaptive English của bạn: ${code}. Mã có hiệu lực trong 10 phút. Không chia sẻ mã này với người khác. Nếu bạn không yêu cầu, hãy bỏ qua email này.` }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Email delivery failed');
}
