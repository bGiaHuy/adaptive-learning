# PRODUCT SPECIFICATION: Adaptive study
**Target:** THCS Secondary English (Grades 6–9 Global Success) & IELTS-Inspired Communicative Skills  
**Audience:** Teachers, School Administrators, Department of Education & Training Evaluators  
**Date:** October 8, 2026  

---

## 1. Product Mission & Positioning

### [CONFIRMED] Identity & Core Philosophy
- **Name:** Adaptive study.
- **Product Mission:** A personalized English learning platform for Vietnamese secondary school students (THCS Grade 6–9), aligning directly with the MOET **Global Success** curriculum while integrating **IELTS-inspired communicative competencies** (Skimming/Scanning, Note-taking, Socratic synthesis, Speaking fluency, and Coherent paragraph composition).
- **Not an Exam Crammer:** It is not an IELTS test drill machine. It builds core academic English proficiency using rigorous CEFR-mapped benchmarks.
- **Pedagogical Language Rules:**
  - **Immersion Principle:** All prompt instructions, passage texts, questions, audio recordings, and answer choices are strictly in natural, authentic English.
  - **Bilingual Pedagogical Scaffolding:** Explanations (`explanation`) and Socratic hints (`hint`) provide Vietnamese clarity so students understand their errors conceptually without breaking English immersion.

---

## 2. Core Hierarchy & Content Organization

### [CONFIRMED] Organizational Axis
- **Content Hierarchy:** `Course` → `Unit` → `Lesson` → `Exercise / Question`.
- **Curriculum Scope:**
  - Grade 6: Unit 1 (My New School), Midterm Test 1.
  - Grade 7: Unit 1 (My Hobbies), Midterm Test 1.
  - Grade 8: Unit 1 (Life in the Countryside), Midterm Test 1.
  - Grade 9: Unit 1 (Local Community), Midterm Test 1.
  - Thematic Unit 2: Healthy Living (parsed and structured from teacher DOCX materials).
- **Skill Pillars:**
  - **Listening:** Authentic dialogue and monologue audio tracks synthesized with high-fidelity British/American voices, transcript support, and comprehension checks.
  - **Speaking:** Audio prompt playback, user voice recording via web audio API, instant playback, AI fluency/pronunciation diagnostic ("Do AI đánh giá"), and teacher grading workflow.
  - **Reading:** Timed passage reading with Skimming & Scanning highlights, True/False/Not Given, multiple choice, and vocabulary-in-context.
  - **Writing:** Guided prompts, word-count indicators, auto-save drafts (`localStorage` + server), AI formative band estimate, and teacher rubric feedback.
  - **Grammar & Vocabulary:** Interactive sentence transformation, word-form derivation families, word bank fill-in-the-blank, and FSRS spaced repetition.

---

## 3. User Roles & Authentication

### [CONFIRMED] Role Architecture
- **Single Role per User:** Every account has exactly one primary role: `student`, `teacher`, or `admin`.
- **Public Registration:**
  - Students and teachers can register directly. Teacher accounts are immediately operational for demonstration purposes.
  - Admin accounts cannot be registered publicly; they are provisioned or seeded.
- **Account Recovery:** Self-service password recovery flow via email verification (`/auth/recover`).

---

## 4. Diagnostic Assessment & Adaptive Learning Engine

### [CONFIRMED] Diagnostic Placement Test
- **Mandatory First Run:** Every student undertakes an adaptive diagnostic test upon first login to establish their baseline CEFR levels across Reading, Listening, Grammar, and Vocabulary.
- **Resumable Session:** If a student is interrupted, their in-progress placement test session is preserved in local storage and can be resumed seamlessly.
- **Speaking Baseline:** Because initial automated speech evaluation requires acoustic sampling, unassessed Speaking is assigned a provisional starting level and updated through assignment submissions.

### [CONFIRMED] Mastery vs. Activity Completion
- Merely finishing an exercise does not equate to mastery.
- **Assistance Tracking:**
  - `Independent (100% mastery weight)`: Solved without any hints or tutor prompts.
  - `Hint Used (70% mastery weight)`: Socratic hint requested.
  - `AI Guided (40% mastery weight)`: AI breakdown requested.
  - `Solution Viewed (0% mastery gain)`: Answer key displayed before submission.
- **Uncalibrated Content Guard:** New or uncalibrated exercises do not artificially inflate calibrated student Elo ratings.

---

## 5. Vocabulary Learning System (FSRS Spaced Repetition)

### [CONFIRMED] FSRS Algorithm & Review Cycles
- **States:** `saved` → `learning` → `reviewing` → `mastered` (with `relearning` on lapse).
- **Rating Choices:** Again (1), Hard (2), Good (3), Easy (4).
- **Daily Study Caps:** Configurable daily new cards quota (5, 10, 20, Custom, Unlimited) with queue separation between New Cards and Due Reviews.
- **True Retention:** Multiple reviews on the same calendar day do not artificially count as separate review days.

---

## 6. Classroom Management & Teacher Copilot

### [CONFIRMED] Class & Assignment Workflow
- **Class Creation:** Teachers generate a unique 6-character class code (e.g., `IEL789`, `ENG456`).
- **Student Enrollment:** Students join via class code or invite link.
- **Assignment Versioning:** Edits to published assignments increment version numbers without invalidating previously submitted student work.
- **Grading & Notification:**
  - AI pre-evaluates submissions with band estimates and rubric suggestions ("Do AI đánh giá").
  - Teachers review, override scores, and write personalized feedback.
  - Grade finalization triggers immediate student notifications.
- **Scoped Teacher Permissions:** Teachers can only view and grade submissions belonging to their assigned classes.

---

## 7. Thematic Document Import (DOCX Parser)

### [CONFIRMED] Parser Capabilities
- **Direct Ingestion:** Teachers can upload existing school exams or unit worksheets in `.docx` format.
- **Dual Mode:**
  1. *Preserve Test Mode:* Direct extraction into digital quiz format preserving exercise sequence.
  2. *Adaptive Curriculum Generator:* Splits content into Vocabulary Items, Word Form Families, Grammar Rules, and Skill Exercises.
- **Format Resilience:** Extracts tables, cloze gaps, phonetic transcriptions, and embedded exercise media.

---

## 8. Status Classification (CONFIRMED / PROPOSED / PENDING)

| Area | Feature | Status | Implementation Detail |
|---|---|---|---|
| Core Curriculum | Grades 6–9 Global Success Units & Midterm | CONFIRMED | Seeded & playable in catalog and student workspace |
| Voice Synthesizer | UK/US TTS Studio Audio | CONFIRMED | `edge-tts` generated MP3 assets integrated |
| FSRS Spaced Repetition | 4-button review with stability & difficulty | CONFIRMED | Fully tested in `src/lib/fsrs.ts` and `/api/vocab/review` |
| AI Socratic Tutor | Non-leaking educational hints | CONFIRMED | Implemented in `src/lib/aiEngine.ts` and `AITutorDrawer.tsx` |
| DOCX Upload Parser | Full document unpacking & exercise typing | CONFIRMED | Implemented in `src/lib/docxParser.ts` |
| Level Skip Testing | High-achieving student level acceleration | PROPOSED | Configurable via settings, assumptions documented |
| Speech WebRTC Streaming | Live continuous phoneme streaming | PROPOSED | Current implementation uses Web Audio recorder + chunked upload |
| School MIS SSO | Integration with VNEDU / SMAS databases | PENDING | Documented in `DECISIONS-PENDING.md` for educational authorities |
