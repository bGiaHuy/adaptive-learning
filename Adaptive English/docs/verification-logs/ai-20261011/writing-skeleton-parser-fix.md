# Writing AI skeleton and response normalization

Date: 2026-10-11 (Asia/Saigon)

## Scope

- Replace the plain loading sentence with a skeleton that preserves the known score-card geometry.
- Apply loading accessibility semantics to the actual region.
- Diagnose and fix the `Phản hồi chấm bài AI chưa đầy đủ hoặc không hợp lệ` response without accepting missing or unsafe scores.

## Changes

- `WritingEvaluation.tsx`
  - The evaluation region now exposes `aria-busy="true"` only while the request is active and returns to `false` when complete.
  - The skeleton is a named `role="status"` live region for assistive technology; decorative skeleton pieces are hidden with `aria-hidden="true"`.
  - Its score block, three rubric rows, overall feedback, strengths, and improvements preserve the final card's geometry.
- `WritingEvaluation.module.css`
  - Added shimmer animation and a `prefers-reduced-motion` fallback.
- `aiEngine.ts`
  - Accepts safe number/string score variants, common field aliases, and nested rubric fields.
  - When the provider returns `estimatedBand: "N/A"` but all three rubric scores are valid, derives the displayed total as their arithmetic mean.
  - Explicit numeric totals outside 0–9, missing rubric scores, and invalid feedback structures remain rejected.
  - Prompt now tells MWAPI to return a numeric total for short school tasks.

## Root cause observed

The real provider returned HTTP content with all expected fields and valid rubric scores, but returned `estimatedBand: "N/A"`. The old validator required a numeric string and converted the otherwise usable response into HTTP 502. A server-only diagnostic briefly recorded field names, value types, and score values; it did not record the learner text or feedback content. That diagnostic was removed after the cause was found.

## Verification actually run

- `npx tsc --noEmit`: PASS, exit code 0.
- First `node --test tests/mwapi.test.cjs` after adding derived totals: FAIL, exit code 1, 10/11 passed. The out-of-range-total test exposed that `11/9` incorrectly fell back to the rubric average.
- Fixed fallback so it applies only to missing/`N/A`, then reran `node --test tests/mwapi.test.cjs`: PASS, exit code 0, 11/11 passed.
- Browser loading state: skeleton visible; region `aria-busy="true"`; named status `AI đang chấm bài` visible.
- Browser completed state: `aria-busy="false"`; no alert; one `Điểm AI tham khảo` block; real result displayed as 9.0/9.
- Browser console after completion: no errors observed.
- No database reset, seed, deletion, deployment, or teacher grade change was performed. The learner explicitly requested grading diagnosis, so the existing answer was submitted again to the configured provider during verification.

## Limitations

- The successful response proves the observed `N/A` variant is handled. Other unknown provider schema changes may still be rejected intentionally.
- The score remains AI feedback for practice, not an official teacher grade.
- Word visual pagination was not inspected in this UI-focused change.
