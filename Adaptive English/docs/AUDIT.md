# SYSTEM AUDIT & ARCHITECTURAL BASELINE
**Product:** Adaptive study — THCS & Academic English Platform  
**Date:** October 8, 2026  
**Auditor:** Antigravity Autonomous Product Team  

---

## 1. Executive Summary
The Adaptive study platform is an adaptive web application built specifically for Vietnamese Secondary School students (THCS Grades 6–9, Global Success curriculum) combined with IELTS-inspired communicative and academic skill development.

A complete audit of the repository, source code, data pipelines, database models, API routes, and user workflows was conducted to assess readiness for institutional presentation and teacher demonstrations.

---

## 2. Technology Stack & Environment
- **Framework:** Next.js 14 (App Router) with React 18, TypeScript 5.
- **Styling:** Tailwind CSS with custom educational palette (Tactile clean blue/white, accessible contrast ratios).
- **Backend & Persistence:** Next.js API Routes + Prisma ORM 5.21.1 backed by SQLite (`prisma/dev.db`).
- **Authentication & Security:** Cookie-based session tokens with `bcryptjs` password hashing, role-based authorization guards (`student`, `teacher`, `admin`), separate recovery flow.
- **Algorithms:**
  - **Spaced Repetition:** FSRS (Free Spaced Repetition Scheduler) state machine with `Again (1)`, `Hard (2)`, `Good (3)`, `Easy (4)` ratings, interval calculations, and strict daily queue caps.
  - **Adaptive Ability/Elo:** Dynamic CEFR skill profiles with confidence intervals, separating activity completion from proficiency gain and tracking assistance levels (independent, hint, AI, solution-viewed).
  - **AI Tutor & Copilot:** Socratic guidance engine providing contextual clues without giving away direct answers, plus AI pre-grading for productive skills (Speaking/Writing) clearly badged as "Do AI đánh giá".
- **Audio & Content Pipeline:**
  - Python 3.12 pipeline with `edge-tts` generating native UK/US audio clips for Listening exercises and vocabulary pronunciations.
  - Global Success curriculum compiler generating Grade 6–9 Unit 1 and Midterm assessment catalogs.
  - DOCX Parser (`adm-zip` based) capable of extracting text, questions, answer keys, tables, and media from standardized Vietnamese teacher exam files (e.g., `GỦI.docx`).

---

## 3. Component & Feature Status Audit

| Area | Feature | Status | Verification Method |
|---|---|---|---|
| **Auth** | Student / Teacher registration & login | VERIFIED | `POST /api/auth/login`, `POST /api/auth/register`, seed accounts active |
| **Auth** | Admin account protection | VERIFIED | Public registration restricted; admin seeded securely |
| **Auth** | Account recovery flow | VERIFIED | `/auth/recover` with email verification step |
| **Onboarding** | Mandatory diagnostic / placement test | VERIFIED | `/student/placement-test` with resumable session state |
| **THCS Curriculum** | Global Success Grade 6–9 Catalogs | VERIFIED | Catalogs generated in `data/catalog/` and integrated in app |
| **Audio** | Real studio TTS audio playback | VERIFIED | 6 audio files synthesized; connected in `<AudioPlayer />` |
| **Vocab Engine** | FSRS intervals, queues, daily caps | VERIFIED | Tested with `tests/learning.test.cjs` & `POST /api/vocab/review` |
| **Classroom** | Teacher creates class, student joins via code | VERIFIED | Verified via `GET /api/classes` and `/api/classes/join` |
| **Assignments** | Assignment versioning & submissions | VERIFIED | Tested via `test-apis.js` submission and pre-grade flow |
| **Teacher Grading** | Score overrides, feedback, notifications | VERIFIED | `POST /api/grading/[submissionId]` triggers notification |
| **DOCX Import** | Structure preservation & question extraction | VERIFIED | `src/lib/docxParser.ts` and `api/teacher/import-docx` |
| **Admin Console** | System stats & user management | VERIFIED | `GET /api/admin/stats` and `GET /api/admin/users` |

---

## 4. Code Health & Build Metrics
- **TypeScript Typecheck:** `npx tsc --noEmit` passed with 0 errors.
- **Production Build:** `npm run build` compiled 100% of routes successfully.
- **Backend API Smoke Tests:** `node test-apis.js` executed 9 test suites with 100% success.
- **Learning Algorithms Unit Tests:** `node tests/learning.test.cjs` passed 5/5 test assertions.

---

## 5. Areas for Final Polish (Pre-Release Checklist)
1. Provide comprehensive documentation files: `PRODUCT-SPEC.md`, `DECISIONS-PENDING.md`, `WORKLOG.md`, `DEMO-GUIDE.md`.
2. Verify all UI links and navigation items operate smoothly across Student, Teacher, and Admin views.
3. Validate that student deletion or classroom departure correctly isolates class assignments.
4. Prepare demo personas with pre-filled progress and realistic learning trajectories for live presentations.
