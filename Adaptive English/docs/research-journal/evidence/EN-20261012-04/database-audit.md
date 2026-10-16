# Database persistence audit — 2026-10-12

Scope: source-code and Prisma schema review. No production SQL connection, write, seed, reset, migration or deployment performed. Supabase project tools absent in this session. Prior production env inventory indicates Neon/PostgreSQL configuration; no live data existence or database integrity claim is made.

Executed: `npx --no-install prisma validate` in english-learning-platform, PASS exit 0. This validates local schema only, not production tables or stored rows.

Findings:
1. High: teacher/import-docx publish returns 503 on Vercel. Local publish only creates assignment metadata and upserts fixed pack-unit-2; exercises/questions and vocabulary payload are not persisted, assignment is not linked to packId. Multiple imports share one pack. Parse result is React state, not a durable import record.
2. High: LessonAttempt stores aggregate result only, without answers, per-question results, source question snapshot or AI feedback. session-summary uses useLocalDraft with the common adaptive_study_last_session key; writing AI results update this local object. This key is not user-scoped. Cross-device detailed review is not supported by that path.
3. High: placement draft endpoint returns success without a write when completed=false. Completion writes StudentSkillProfile aggregates, not raw answers/writing/version/currentStep. Speaking blob URL lives in memory only.
4. High: audio/upload returns 503 on Vercel; local files under public/uploads/audio are not persistent cloud storage.
5. High: store saveAssignmentDraft, submitAssignment and gradeSubmission fire requests without checking response.ok, swallow network errors and update UI immediately. HTTP failure need not reject fetch, so apparent success is not proof of DB save. createClassroom also has a local fallback on errors.
6. Schema contains models and API write paths for accounts/sessions, classrooms/members, assignments/submissions/grades, vocabulary scheduling/history, skill profiles/lesson aggregates, notifications and Leaf chat/memory. Presence of schema/API does NOT prove production persistence works end-to-end.
7. build-vercel.cjs generates Prisma PostgreSQL client then builds Next; no reset/seed command in that release script. No evidence established that each deployment resets production data.

Not verified: actual production host/current row counts/schema drift, SQL permissions/RLS, backups/restore, persistence across redeployment, authenticated cross-device save/read. Supabase-specific RLS assessment cannot be made before confirming target project/provider. No fixes implemented because user requested an audit.
