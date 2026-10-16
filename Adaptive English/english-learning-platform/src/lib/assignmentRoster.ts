export function assignmentRoster(members: any[], submissions: any[]) {
  return members.map(member => {
    const candidates = submissions.filter(s => s.studentId === member.studentId);
    candidates.sort((a, b) => Number(!['draft', 'in_progress'].includes(b.status)) - Number(!['draft', 'in_progress'].includes(a.status)) || String(b.submittedAt || b.gradedAt || '').localeCompare(String(a.submittedAt || a.gradedAt || '')) || a.id.localeCompare(b.id));
    const submission = candidates[0];
    let missing = false;
    try { missing = JSON.parse(submission?.aiPreGradeJson || 'null')?.source === 'missing-submission'; } catch { /* legacy snapshot */ }
    const submitted = !!submission && !missing && !['draft', 'in_progress'].includes(submission.status);
    return { studentId: member.studentId, studentName: member.student.name, submissionId: submission?.id || null, submitted, missing, score: submission?.teacherScore ?? null, published: submission?.status === 'graded', submission };
  });
}
