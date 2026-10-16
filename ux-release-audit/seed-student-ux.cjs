const fs = require('node:fs');
const path = require('node:path');
const app = path.resolve(__dirname, '../Adaptive English');
const { PrismaClient } = require(require.resolve('@prisma/client', { paths: [app] }));
const argon = require(require.resolve('@node-rs/argon2', { paths: [app] }));
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://am:am_dev_password@127.0.0.1:5432/adaptive_student_ux_20261006?schema=public' } } });
async function main() {
  const passwordHash = await argon.hash('StudentUXOnly2026!');
  for (const username of ['ux_beginner', 'ux_returning']) {
    await db.user.upsert({ where: { username }, create: { username, fullName: username === 'ux_beginner' ? 'Học sinh mới — kiểm thử UX' : 'Học sinh quay lại — kiểm thử UX', passwordHash, role: 'STUDENT' }, update: {} });
  }
  let lessonIndex = 0;
  for (const batchId of ['001', '002', '003']) {
    const batch = JSON.parse(fs.readFileSync(path.join(app, `content/english/batch_${batchId}.json`), 'utf8'));
    for (const topic of batch.topics) {
      const data = { title: topic.title, description: topic.description || null, orderIndex: lessonIndex++ };
      await db.englishTopic.upsert({ where: { id: topic.id }, create: { id: topic.id, ...data }, update: data });
    }
    for (const lesson of batch.lessons) {
      const data = { topicId: lesson.topicId, title: lesson.title, summary: lesson.summary || null, level: lesson.level, kind: lesson.kind, body: lesson.body || null, audioUrl: lesson.audioUrl || null, transcript: lesson.transcript || [], sourceAttribution: lesson.sourceAttribution || null, published: true, orderIndex: lessonIndex++ };
      await db.englishLesson.upsert({ where: { id: lesson.id }, create: { id: lesson.id, ...data }, update: data });
      for (const [orderIndex, exercise] of lesson.exercises.entries()) {
        const ex = { lessonId: lesson.id, kind: exercise.kind, prompt: exercise.prompt, options: exercise.options || [], correctAnswer: exercise.correctAnswer, acceptedAnswers: exercise.acceptedAnswers || [], explanation: exercise.explanation || null, segmentId: exercise.segmentId || null, orderIndex };
        await db.englishExercise.upsert({ where: { id: exercise.id }, create: { id: exercise.id, ...ex }, update: ex });
      }
    }
  }
  console.log(JSON.stringify({ lessons: await db.englishLesson.count(), exercises: await db.englishExercise.count(), users: await db.user.count() }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
