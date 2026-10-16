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

  const audioDir = path.join(__dirname, '../english-learning-platform/public/audio');
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  console.log('Real Audio Files in public/audio:', audioFiles.length);
  audioFiles.forEach(f => console.log(' - Audio file:', f));

  await prisma.$disconnect();
}

checkDb().catch(e => {
  console.error(e);
  process.exit(1);
});
