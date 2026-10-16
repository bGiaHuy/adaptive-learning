// Stable event IDs make links explicit and prevent duplicate notifications.
export function notificationTarget(id: string) {
  const parts = id.split(':');
  const [event, resource, recipient, classId] = parts;
  if (!recipient || !resource || !/^[a-zA-Z0-9_-]+$/.test(resource)) return null;
  if (event === 'assignment' && parts.length === 4 && /^[a-zA-Z0-9_-]+$/.test(classId)) return `/student/classroom/${classId}/assignment/${resource}`;
  if (event === 'submission' && parts.length === 3) return `/teacher/grading/${resource}`;
  return null;
}

export async function notifyAssignment(db: any, assignment: any) {
  const members = await db.classroomMember.findMany({ where: { classId: assignment.classId }, select: { studentId: true } });
  for (const member of members) await db.notification.create({ data: {
    id: `assignment:${assignment.id}:${member.studentId}:${assignment.classId}`, userId: member.studentId,
    type: 'assignment', title: 'Bạn có bài tập mới', message: `Giáo viên vừa giao bài “${assignment.title}”.`,
  } });
}

export async function notifySubmission(db: any, submission: any, assignment: any, studentName: string) {
  await db.notification.create({ data: {
    id: `submission:${submission.id}:${assignment.classroom.teacherId}`, userId: assignment.classroom.teacherId,
    type: 'submission', title: 'Có học sinh nộp bài', message: `${studentName} đã nộp bài “${assignment.title}”.`,
  } });
}
