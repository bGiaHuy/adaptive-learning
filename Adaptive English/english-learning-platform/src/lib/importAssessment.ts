import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { readDifficulty } from './assignmentAbility';

function fingerprint(title: string, exercises: any[]) {
  return createHash('sha256').update(JSON.stringify({ title, exercises: exercises.map(ex => ({ instruction: ex.instruction, questions: ex.questions.map((q: any) => ({ prompt: q.prompt, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation })) })) })).digest('hex');
}
export function signImportAssessment(userId: string, title: string, exercises: any[], difficulty: any) {
  const key = process.env.DATABASE_URL;
  if (!key || !readDifficulty(difficulty)) return null;
  const payload = Buffer.from(JSON.stringify({ userId, hash: fingerprint(title, exercises), difficulty, expires: Date.now() + 2 * 3600000 })).toString('base64url');
  return payload + '.' + createHmac('sha256', key).update(payload).digest('base64url');
}
export function verifyImportAssessment(token: unknown, userId: string, title: string, exercises: any[]) {
  try {
    if (typeof token !== 'string' || token.length > 10000 || !process.env.DATABASE_URL) return null;
    const [payload, signature] = token.split('.');
    const expected = createHmac('sha256', process.env.DATABASE_URL).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.userId === userId && data.expires > Date.now() && data.hash === fingerprint(title, exercises) ? readDifficulty(data.difficulty) : null;
  } catch { return null; }
}
