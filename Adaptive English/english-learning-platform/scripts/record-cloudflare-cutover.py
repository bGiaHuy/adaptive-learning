import hashlib
import json
from pathlib import Path
import shutil

app=Path(__file__).resolve().parents[1];root=app.parent
identifier='EN-20261109-04';directory=root/'docs/research-journal/evidence'/identifier
directory.mkdir(parents=True,exist_ok=False)
sources={
 'unit-tests.log':app/'.artifacts/d1-runtime-lab/all-tests-continuation.log',
 'final-image-end-to-end.json':app/'.artifacts/d1-runtime-lab/e2e-results.json',
 'source-guard-isolated-test.log':app/'.artifacts/d1-runtime-lab/source-guard-isolated-test.log',
 'final-source-d1-comparison.json':app/'.artifacts/d1-final-candidate-20261109/remote-roundtrip-validation.json',
 'row-delta-rehearsal.json':app/'.artifacts/d1-final-candidate-20261109/delta-validation.json',
 'live-http-checks.json':app/'.artifacts/d1-runtime-lab/live-cutover-http-checks.json',
 'live-provider-verification.json':app/'.artifacts/d1-runtime-lab/live-provider-verification.json',
 'live-relational-read.json':app/'.artifacts/d1-runtime-lab/remote-read-check.json',
 'cutover-state.md':app/'deploy/cloudflare/MIGRATION-STATE.md',
}
for name,source in sources.items():shutil.copyfile(source,directory/name)
evidence_path=root/'docs/research-journal/evidence.json'
evidence=json.loads(evidence_path.read_text(encoding='utf-8'))
number=max(int(item['id'][2:])for item in evidence['items'])+1;ids=[]
for name in sources:
 file=directory/name;relative=file.relative_to(root).as_posix();code=f'MB{number}';number+=1;ids.append(code)
 evidence['items'].insert(0,{'id':code,'path':relative,'scope':'Observed live Cloudflare D1/private recording cutover, final reconciliation and scoped verification. Real Google activation remains pending.','inspected_on':'2026-11-09','event_date':'2026-11-09','sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
evidence_path.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
journal_path=root/'docs/research-journal/journal.json';journal=json.loads(journal_path.read_text(encoding='utf-8'))
assert not any(entry['id']==identifier for entry in journal['entries'])
journal['entries'].insert(0,{'id':identifier,'kind':'observed','title':'Live Cloudflare database and private recording cutover with preserved source','date':'09/11/2026','stage':'Production migration','status':'Website and persistence cutover complete; Google OAuth activation pending','participants':'User authorized migration and continuation. Codex implemented, deployed and verified. Other participants and location not confirmed.','objective':'Finish the data and recording migration, prevent stale-origin writes, preserve source records, redirect the old entry point and verify the actual live provider.','equipment':'Cloudflare Workers/Containers/D1/SQLite Durable Objects, Wrangler4.158, Docker29.9.2, native Prisma5.21.1/Next14.2.35, PostgreSQL16 isolated guard test, Neon consistent export, VercelCLI63.1.2, Python/lxml.','procedure':'Run the final image against isolated real-cloud QA; test a reversible source statement guard; preview-test and promote a307Vercel redirect; deploy maintenance, stop both known old Cloudflare instances, freeze30source tables atomically, export source and current D1, rehearse the exact row delta and compare all values/indexes/FKs; switch the named app to Cloudflare persistence, resume requests, remove obsolete external credentials and temporary control; verify live health, access rejection, redirects, secret names and relational reads.','results':'39focused tests and34final-image isolated QA HTTP checks PASS exit0. Isolated Postgres guard blocks INSERT/UPDATE/DELETE/TRUNCATE and reverses without row loss. Frozen final source matches D1 across30tables/590rows, indexes and every value;0FKviolations, integrityok,0delta mutations, final Blob inventory0objects. Source guard30/30enabled; source rows not reset/seeded/deleted. Live health200providercloudflare-d1. Original URL307preserves path/query; protected page307, unauthenticated API401, removed control404. Live relational counts14users/17assignments/14submissions/3attachments. Main Worker has noDATABASE_URL/BLOB_READ_WRITE_TOKEN/control token. Versionb62f907a-8c54-474d-9b96-1956efdd8c13. Old Neon/local DB/archives preserved. Real production passwords/accounts were not used for mutation tests. AI/realGoogle consent not verified; Google statusdisabled. gcloud authenticated but visible projects areMath/Brandify; matchingEnglishWeb client missing. A local JSON diagnostic initially failed decoding PowerShellUTF16asUTF8; decoder corrected and secret-name absence verified.','lessons':'A hosting move must include the actual writable provider and stale immutable deployment writers. Use a reversible source barrier and final consistent comparison before switching. Never roll back blindly to a frozen historical source after new D1 writes. Distinguish isolated authenticated QA from live public/read-only checks. Preserve initial diagnostic failures.','next':'Activate Google with this site Web OAuth client and exact callback, deploy secrets with a fresh app instance and verify real consent/login/linking. Maintain Cloudflare backups. Journal rendering is tracked separately; this entry does not claim full typography acceptance.','evidence':ids})
journal_path.write_text(json.dumps(journal,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with(root/'docs/WORKLOG.md').open('a',encoding='utf-8')as file:file.write('\n\n## 2026-11-09 — Live Cloudflare persistence cutover (EN-20261109-04)\n\n- Live app now uses D1 and private Cloudflare Durable Object recordings. Old Vercel URL redirects307 with path/query. Main Worker has no Neon/Blob credentials. Source Neon remains preserved and guarded read only; no source row reset/seed/delete.\n- Final frozen-source/D1 comparison:30tables/590rows, every value/index match, FK/integrityPASS,0delta,0Blob objects.39focused tests and34isolated QA HTTP checksPASS; live healthprovidercloudflare-d1 and public/read-only checksPASS.\n- Full goal remains partial only for Google OAuth activation: matchingEnglishWeb client not available; real consent/login not tested. Recovery must reconcile post-cutoverD1writes before any source unfreeze.\n- EntryEN-20261109-04; evidence:research-journal/evidence/EN-20261109-04/. See english-learning-platform/deploy/cloudflare/MIGRATION-STATE.md. Rendering tracked separately.\n')
print(json.dumps({'entry':identifier,'evidence':ids,'migration':'live','google':'pending'}))
