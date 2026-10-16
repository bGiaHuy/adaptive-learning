const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const { DatabaseSync }=require('node:sqlite');
test('lesson schema is additive, repeatable and preserves existing users',()=>{
  const db=new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE "User" (id TEXT PRIMARY KEY); INSERT INTO "User" VALUES (\'test-user\');');
  const migration=fs.readFileSync('prisma/migrations/20261012103000_lesson_attempt_postgres/migration.sql','utf8');
  db.exec(migration);db.exec(migration);
  assert.equal(db.prepare('SELECT count(*) AS n FROM "User"').get().n,1);
  assert.equal(db.prepare('PRAGMA table_info("LessonAttempt")').all().length,12);
  assert.equal(db.prepare('PRAGMA foreign_key_list("LessonAttempt")').all().length,1);
  db.close();
});
