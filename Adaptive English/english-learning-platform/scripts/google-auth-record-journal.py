import hashlib
import json
from pathlib import Path
import shutil

app = Path(__file__).resolve().parents[1]
root = app.parent
journal_root = root / 'docs/research-journal'
destination = journal_root / 'evidence/EN-20261109-02'
destination.mkdir(parents=True, exist_ok=True)
artifacts = app / '.artifacts/google-auth-tests'
names = ['tests-final.log', 'browser-checks.json', 'production-checks.json', 'production-migration.json', 'google-login-desktop.png', 'google-login-mobile.png', 'source-manifest.json']
for name in names:
    shutil.copyfile(artifacts / name, destination / name)
verification = """# EN-20261109-02: Google authentication integration

Observed 2026-11-09, Asia/Saigon. User requested Google authentication on the migrated English website.

Implemented and deployed in Cloudflare version 610252a1-9fc8-4d7e-acc2-4112a0e6185f. Google authentication is NOT ACTIVE: no site-specific Google OAuth Web client credentials have been provided. Production /api/auth/google/status returns enabled=false, connected=false; the button is hidden while unconfigured. Password login remains available. Real Google consent, token exchange, and successful Google login have not been observed.

Implementation: official google-auth-library authorization-code flow, PKCE S256, independent random nonce/state, HttpOnly/SameSite=Lax state cookie, configured canonical callback origin, ten-minute state expiry, atomic one-use state consumption, verified ID token audience/signature/expiry/issuer through Google's library and explicit verified email/nonce checks. No access or refresh tokens persisted. Provider subject identifies the account. Existing email never automatically links; explicit linking requires password-session authentication, same email, same original user at callback, and same-origin POST. Existing account role is retained; public new signup allows student/teacher only. New student Google signup creates six skill profiles transactionally. Login and registration UI add the Google button when configured; student/teacher Settings provide explicit linking. Cloudflare forwards only the two necessary new runtime secrets and rate-limits kickoff.

Production migration was additive only: GoogleAccount and GoogleOAuthState plus expiry index. Counts before and after remained users=14, submissions=14, assignments=17. No source account password, role, submission, or assignment was modified. All account-creation/linking tests used a fresh isolated SQLite database. No Google provider account or real production user was created during tests. An unrelated application's Google credentials were found but not repurposed.

Actual validation: node --test tests/google-auth.test.cjs tests/auth-cookie.test.cjs PASS exit0, 15 tests. Docker production build PASS exit0, including TypeScript/lint, using the saved live release plus a narrow Google-auth overlay. Local production container browser checks PASS exit0 on desktop/mobile, with provider readiness MOCKED only in the browser to display the unconfigured UI: valid forms, registration teacher selection, existing password form, no nested forms, no horizontal overflow, no browser runtime errors. Screenshots were inspected. Local status/unavailable kickoff/forged callback behave as expected. Production HTTP: health200 database connected, Google status200 disabled, kickoff303 to unavailable, forged callback303 to state error. No end-to-end claim beyond these observations.

Initial isolated test run FAILED 5/15 because the test's fake ES-module default export wrapped Prisma incorrectly; corrected the test loader and reran 15/15 PASS. Earlier failure log remains in ignored .artifacts/google-auth-tests/tests.log. An initial UI insertion anchor did not match teacher Settings; corrected the anchor before building and verified the staged deployment files match the canonical new auth files. Existing OTP changes in the working copy were not silently released; the overlay preserves live password registration behavior.

Activation requires a Google OAuth Web client with exact redirect URI https://adaptive-english.adaptive-learning-c3.workers.dev/api/auth/google/callback. Requested only a local credential-file path, never a secret pasted into chat. Activation helper validates Web-client JSON and writes a private ignored secret file; secrets then upload through Wrangler and a fresh app-instance key loads them into a new container. Setup instructions: english-learning-platform/deploy/cloudflare/GOOGLE-AUTH.md.

Journal Markdown/Word export integrity is checked separately. Full Word pagination is not visually reviewed. Live PostgreSQL remains Neon and private audio remains Vercel Blob, as documented in the prior migration entry.
"""
(destination / 'verification.md').write_text(verification, encoding='utf-8')
names.insert(0, 'verification.md')
evidence_path = journal_root / 'evidence.json'
evidence = json.loads(evidence_path.read_text(encoding='utf-8'))
number = max(int(item['id'][2:]) for item in evidence['items']) + 1
identifiers = []
for name in names:
    file = destination / name
    relative = file.relative_to(root).as_posix()
    assert not any(item['path'] == relative for item in evidence['items']), 'Evidence already registered'
    identifier = f'MB{number}'
    identifiers.append(identifier)
    number += 1
    evidence['items'].insert(0, {'id': identifier, 'path': relative, 'scope': 'Google authentication code, isolated tests, additive migration, and disabled production state. Browser readiness mocked; real Google login not verified. See verification.md.', 'inspected_on': '2026-11-09', 'event_date': '2026-11-09', 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})
