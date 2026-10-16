import { requestMwapiJson } from './aiEngine';

export const ABILITY_SKILLS = ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'];
export const LEVEL_RATINGS: Record<string, number> = { A1: 400, A2: 800, B1: 1200, B2: 1600, C1: 2000, C2: 2400 };
export function abilityLevel(rating: number) {
  return rating >= 2200 ? 'C2' : rating >= 1800 ? 'C1' : rating >= 1400 ? 'B2' : rating >= 1000 ? 'B1' : rating >= 600 ? 'A2' : 'A1';
}
export function readDifficulty(json: unknown): any {
  try {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    if (d?.status !== 'assessed' || d.source !== 'ai' || !Number.isFinite(d.rating) || d.rating < 100 || d.rating > 2400 || !Number.isFinite(d.maxScore) || d.maxScore <= 0 || !ABILITY_SKILLS.includes(d.skill)) return null;
    return d;
  } catch { return null; }
}

/** A platform-specific rating, not a certified CEFR result or standard Elo. */
export async function assessAssignmentDifficulty(input: { title: string; promptText: string; skill: string; maxScore: number; questions?: unknown[] }, allowAi = true) {
  const unavailable = { status: 'unavailable', source: 'ai', skill: input.skill, maxScore: input.maxScore, reason: 'AI chưa đánh giá được mức bài; bài này chưa tính điểm năng lực.' };
  if (!allowAi || !ABILITY_SKILLS.includes(input.skill)) return unavailable;
  const content = JSON.stringify(input);
  if (content.length > 40000 || (!input.promptText.trim() && !input.questions?.length)) return unavailable;
  try {
    const result = await requestMwapiJson('Assess the difficulty of this English assignment, never grade a student. Use the actual task and questions. Return JSON {rating: number, level: "A1"|"A2"|"B1"|"B2"|"C1"|"C2", confidence: number, rationale: string}. Platform difficulty anchors: A1=400,A2=800,B1=1200,B2=1600,C1=2000,C2=2400; rating range 100..2400. Confidence 0..100. If the task lacks necessary passage, audio or image context, return {unavailable:true}. This is an internal estimate, not a certified CEFR score.', content, 800);
    if (result.unavailable || typeof result.rating !== 'number' || !Number.isFinite(result.rating) || result.rating < 100 || result.rating > 2400 || typeof result.confidence !== 'number' || !Number.isFinite(result.confidence) || result.confidence < 0 || result.confidence > 100 || typeof result.rationale !== 'string' || !result.rationale.trim()) return unavailable;
    const rating = Math.round(result.rating);
    return { status: 'assessed', source: 'ai', rating, level: abilityLevel(rating), confidence: result.confidence, rationale: result.rationale.slice(0, 1500), skill: input.skill, maxScore: input.maxScore, assessedAt: new Date().toISOString() };
  } catch { return unavailable; }
}

export async function abilityEvidenceForGrade(tx: any, submission: any, score: number) {
  const version = await tx.assignmentVersion.findUnique({ where: { assignmentId_version: { assignmentId: submission.assignmentId, version: submission.versionId } } });
  const difficulty = readDifficulty(version?.difficultyJson);
  if (!difficulty) return null;
  if (!Number.isFinite(score) || score < 0 || score > difficulty.maxScore) throw new Error('Điểm phải nằm trong thang điểm phiên bản đề đã làm.');
  let previous: any;
  try { previous = JSON.parse(submission.abilityEvidenceJson || 'null'); } catch { /* invalid old evidence is replaced */ }
  return JSON.stringify({ source: 'assignment-ability-v1', skill: difficulty.skill, assignmentRating: difficulty.rating, maxScore: difficulty.maxScore, score, earnedRating: score / difficulty.maxScore * difficulty.rating, version: submission.versionId, publishedAt: previous?.publishedAt || new Date().toISOString() });
}

export function readAbilityEvidence(submission: any): any {
  if (submission.status !== 'graded') return null;
  try {
    const e = JSON.parse(submission.abilityEvidenceJson || 'null');
    if (e?.source !== 'assignment-ability-v1' || !ABILITY_SKILLS.includes(e.skill) || e.version !== submission.versionId || e.score !== submission.teacherScore || !Number.isFinite(e.assignmentRating) || e.assignmentRating < 100 || e.assignmentRating > 2400 || !Number.isFinite(e.maxScore) || e.maxScore <= 0 || !Number.isFinite(e.score) || e.score < 0 || e.score > e.maxScore || !Number.isFinite(Date.parse(e.publishedAt))) return null;
    return { ...e, earnedRating: e.score / e.maxScore * e.assignmentRating, id: submission.id };
  } catch { return null; }
}

export function combineAbility(baseline: number | null, evidence: any[]) {
  let rating = baseline;
  const unique = Array.from(new Map(evidence.map(e => [e.id, e])).values());
  unique.sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt) || a.id.localeCompare(b.id));
  for (const e of unique) rating = rating === null ? e.earnedRating : .8 * rating + .2 * e.earnedRating;
  return rating === null ? null : Math.round(rating * 100) / 100;
}
