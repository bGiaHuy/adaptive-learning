# Notification popover and account progress audit

Date: 2026-10-11 (Asia/Saigon)

## Scope

- Replace the notification bell's direct navigation with a compact preview window and a clear `Xem tất cả thông báo` route.
- Inspect which learning data is stored by account on the server and which data exists only in the current browser.
- Preserve existing learner data; no database reset, seeding, deletion, or submission was performed.

## Product changes

- `src/components/ui/Header.tsx`
  - Added an accessible notification dialog anchored to the bell.
  - Shows up to three recent items, unread state, time, an empty state, and a link to `/student/notifications`.
  - Closes on outside click, `Escape`, or navigation.
  - Uses a viewport-safe mobile position and a bell-anchored desktop position.
- `src/lib/store.tsx`
  - Reading one notification or all notifications now also calls `POST /api/notifications`.
  - The UI updates immediately; a failed request reloads the server state.

## Persistence findings

| Data | Current storage | Account-scoped | Cross-browser/device |
| --- | --- | --- | --- |
| Classroom assignment drafts and submissions | Prisma `Submission` through `/api/submissions` | Yes | Yes, when the save request succeeds |
| Vocabulary progress | Prisma `UserVocab` through `/api/vocab` | Yes | Yes |
| Notifications | Prisma `Notification` through `/api/notifications` | Yes | Yes |
| Completed placement result | Prisma `StudentSkillProfile` | Yes | Yes |
| Incomplete placement answers | `localStorage` key containing the user id | Yes on the same browser | No |
| Free-learning lesson draft and answers | `localStorage` key `adaptive_study_lesson_<lessonId>` | No | No |
| Reading/writing workspace drafts | `localStorage` keys by content id | No | No |
| Resume pointer and latest session result | Global `localStorage` keys | No | No; latest session overwrites the previous value |

The reported loss is reproducible from the implementation design: free-learning lesson progress, workspace drafts, resume state, and the latest session summary are browser-local. They can disappear after browser storage is cleared, when the origin/port changes, or when the learner uses another browser/device. The non-user-scoped keys can also be overwritten when two accounts use the same browser profile.

The placement endpoint returns `Tiến trình lưu nháp thành công` when `completed` is false but does not write the partial answers to Prisma. Only completion writes the skill profile.

## Verification actually run

- `npx tsc --noEmit` in `english-learning-platform`: PASS, exit code 0.
- `npm run typecheck`: FAIL, exit code 1 because the project has no `typecheck` script; TypeScript was then run directly as above.
- `npm run lint`: BLOCKED, exit code 1 because Next.js opened the first-run interactive ESLint configuration prompt; no ESLint configuration was selected or written.
- Browser, desktop viewport 983 px: notification dialog visible; width 352 px; `Xem tất cả thông báo` href is `/student/notifications`; PASS.
- Browser, mobile viewport 390 x 844: initial implementation overflowed left (`left = -97`) and was fixed; final dialog bounds were `left = 16`, `right = 359`, width 343; PASS.
- Browser keyboard behavior: `Escape` closed the dialog; PASS.
- Browser console errors after final verification: none observed.
- Notification read persistence was verified by code path and TypeScript only because the active account had no notification rows to mark. No test notification was inserted.
- The first journal export attempt with `python` failed because that command was not on PATH. The bundled Python with `lxml` then exported 40 entries/108 evidence items and `--check` passed, both exit code 0. Historical source-change warnings remained for MB07, MB08, MB10, MB11, MB12, MB13, MB19, MB23, MB25, MB31, MB32, and MB61. Word visual pagination remains `NOT_VERIFIED`.

## Remaining work

Free-learning progress needs a server-side lesson-attempt/draft model and authenticated APIs before it can reliably follow the learner account across sessions and devices. Existing browser drafts should be migrated carefully after that model exists.
