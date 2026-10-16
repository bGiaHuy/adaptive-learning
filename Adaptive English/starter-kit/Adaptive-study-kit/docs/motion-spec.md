# Motion specifications

| Asset | Duration | Product usage |
|---|---|---|
| idle | 3s body / 4s blink | Occasional avatar; pause off-screen |
| hello | 1.2s | Onboarding, 1–2 cycles |
| thinking | 2.4s | During processing, with text status |
| explaining | 1.4s / 2.8s arm | Hint reveal, one cycle |
| encouraging | 2s | After mistake, once |
| celebrate | 1.2s | Session finish, once, skippable |
| listening | 2s | Voice activity; does not prove recording is active |
| goodbye | 2s | Session exit, once |

SVG preview files loop for inspection. For production change animation-iteration-count to 1 for one-shot states. Pause loops outside the viewport. Preserve readable textual statuses. Never block interaction until animation ends.

UI: pressed button 140ms; panel/feedback reveal 260ms; flashcard fade/translate 260ms. No whole-screen shake on incorrect answers. Progress is activity completion, not a CEFR gain.

Mastery, limits, CEFR and AI policies remain product rules; animations do not calculate them.
