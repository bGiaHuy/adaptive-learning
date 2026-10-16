# DEMO GUIDE: Adaptive study
**Target Audience:** Secondary School Teachers, School Principals, Educational Department Evaluators  
**App URL:** http://localhost:3000  
**Demo Duration:** 8–10 minutes  

---

## 1. Demo Credentials

| Role | Email | Password | Primary Purpose |
|---|---|---|---|
| **Student** | `student@example.com` | `password123` | Demonstrates adaptive learning, listening with audio, FSRS vocab, speaking recorder, AI hints |
| **Teacher** | `teacher@example.com` | `password123` | Demonstrates classroom overview, assignment creation, DOCX exam import, submission grading |
| **Admin** | `admin@example.com` | `password123` | Demonstrates curriculum oversight, system health, user analytics, exercise counts |

*Quick Tip:* You can also use the bottom-right floating **Role Switcher** widget at any time to instantly switch perspectives without logging out!

---

## 2. Walkthrough Script (Step-by-Step)

### Step 1: Student Experience & Audio Listening (2 Minutes)
1. Navigate to `http://localhost:3000/auth/login` and log in as `student@example.com`.
2. Go to **Luyện tập (Learn)**: Notice the clear curriculum breakdown into **Global Success Lớp 6–9** and skill domains (Listening, Speaking, Reading, Writing).
3. Open **Listening Workspace** (`/student/workspace/listening/lesson-listening-01`):
   - Click the **Play Audio** button: High-fidelity native British/American dialogue plays immediately.
   - Toggle **Audio Transcript**: Highlight keywords while listening.
   - Note the authentic English questions and options: "Where does the conversation take place?", "What does the caller want to book?".
   - Open the **AI Tutor** drawer on the right: Ask for a hint. Notice the Socratic answer: it explains how to listen for context clues without spoiling the correct answer!
   - Submit answers to view the Vietnamese pedagogical explanation and score.

### Step 2: Vocabulary & FSRS Spaced Repetition (2 Minutes)
1. Click **Từ vựng (Vocabulary)** on the navigation bar (`/student/vocabulary`).
2. Show the **FSRS spaced repetition card queue**:
   - Highlight the queue separation: **Cần ôn tập hôm nay (Due Reviews)** vs. **Từ mới (New Words)**.
   - Click **Bắt đầu ôn tập (Review Now)** (`/student/vocabulary/flashcard`).
   - Flip a card (e.g., *nutritious*, *balanced diet*, *ingredient*).
   - Show the 4 scientific ratings: **Again (<10m)**, **Hard (1.2d)**, **Good (3.5d)**, **Easy (9d)**.
   - Point out that repeating the same card multiple times today does not inflate mastery days.

### Step 3: Speaking & Productive Practice (1.5 Minutes)
1. Open **Speaking Workspace** (`/student/workspace/speaking/lesson-speaking-01`):
   - Listen to the audio prompt: *"Describe a healthy habit you practice daily."*
   - Click **Record (Ghi âm)** to record sample speech via Web Audio API.
   - Stop and play back the audio.
   - Click **"Đánh giá bài nói bằng AI"**: Notice the pre-graded Band 6.5 breakdown (Fluency, Lexical Resource, Pronunciation) badged as **"Do AI đánh giá"**.

### Step 4: Teacher Workflow & DOCX Import (2.5 Minutes)
1. Switch to Teacher role (`teacher@example.com`) or use the role switcher.
2. Visit **Lớp học (Classrooms)** (`/teacher/classes`):
   - View managed classes: *IELTS Academic Target 6.5 (K24)* with class code `IEL789`.
   - Click into the class: View the student roster, attendance, and active assignments.
3. Visit **Tạo bài tập từ file DOCX** (`/teacher/assignments/import-docx`):
   - Demonstrate the automated document ingestion engine:
   - Preview how exam files (like `GỦI.docx` — Unit 2: Healthy Living) are parsed into 41 vocabulary items, 8 word-form families, and 14 structured exercises.
   - Select specific exercises and publish directly to the class.
4. Visit **Chấm bài (Grading)** (`/teacher/grading`):
   - Open a pending student submission.
   - View the AI pre-evaluation recommendations.
   - Enter teacher final score and constructive comments.
   - Click **Hoàn tất chấm điểm**: The student instantly receives an in-app grade notification.

### Step 5: Admin Analytics & Governance (1 Minute)
1. Switch to Admin (`/admin`).
2. Highlight system governance metrics:
   - Total registered students, teachers, and active classrooms.
   - Number of validated exercises and curated curriculum packs.
   - Content and user permission audit tables.

---

## 3. Key Differentiators to Emphasize to Evaluators
1. **Targeted for Vietnam Secondary Schools:** Direct alignment with Global Success Units 1–9 and midterm/final exam patterns.
2. **English Immersion with Pedagogical Support:** Questions in English; explanations and Socratic hints in Vietnamese.
3. **Scientific Memory Engine:** FSRS algorithm prevents cramming and tracks true retention.
4. **Teacher Superpowers:** Eliminates manual quiz typing by transforming existing `.docx` Word exams into digital assessments in seconds.
5. **Ethical AI:** AI assists and pre-grades with transparent disclosure, but teachers remain in full control of final scores.
