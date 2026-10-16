const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function checkDb() {
  const users = await prisma.user.count();
  const classrooms = await prisma.classroom.count();
  const courses = await prisma.course.count();
  const units = await prisma.unit.count();
  const lessons = await prisma.lesson.count();
  const packs = await prisma.thematicPack.count();
  const vocabItems = await prisma.vocabularyItem.count();
  const exercises = await prisma.exercise.count();
  const assignments = await prisma.assignment.count();
  const submissions = await prisma.submission.count();

  console.log('=== THONG KE DATABASE THAT (dev.db) ===');
  console.log('Users:', users);
  console.log('Classrooms:', classrooms);
  console.log('Courses in DB:', courses);
  console.log('Units in DB:', units);
  console.log('Lessons in DB:', lessons);
  console.log('Thematic Packs in DB:', packs);
  console.log('Vocabulary Items in DB:', vocabItems);
  console.log('Exercises in DB:', exercises);
  console.log('Assignments in DB:', assignments);
  console.log('Submissions in DB:', submissions);

  // Breakdown of lessons in DB
  const dbLessons = await prisma.lesson.findMany({ select: { id: true, title: true, skill: true } });
  console.log('Lessons in DB details:');
  dbLessons.forEach(l => console.log(`  - [${l.skill}] ${l.id}: ${l.title}`));

  // Audio files check
  const audioDir = path.join(__dirname, 'public/audio');
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  console.log('\n=== THONG KE AUDIO FILES (public/audio) ===');
  console.log('Total audio files:', audioFiles.length);
  audioFiles.forEach(f => console.log('  - ' + f));

  // Check mockData.ts lines
  const mockContent = fs.readFileSync(path.join(__dirname, 'src/lib/mockData.ts'), 'utf8');
  const lessonMatches = mockContent.match(/id:\s*["']lesson-[^"']+["']/g) || [];
  const questionMatches = mockContent.match(/id:\s*["']q\d+["']/g) || [];
  const audioMatches = mockContent.match(/audioUrl:\s*["'][^"']+["']/g) || [];
  const explanationMatches = mockContent.match(/explanation:\s*["'][^"']+["']/g) || [];

  console.log('\n=== THONG KE MOCK DATA (mockData.ts) ===');
  console.log('Mock lessons defined:', lessonMatches.length, lessonMatches);
  console.log('Questions in mockData:', questionMatches.length);
  console.log('Questions with audioUrl:', audioMatches.length);
  console.log('Questions with explanation:', explanationMatches.length);

  await prisma.$disconnect();
}

checkDb().catch(e => {
  console.error(e);
  process.exit(1);
});