evidence_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
journal_path = journal_root / 'journal.json'
journal = json.loads(journal_path.read_text(encoding='utf-8'))
assert not any(entry['id'] == 'EN-20261109-02' for entry in journal['entries'])
journal['entries'].insert(0, {
    'id': 'EN-20261109-02', 'kind': 'observed', 'title': 'Google authentication implementation and deployment; activation awaiting Web OAuth client', 'date': '09/11/2026',
    'stage': 'Authentication and Cloudflare deployment', 'status': 'Code deployed and isolated checks PASS; Google sign-in inactive pending site credentials',
    'participants': 'User requested Google authentication; Codex implemented, tested, migrated additive tables and deployed. Location and other participants not confirmed.',
    'objective': 'Add Google authentication without changing existing credentials, roles, progress or the live registration behavior.',
    'equipment': 'Official Google OpenID Connect documentation, Next.js 14.2.35, google-auth-library10, Prisma5.21.1, isolated SQLite, Neon, Docker Node24, Wrangler4.158.0, Puppeteer Chrome desktop/mobile, Python/lxml.',
    'procedure': 'Inspect auth and credential metadata; implement code/PKCE/state/nonce/token verification; add provider account and ephemeral flow tables; add conditional login/signup buttons and explicit linking in Settings; run isolated security tests; build live-release overlay; apply additive migration; deploy; check local browser and production status.',
    'results': 'Cloudflare version610252a1-9fc8-4d7e-acc2-4112a0e6185f deployed. Auth/cookie tests15/15 PASS exit0 after correcting initial test-loader failure. Production build PASS exit0. Additive migration preserves counts14users/14submissions/17assignments. Mocked-readiness desktop/mobile UI checks PASS; screenshots inspected. Production health200 and Google status200 enabled=false; unavailable start and forged callback reject safely. Google OAuth client not configured; no real Google login or production account creation/linking tested. Existing credentials from another application not reused.',
    'lessons': 'Provider credentials are application-specific. Verify stable subject and nonce, consume state atomically, and require explicit same-session linking rather than accepting matching email alone. Distinguish mocked UI/security tests from real Google acceptance. Preserve the saved release rather than including unrelated local OTP changes.',
    'next': 'Receive local path to a site-specific Google OAuth Web client, authorize the documented callback, upload runtime secrets, restart via a fresh instance key, and verify real consent/login/linking. Word pagination remains not visually verified.',
    'evidence': identifiers
})
journal_path.write_text(json.dumps(journal, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (root / 'docs/WORKLOG.md').open('a', encoding='utf-8') as file:
    file.write('\n\n## 2026-11-09 — Google auth integration (EN-20261109-02)\n\n'
               '- Deployed Google-auth code in Cloudflare version610252a1-9fc8-4d7e-acc2-4112a0e6185f. Google remains inactive: site Web OAuth client not configured. Password login remains available.\n'
               '- 15 isolated auth/cookie tests PASS; Docker build PASS; mocked-readiness desktop/mobile browser checks PASS. Production health200, Google status200 disabled, missing configuration and forged callbacks rejected. Real Google login not tested.\n'
               '- Additive tables only; existing counts14users/14submissions/17assignments unchanged. No production account creation/linking or password/role changes. Setup: ../english-learning-platform/deploy/cloudflare/GOOGLE-AUTH.md.\n'
               '- Entry EN-20261109-02; sanitized evidence in research-journal/evidence/EN-20261109-02/. Full Word pagination not visually verified.\n')
print(json.dumps({'entry':'EN-20261109-02','evidence':identifiers}))
