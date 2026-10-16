export function parseJson(value: string | null | undefined, fallback: any = null): any {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}
export function exerciseQuestions(exercises: any[]) {
  return exercises.flatMap(exercise => {
    const raw = parseJson(exercise.dataJson, []);
    const questions = Array.isArray(raw) ? raw : raw.questions;
    return Array.isArray(questions) ? questions : [];
  });
}
export async function loadAssignmentQuestions(db: any, assignment: any) {
  if (!assignment.packId) return [];
  return exerciseQuestions(await db.exercise.findMany({ where: { packId: assignment.packId, ...(assignment.selectedExerciseIdsJson ? { id: { in: parseJson(assignment.selectedExerciseIdsJson, []) } } : {}) }, orderBy: { exerciseNumber: 'asc' } }));
}
/** Only fully keyed single-choice sets can be automatically graded. */
export function autoGrade(questions: any[], answers: Record<string, string>, maxScore: number) {
  if (!questions.length || questions.some(q => !Array.isArray(q.options) || !q.options.length || !q.options.some((o: any) => o.id === q.correctAnswer))) return null;
  if (new Set(questions.map(q => q.id)).size !== questions.length || questions.some(q => !q.id || !q.options.some((o: any) => o.id === answers[q.id]))) return null;
  const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  return { source: 'automatic', score: Math.round(correct / questions.length * maxScore * 100) / 100, correct, total: questions.length, summary: `${correct}/${questions.length} câu đúng`, questions };
}
/** Never leak unreleased marks, teacher notes or stored answer-key snapshots. */
export function studentSubmission(submission: any) {
  const visible = submission.status === 'graded';
  return { ...submission, teacherScore: visible ? submission.teacherScore : null, teacherFeedback: visible ? submission.teacherFeedback : null, aiPreGradeJson: null, abilityEvidenceJson: visible ? submission.abilityEvidenceJson : null };
}
