# EN-20261012-03 — DOCX import repair

Environment: Windows PowerShell, Node 24.19.0, Next.js 14.2.35.
Directly executed on 2026-10-12 Asia/Saigon:
- npx tsc --noEmit: no diagnostics; subsequent build type validation PASS.
- node --test tests/mwapi.test.cjs: PASS 13/13, no failures.
- npm run build: PASS exit 0, 54/54 static pages. Google Fonts stylesheet optimization warning retained.
- New controlled in-memory DOCX test confirms embedded image data URL without writing public/uploads; invalid Word archive rejected.

Cause: route unconditionally returned 503 on Vercel; parser attempted writes into public/uploads. Repair removes storage dependency for parse and embeds raster image bytes in result. Upload limited to 4 MB; expanded ZIP limited to 24 MB/2000 entries. Automatic local-only sample load removed.
Production publish remains blocked: existing persistence implementation not repaired or enabled in this session. No DB writes, resets, seeds, real student submissions or uploaded private source documents used in tests. No authenticated production upload end-to-end verified.
