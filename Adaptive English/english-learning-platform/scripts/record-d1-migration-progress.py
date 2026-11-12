import hashlib
import json
from pathlib import Path
import shutil

app=Path(__file__).resolve().parents[1]
root=app.parent
directory=root/'docs/research-journal/evidence/EN-20261109-03'
directory.mkdir(parents=True,exist_ok=True)
sources={
 'unit-tests.log':app/'.artifacts/d1-runtime-lab/all-tests-paged-final.log',
 'initial-unit-failure.log':app/'.artifacts/d1-runtime-lab/transaction-tests.log',
 'end-to-end.json':app/'.artifacts/d1-runtime-lab/e2e-results.json',
 'initial-end-to-end-failure.json':app/'.artifacts/d1-runtime-lab/e2e-first-run-failure.json',
 'file-boundaries.json':app/'.artifacts/d1-runtime-lab/file-boundaries-results.json',
 'runtime-providers.json':app/'.artifacts/d1-runtime-lab/runtime-provider-check.json',
 'data-roundtrip.json':app/'.artifacts/d1-live-candidate-20261109/remote-roundtrip-validation.json',
 'remote-relational-read.json':app/'.artifacts/d1-runtime-lab/remote-read-check.json',
}
for name,source in sources.items():shutil.copyfile(source,directory/name)
verification='''# EN-20261109-03 Cloudflare database and recording migration candidate

Observed 2026-11-09, Asia/Saigon. User explicitly continued the full migration goal. The live website is NOT switched yet: its prior release still uses Neon/Vercel Blob. No completion claim is made for the full migration.

A fresh read-only repeatable-read source export was converted to the canonical SQLite schema, including unique indexes and FK constraints, and imported into separate D1 adaptive-english-live. Restoring D1's export verifies all values and indexes across 30 source tables and 590 rows; FK/integrity checks pass. Relational reads through the private data transport pass for14users,17assignments,14submissions,3attachments. Raw exports, account data, session hashes and transport tokens remain private under ignored .artifacts/ directories.

The runtime uses existing Prisma5.21 SQLite transactions in disposable local planner databases. Typed change triggers preserve bytes, NUL-containing text, timestamps and persisted REAL values. Only a globally revision-checked atomic D1 batch makes a mutation durable. Conflicts re-read; commit IDs and a durable ledger prevent duplicate application after a lost response. Unreviewed schema changes/triggers reject. Large snapshots use pages plus final revision/schema validation, with a verified private cache. An initial Prisma6 adapter installation experiment failed in an isolated Windows lab and was not shipped; application dependencies stay on Prisma5.21.

Private recordings use SQLite-backed Cloudflare Durable Objects in bounded chunks. The existing app authorization and pathname scope remain in force. Uploads are atomic and non-overwriting, full/ranged playback remains private/no-store, and maximum file/MIME validation is preserved. No R2 activation or external Blob credentials are needed in the QA app.

Actual tests: node --test tests/cloudflare-data-store.test.cjs tests/cloudflare-media.test.cjs tests/audio-storage.test.cjs tests/google-auth.test.cjs tests/auth-cookie.test.cjs PASS exit0,39tests. Docker candidate build PASS exit0. Production-mode QA app with a real isolated Cloudflare D1/DO backend passed34HTTPchecks, including signup/session, class/join, assignment/version, exact attachment bytes, recording storage and ranges, ownership rejections, draft/final submission, private pending grades, publication/collection, concurrent daily vocabulary and review. Runtime inspection proves no DATABASE_URL and no BLOB_READ_WRITE_TOKEN in the QA container. No source production accounts were created or changed. Actual2MiB attachment and20MiB recording boundary uploads/downloads matched hashes; suffix range206 and unauthenticated media404. Real Google consent/login was not tested; provider credentials remain absent. AI was deliberately unconfigured in QA.

Failures retained: initial import used Cloudflare-reserved _cf_ metadata names and returned SQLITE_AUTH; metadata was renamed _ae_ and import succeeded. Initial float test exposed the existing native Prisma5 SQLite numeric-parameter rounding, so exact persistence is verified starting from an exact stored value rather than claiming to fix Prisma's encoder; originalFAILlog retained. Initial E2E harness used PATCH for a route that correctly supports PUT; fixed the harness and kept the405failure. One immediate container health probe raced startup; the same running container was rechecked and returned200. No failure was silently changed into a historicalPASS.

Current data Worker version a714590d-728c-4475-ba34-db77af4fe660; QA data Worker e27d7764-4690-491b-9217-e58f76f2be03. Latest final-candidate image builds but requires its final app-level repeat; prior data/media image passed the complete QA flow. See english-learning-platform/deploy/cloudflare/MIGRATION-STATE.md for precise continuation actions.

Remaining: final candidate acceptance, old-origin redirect and writer freeze, final source delta and Blob reconciliation, live data/media configuration switch, removal of external runtime credentials, public/authenticated checks, and real Google activation once its Web client is available. Original databases/services remain preserved. Journal exports and rendering are recorded separately; this entry does not assert visual pagination acceptance.
'''
(directory/'verification.md').write_text(verification,encoding='utf-8')
names=['verification.md',*sources]
evidence_path=root/'docs/research-journal/evidence.json'
evidence=json.loads(evidence_path.read_text(encoding='utf-8'))
number=max(int(item['id'][2:])for item in evidence['items'])+1
ids=[]
for name in names:
 file=directory/name;relative=file.relative_to(root).as_posix()
 assert not any(item['path']==relative for item in evidence['items']),'Evidence already registered'
 identifier=f'MB{number}';number+=1;ids.append(identifier)
 evidence['items'].insert(0,{'id':identifier,'path':relative,'scope':'Observed D1/DO candidate verification and isolated QA, with original FAIL evidence. Live cutover remains pending; real Google login not verified.','inspected_on':'2026-11-09','event_date':'2026-11-09','sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
evidence_path.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
journal_path=root/'docs/research-journal/journal.json'
journal=json.loads(journal_path.read_text(encoding='utf-8'))
assert not any(entry['id']=='EN-20261109-03' for entry in journal['entries'])
journal['entries'].insert(0,{'id':'EN-20261109-03','kind':'observed','title':'Cloudflare D1 and private recording migration candidate with transactional and end-to-end QA','date':'09/11/2026','stage':'Data migration and acceptance preparation','status':'Candidate data/media verified; live cutover and Google activation still pending','participants':'User continued the full migration goal. Codex implemented and tested. Other participants/location not confirmed.','objective':'Move live application persistence to Cloudflare while preserving all data, transaction rollback, concurrency, file limits and authorization.','equipment':'Prisma5.21.1, Next14.2.35, Node24, native SQLite, Cloudflare D1/SQLite-backed Durable Objects, Wrangler4.158, Docker29.9.2, Neon read-only export, Python/lxml.','procedure':'Recheck actual sources; export consistently; convert canonical schema and validate values/indexes/FKs; implement revision-guarded D1 transaction planning and paged snapshots; replace private recording transport; build isolated app and mutate only QA data; verify real cloud persistence, file boundaries and ownership.','results':'D1 copy30tables/590rows matches all values/indexes with integrity/FK PASS.39focused tests PASS exit0; full isolated QA34HTTPchecks PASS; exact2MiB attachment and20MiB recording round trips PASS. QA runtime contains no Neon or Blob credentials. Candidate images build. InitialFAILs retained and explained. Live website still uses prior Neon/Blob configuration; final sync/cutover is not done. Google Web client missing; real Google login not verified.','lessons':'Do not use a D1 adapter that silently ignores interactive transactions. Verify durable commit acknowledgement, retry idempotency, exact typed values, real cloud file limits and concurrent behavior. Distinguish QA persistence from live cutover and preserve initial failures.','next':'Follow MIGRATION-STATE.md: latest candidate acceptance, redirect old origin, freeze and stop old writers, final delta/Blob reconciliation, switch runtime to Cloudflare, remove external credentials and verify. Activate Google with site credentials. Render journal before making pagination claims.','evidence':ids})
journal_path.write_text(json.dumps(journal,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with(root/'docs/WORKLOG.md').open('a',encoding='utf-8')as file:file.write('\n\n## 2026-11-09 — D1 and private recording candidate (EN-20261109-03)\n\n- Candidate D1 copy30tables/590rows verified against all values/indexes; FK/integrity PASS. Source data was not reset, merged or deleted.\n-39focused tests and34isolated QA HTTPchecks PASS; real2MiB attachment/20MiB recording round trips verified by hashes. QA app has no Neon/Blob credentials. InitialFAILlogs preserved.\n- Live site remains on prior Neon/Blob configuration. Final writer freeze, delta reconciliation, cutover and real Google activation remain unfinished. Handoff: ../english-learning-platform/deploy/cloudflare/MIGRATION-STATE.md.\n- Journal EN-20261109-03; sanitized evidence: research-journal/evidence/EN-20261109-03/. Rendering status recorded separately.\n')
print(json.dumps({'entry':'EN-20261109-03','evidence':ids,'status':'partial-live-cutover-pending'}))
