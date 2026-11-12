# Adaptive English on Cloudflare

Live site: https://adaptive-english.adaptive-learning-c3.workers.dev

The application, writable database and private recording storage now run on Cloudflare. The original Vercel URL redirects to this site. Google sign-in is enabled with this site's server-side OAuth secrets; password sign-in remains available. Real account consent and final application login are still awaiting verification.

## Runtime

Next.js14.2.35/Prisma5.21.1 run in Cloudflare Containers behind the adaptive-english Worker. The source is the saved live release with reviewed Google and data/media overlays; unrelated unconfigured OTP changes were not released. D1 adaptive-english-live is authoritative. Native SQLite transaction planning plus revision-guarded atomic D1 batches preserve rollback, nested writes, concurrency and idempotent commit retries. Private recordings use SQLite-backed Durable Objects and retain ownership checks,20MiB limits and ranged playback. The dictionary and learning assets are bundled in the image.

The main Worker has no Neon or Vercel Blob credentials. Existing AI configuration remains. Source Neon is preserved behind a reversible write guard. The separate local database and historical D1 archives are preserved and not merged with production. No English Render service was found; unrelated services were not changed.

## Build

From english-learning-platform, preserve the saved source .artifacts/vercel-release-20261014-04. Prepare the staged source with scripts/cloudflare-prepare.cjs, then apply scripts/cloudflare-google-overlay.cjs and scripts/cloudflare-data-overlay.cjs. Review staging before deployment. The Dockerfile generates the separate SQLite Prisma client and copies its native engine into the runtime. Runtime secrets must never enter the image or source exports. Run wrangler deploy --config deploy/cloudflare/wrangler.jsonc with Docker running. --containers-rollout none updates Worker code/config without rebuilding the already registered container image. Change APP_INSTANCE_KEY when a fresh runtime environment is required.

## Verification and recovery

Final frozen-source/D1 comparison verified every value/index across30tables/590rows, no FK violations, integrityok and zero outstanding row delta. Blob inventory was empty.39focused tests and34isolated real-cloud QA HTTP checks passed; previous2MiB attachment/20MiB recording boundary checks matched hashes. Live health reportsCloudflareD1; access controls, protected-page redirects, original-origin redirects and live relational counts pass. Successful authenticated workflows were tested on QA; real production users, AI calls and actual Google consent were not used for acceptance.

See [migration state](MIGRATION-STATE.md) for versions, private artifact locations, exact acceptance limits and recovery. Never switch back to the frozen source without reconciling new D1 writes. Never publish.artifacts/.env data. [Google setup](GOOGLE-AUTH.md) describes the outstanding OAuth activation. Research journal entryEN-20261109-04 records the cutover; prior entries remain historical evidence.
