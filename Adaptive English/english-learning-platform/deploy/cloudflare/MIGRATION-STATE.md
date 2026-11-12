# Migration state

Updated 2026-11-10 after Google activation. Website/data migration is live. Google is enabled; real account consent and final application login are awaiting verification. The full user goal is not complete.

## Live application

- Public site: https://adaptive-english.adaptive-learning-c3.workers.dev
- Main Worker current version: `7b84648b-b99a-4632-8011-71363795a21a`.
- App instance: `english-google-20261110-v1`.
- Image: `registry.cloudflare.com/dd2f7a1c403332569d3a1058ab9dd3d2/adaptive-english-englishapp-base@sha256:5d56ebc0c6bf476c1f595a0d5378cc16bcd4eeb48561638fddc8a6a6786a1314`.
- Live health returns200 with `provider:cloudflare-d1`. Main Worker no longer has DATABASE_URL, BLOB_READ_WRITE_TOKEN or temporary MIGRATION_CONTROL_TOKEN. runtimeEnvironment also excludes legacy database/blob bindings whenever Cloudflare persistence is configured.
- Live D1: adaptive-english-live, ID0b5b7a60-35ed-4c1a-ba6c-9b2355c1e510. Private data/media Worker adaptive-english-data remains versiona714590d-728c-4475-ba34-db77af4fe660.
- Recording storage: private SQLite-backed Durable Objects, bounded256KiB chunks,20MiB upload maximum, atomic non-overwrite and byte ranges. R2 is not required.
- Old https://adaptiveenglish.vercel.app redirects307 to Cloudflare, preserving path/query. Redirect deploymentdpl_CdmmnMYLUj3ArfuAoCpHo7JPD61o in verified projectadaptivelearning/prj_QXiyKxQ88Bp8Rpcb0BY06V06iGki.

## Final reconciliation and source preservation

Old Cloudflare instances english-production-v1 and english-google-20261109-v1 were stopped through a temporary token-gated route. Maintenance was active during final reconciliation; it is now false. The temporary control route was removed and its secret deleted.

At2026-11-09T15:10:09Z, an atomic reversible BEFORE STATEMENT guard was installed on all30 English source Postgres public tables, blocking INSERT/UPDATE/DELETE/TRUNCATE. Native isolated Postgres16 tests first proved all four operations blocked, original rows preserved and guard removal restored writes. No source application row was changed by installing the guard. Source status rechecked:30/30 guards enabled. This protects against writes from old immutable deployments too.

The final repeatable-read export and current D1 export agree on every value and index across30tables/590rows; FK/integrity PASS. Verified row-delta rehearsal requires0mutations. Blob final inventory0objects/0bytes. Private snapshots: .artifacts/d1-final-source-20261109/ and .artifacts/d1-final-candidate-20261109/. Keep private; never commit/export credentials, passwords, sessions, personal data or signed export URLs.

Old Neon is preserved READ ONLY. Existing D1 production/local archives and separate local SQLite remain preserved. Do not reset, seed, merge or delete them. Original Render inventory contains no English service; Math/unrelated services were not changed.

## Validation

Final production-mode image adaptive-english:d1-final-candidate-20261109 passed34HTTP workflow checks in isolated real QA D1/DO. Health explicitly reportsCloudflareD1; QA has no Neon/Blob credentials.39focused data/media/auth tests rerunPASS. Earlier real2MiB attachment and20MiB recording boundary SHA checks remain valid evidence from the preceding candidate. Public live health, unauthenticated access rejection, protected-page redirect, old-origin path/query redirect and control-route404 passed. Live relational reads confirm14users/17assignments/14submissions/3attachments. No real-user password or account was altered for testing. Successful authenticated workflows were tested against QA, not real production user accounts. AI and real Google consent were not tested.

Raw logs are under.artifacts/d1-runtime-lab/. One local verification script initially decoded PowerShell's UTF16redirect asUTF8; corrected the diagnostic decoder and verified obsolete secrets absent. This was a reporting-script failure, not a live application failure.

## Recovery

Do not blindly roll back to Neon or unfreeze it: new writes now belong to D1. Recovery requires maintenance, stop/drain current writers, consistent D1 snapshot, reconcile all post-cutover changes into the chosen recovery target, verify every value/FK/index, then switch. Source guard scripts are scripts/cloudflare-source-guard.cjs --status/--unfreeze; unfreeze is only one part of an approved data-consistent recovery. Old archives are historical snapshots and do not follow live writes.

## Google remaining work

Google auth code is deployed but /api/auth/google/status reportsenabled:false. gcloud is authenticated; current visible projects are Adaptive Math and Brandify. No matching English Web OAuth client JSON found in Downloads. Do not silently reuse unrelated app credentials. Earlier async question requested only a local credential-file path; no answer yet. Callback: https://adaptive-english.adaptive-learning-c3.workers.dev/api/auth/google/callback . Use scripts/configure-google-auth.cjs for a matching Web JSON, upload secrets securely, use a fresh APP_INSTANCE_KEY, verify provider status and real consent/login/linking. No full-completion claim until this is done.


### 2026-11-10 OAuth provisioning progress

Created dedicated project adaptive-english-auth-20261110 (Adaptive English), project number147216151895; describe verified ACTIVE. Existing Math/Brandify projects unchanged. The standard English OAuth Web client remains absent; Google documents IAM oauth-clients as workforce federation only. See GOOGLE-AUTH.md for direct project Console links and callback. Journal EN-20261110-01 records commands and limits.


### 2026-11-10 Google server activation

Google credentials validated and streamed from the protected user file directly to Wrangler, no credential copy/value output. Source ACL unchanged and source cache ignored by Git. Current status enabled:true; fresh instance/version listed above.15 isolated tests and live desktop/mobile/callback checks PASS, including actual D1 cancellation and state replay rejection. Existing D1/media image reused. Real user consent/code exchange/final session remains unverified; user asked to perform one login. Google basic identity scope exemption means no test-user allowlist entry is required; user allowed skipping it, so no tester or audience changes were made. See EN-20261110-02 and GOOGLE-AUTH.md.
