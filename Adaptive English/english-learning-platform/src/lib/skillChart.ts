import { placementQuestions } from './placementQuestions';
import type { PlacementState } from './store';
import type { SkillEstimate } from '@/types';

export const skillAxes = [
  { key: 'reading', label: 'Đọc', href: '/student/learn?skill=reading' },
  { key: 'listening', label: 'Nghe', href: '/student/learn?skill=listening' },
  { key: 'writing', label: 'Viết', href: '/student/workspace/writing/assign-1' },
  { key: 'speaking', label: 'Nói', href: '/student/workspace/speaking/lesson-speaking-01' },
  { key: 'grammar', label: 'Ngữ pháp', href: '/student/learn?skill=grammar' },
  { key: 'vocabulary', label: 'Từ vựng', href: '/student/vocabulary' },
] as const;

/** Only completed, scored sections supply a plotted level. Missing evidence is null, never zero. */
export function getSkillChartData(placement: PlacementState) {
  return skillAxes.map(axis => {
    const questions = placementQuestions.filter(question => question.section === axis.key);
    const answers = axis.key === 'reading' ? placement.readingAnswers : axis.key === 'listening' ? placement.listeningAnswers : axis.key === 'grammar' ? placement.grammarAnswers : {};
    const answered = questions.filter(question => question.options?.some(option => option.id === answers[question.id]) ?? false).length;
    const correct = questions.filter(question => answers[question.id] === question.correct).length;
    const complete = questions.length > 0 && answered === questions.length;
    const percentage = complete ? Math.round(correct / questions.length * 100) : null;
    const level = percentage === null ? null : percentage >= 80 ? 'B1' : percentage >= 50 ? 'A2' : 'A1';
    return { ...axis, total: questions.length, answered, correct, percentage, level, radius: level === 'B1' ? 3 : level === 'A2' ? 2 : level === 'A1' ? 1 : null };
  });
}

export function getSkillProgressChartData(estimates: Record<string, SkillEstimate>) {
  const radii: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  return skillAxes.map(axis => {
    const estimate = estimates[axis.key];
    const level = estimate?.evaluated && estimate.evidenceCount > 0 && radii[estimate.level] ? estimate.level : null;
    return {
      ...axis,
      level,
      radius: level ? radii[level] : null,
      evidenceCount: estimate?.evidenceCount || 0,
      scoreDisplay: estimate?.scoreDisplay || 'Chưa có dữ liệu thật',
      evaluated: !!estimate?.evaluated,
    };
  });
}
