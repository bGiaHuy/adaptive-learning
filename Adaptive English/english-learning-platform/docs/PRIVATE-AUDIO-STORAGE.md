# Private audio storage — Adaptive English

Selected provider: Vercel Blob private, Singapore (`sin1`). Store `adaptive-english-private` is connected to the existing English Vercel project. Credentials stay in server environment variables; never expose them through NEXT_PUBLIC or return them to a browser.

Deployment status — 14/10/2026 (Asia/Saigon): released to https://adaptiveenglish.vercel.app as dpl_8WWUofaVEU1wjjHJzskcMqHGPB8Q. Anonymous HTTP smoke passed8checks; authenticated real-device/client-upload E2E remains pending. The existing registration route/page were preserved from the prior production release because the new email OTP provider is not configured.

## Flow

1. The student records audio and listens locally.
2. `/api/audio/upload` validates the user, membership, Speaking assignment, open collection status and existing submission, then prepares a unique pathname.
3. `/api/audio/upload-token` repeats authorization and issues a pathname-scoped upload token: 20 MB, 10 minutes, permitted audio MIME types, no overwrites. The browser sends bytes directly to private Blob; large files use multipart. The read-write credential stays on the server.
4. The client keeps `/api/audio/play?pathname=...` as the reference. Saving a draft/final submission verifies owner, assignment and Blob metadata before writing it into the existing Submission.audioUrl field. No schema migration is required. Omitting audio while editing text preserves the previous reference.
5. Playback checks the signed-in user: owner/admin, or the teacher who owns the class and whose submission contains that exact audio reference. Private bytes are streamed with no-store and range support for seeking. Anonymous access is denied. Other students cannot listen to one another's recordings.
6. Speaking submissions can contain audio without text and await teacher grading. Uploading does not grade or automatically submit.

The existing teacher document attachments remain in their existing private database storage; this change does not migrate or remove them. Historical files under public/uploads/audio are untouched. New uploads use private Blob. Old local/blob URLs are not silently converted into persistent files.

## Environment

- BLOB_READ_WRITE_TOKEN: generated when the private store is connected to the Vercel project (server only).
- Alternatively BLOB_STORE_ID plus Vercel OIDC credentials are recognized by the SDK.
- A local checkout needs separately supplied server credentials to use the actual cloud store; without credentials, upload reports 503. No real token is saved in the example file.
- Use an isolated store for tests that upload real-sized fixtures. Preview and production are currently linked to the same private store; no learner data was uploaded during this session.

## Limits and remaining validation

20 MB per recording. Small multipart POST compatibility accepts at most3MB to stay under Vercel request limits; the browser flow uses direct uploads. No paid plan upgrade was requested or performed. Storage and transfer usage follow the account's plan; this is not an assertion of unlimited free storage.

No automatic deletion or retention job is enabled. Abandoned uploads/retakes can remain in the store; decide a retention policy with the project owner before deleting learner records. The smoke test deletes only its own newly created synthetic WAV.

Placement audio persistence and the generic practice workspace remain separate follow-up work. The classroom Speaking flow now saves persistent references, but authenticated deployed E2E, real microphones and iOS/Safari still require testing. Real speech analysis is a separate provider capability and is not implemented by file storage.

## Validation for this session

See EN-20261014-03 in the research journal and its evidence folder. Unit/API fixtures use mocked Prisma/Blob. Chromium uses a synthetic microphone. A separate live storage smoke test uploads a silent WAV, checks private access/readback/range and deletes only that temporary file. No production database was changed or reset.

Sources: https://vercel.com/docs/vercel-blob/private-storage and the installed @vercel/blob 2.8.2 API types/source.

