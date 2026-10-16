# DECISIONS PENDING & TECHNICAL ASSUMPTIONS
**Product:** Adaptive study  
**Date:** October 8, 2026  
**Document Owner:** Antigravity Autonomous Product Team  

---

## 1. Overview
In accordance with the autonomous operating guidelines, when product specifications lack explicit stakeholder decisions, safe, reversible defaults are adopted and documented below.

---

## 2. Pending Decisions & Chosen Defaults

### 1. Level-Skip (Test Nhảy Trình) Thresholds & Limits
- **Pending Decision:** Exact score percentage required to skip a CEFR band, maximum jump allowed in one attempt, and cooldown period before retesting.
- **Adopted Assumption / Reversible Implementation:**
  - *Passing Threshold:* 85% correct answers across all tested skills.
  - *Maximum Jump:* One full CEFR band (e.g., A1 → A2, or A2 → B1) per test event to prevent curriculum gaps.
  - *Cooldown:* 14 days between level-skip evaluations.
  - *Safety Guard:* Level-skipping requires independent completion (no hints or AI assistance allowed during the test).

### 2. Speaking Evaluation Fallback for Diagnostic Onboarding
- **Pending Decision:** How to set an accurate baseline CEFR speaking level when students take the initial placement test without microphone hardware or in a noisy classroom.
- **Adopted Assumption / Reversible Implementation:**
  - Initial placement sets Speaking to "Provisional" (matching the student's Listening comprehension score as a proxy starting point).
  - Prompts clearly indicate "Đánh giá tạm thời — Cần bổ sung bài nói trong lớp".
  - The first submitted speaking assignment in a classroom or self-study module recalibrates the Speaking profile.

### 3. School District / MIS Single Sign-On (SSO)
- **Pending Decision:** Protocol for connecting with school administrative databases (vnEdu, SMAS, or Google Classroom).
- **Adopted Assumption / Reversible Implementation:**
  - Self-contained email/password authentication with `bcryptjs` is deployed for standalone institutional demos.
  - Classroom codes (6-alphanumeric uppercase, e.g., `IEL789`) enable instant student onboarding without requiring complex directory synchronization.
  - Database schema isolates `User` and `ClassroomMember` tables cleanly, allowing OAuth / SAML 2.0 adapters to be dropped in without schema refactoring.

### 4. Daily Vocab New Card Quotas
- **Pending Decision:** Whether teachers can mandate a unified daily vocabulary quota for all students in a class.
- **Adopted Assumption / Reversible Implementation:**
  - Default daily limit is set to 10 new cards per day.
  - Students can personalize this limit (5, 10, 20, Custom, Unlimited) in their settings.
  - If a teacher assigns an assignment containing specific vocabulary, those words are prioritized in the review queue regardless of daily limits.

### 5. Content Calibration Threshold (Elo Inflation Prevention)
- **Pending Decision:** Exact number of peer student attempts required before an exercise is deemed "Calibrated" (Elo-bearing).
- **Adopted Assumption / Reversible Implementation:**
  - Any exercise created by DOCX import or newly added to the curriculum requires at least 30 independent student completions before its difficulty weight impacts the student's permanent CEFR proficiency rating.
  - While uncalibrated, students receive feedback, answer keys, and completion progress, but their calibrated Elo score remains protected from fluctuation.
