"""Record sanitized migration evidence; never copy private source data or credentials."""
import datetime
import hashlib
import json
from pathlib import Path
import shutil

app = Path(__file__).resolve().parents[1]
workspace = app.parent
journal_root = workspace / 'docs/research-journal'
destination = journal_root / 'evidence/EN-20261109-01'
destination.mkdir(parents=True, exist_ok=True)
private = app / '.artifacts/cloudflare-migration-20261109'
files = ['public-smoke.json', 'd1-roundtrip-validation.json', 'local-d1-roundtrip-validation.json', 'cloudflare-login-desktop.png', 'cloudflare-login-mobile.png']
for name in files:
    shutil.copyfile(private / name, destination / name)
summary = {
    'date': '2026-11-09',
    'site': 'https://adaptive-english.adaptive-learning-c3.workers.dev',
    'worker': 'adaptive-english',
    'version': 'b45dc8b2-2f42-4034-adcb-3e20213d486b',
    'sourceDeployment': 'dpl_8WWUofaVEU1wjjHJzskcMqHGPB8Q',
    'hosting': 'Cloudflare Workers and Containers',
    'liveDatabase': 'Existing Neon PostgreSQL; unchanged',
    'productionArchive': {'name': 'adaptive-english-archive', 'id': '6f9e478b-804a-42fd-b4e6-362c9f6c6b66', 'tables': 28, 'rows': 590, 'allValuesVerified': True},
    'developmentArchive': {'name': 'adaptive-english-local-archive', 'id': '5e35fe04-3a75-426f-bd9f-f6ec3d9100dc', 'tables': 25, 'rows': 817, 'byteForByteVerified': True},
    'blobObjectsFound': 0,
    'checks': {'dockerBuild': 'PASS exit 0', 'nativeCanvasAndPdfParser': 'PASS exit 0', 'productionD1RoundTrip': 'PASS exit 0', 'developmentD1RoundTrip': 'PASS exit 0', 'publicHttpAndDesktopMobileBrowser': 'PASS exit 0'},
    'limitations': ['Live DB cutover to D1 unfinished: Prisma interactive transactions require an atomic-batch port.', 'Blob remains Vercel Blob; R2 not enabled.', 'Successful authenticated workflows, uploads, AI generation, and production mutations not tested.', 'Journal Word pagination not visually verified.']
}
(destination / 'deployment-summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
verification = """# EN-20261109-01: Cloudflare hosting and data archives

Observed on 2026-11-09 (Asia/Saigon). User explicitly authorized migration and approved the Cloudflare OAuth permission expansion.

Hosting migrated: https://adaptive-english.adaptive-learning-c3.workers.dev. The live PostgreSQL database remains Neon and recording storage remains Vercel Blob. This is a hosting migration plus verified data archives, not a completed live database/storage cutover.

The production export used a read-only repeatable-read transaction. D1 round-trip comparison passed for every value across 28 tables and 590 rows, including attachment bytes. SQLite foreign-key and integrity checks passed. The local database was preserved separately: 25 tables, 817 rows, compressed into private D1 chunks and restored byte-for-byte with SHA-256 verification. The Blob store listed zero objects. Original source databases were not reset, seeded, merged, or deleted.

Actual checks run: Docker production build (exit 0); local container health and dictionary HTTP200; native canvas and PDF parser imports (exit 0); scripts/cloudflare-verify-archive.py (exit 0); scripts/cloudflare-verify-local-archive.py (exit 0); scripts/cloudflare-smoke.cjs (exit 0). The public smoke includes health/database connected, login/registration HTTP200, protected page redirects to public login, unauthorized APIs HTTP401, disabled role-switch HTTP403, nonexistent-login HTTP401, dictionary content, and fresh desktop/mobile Chrome rendering. Both screenshots were inspected: inputs and content visible, no horizontal overflow. No successful real-user login or production mutation was tested.

Failures preserved in private session logs: first Docker build lacked generated schema.vercel.prisma (fixed by explicit schema-generation step); initial D1 imports failed on table order, FK insertion order, and SQL statement length (fixed using all schema first, dependency-ordered rows, and chunked large values); an initial archive comparison used repr and incorrectly distinguished integer/float representations (fixed with typed value comparison); Windows SQL newline translation caused text differences (repaired only in the newly created D1 archive, then fresh D1 export compared every value successfully); initial guessed Workers subdomain was incorrect (replaced with Cloudflare's returned deployment URL); one PowerShell inline Python command failed quoting before execution (replaced with checked-in Python files). Earlier FAIL results are not claimed as PASS.

The saved live release was used because the working tree contains an additional OTP registration change without production email configuration. Cloudflare runtime credentials are private secrets; none are recorded here. Raw SQL, accounts, source environment files, passwords, session hashes, export download links, and private blobs stay in ignored .artifacts/ directories. Original Vercel remains available; unrelated Render services were not changed.

Remaining: port and test transactional operations before any live D1 switch; configure R2 and adapt authenticated upload/playback before removing Blob; final write freeze/delta reconciliation; authenticated acceptance testing. Journal JSON/Markdown/Word synchronization is checked separately; full Word pagination has not been visually reviewed.
"""
(destination / 'verification.md').write_text(verification, encoding='utf-8')
evidence_path = journal_root / 'evidence.json'
evidence = json.loads(evidence_path.read_text(encoding='utf-8'))
number = max(int(item['id'][2:]) for item in evidence['items']) + 1
ids = []
for name in ['deployment-summary.json', 'verification.md'] + files:
    file = destination / name
    relative = file.relative_to(workspace).as_posix()
    existing = next((item for item in evidence['items'] if item['path'] == relative), None)
    if existing:
        assert existing['sha256'] == hashlib.sha256(file.read_bytes()).hexdigest(), 'Evidence already registered with different contents'
        ids.append(existing['id'])
        continue
    identifier = f'MB{number}'
    number += 1
    ids.append(identifier)
    evidence['items'].insert(0, {'id': identifier, 'path': relative, 'scope': 'Observed Cloudflare deployment and archive checks. See verification.md for failures and unfinished live database/storage cutover.', 'inspected_on': '2026-11-09', 'event_date': '2026-11-09', 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})
evidence_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
journal_path = journal_root / 'journal.json'
journal = json.loads(journal_path.read_text(encoding='utf-8'))
assert not any(entry['id'] == 'EN-20261109-01' for entry in journal['entries']), 'Journal entry already exists'
journal['entries'].insert(0, {
    'id': 'EN-20261109-01', 'kind': 'observed', 'title': 'Cloudflare hosting migration and verified production/development data archives', 'date': '09/11/2026',
    'stage': 'Deployment and data preservation', 'status': 'Hosting deployed and archives verified; live D1/R2 cutover unfinished',
    'participants': 'User authorized migration and approved Cloudflare OAuth scopes; Codex executed. Other participants/location not confirmed.',
    'objective': 'Discover actual live English sources via CLI, preserve production and development data, and deploy the live website on Cloudflare.',
    'equipment': 'Windows PowerShell, Wrangler 4.158.0, Vercel CLI 65.12.1, Render CLI 2.29.0, Docker 29.9.2, Node 24.22.2 container, Next.js 14.2.35, Prisma 5.21.1, Python SQLite/lxml, Puppeteer Chrome.',
    'procedure': 'Read project rules and prior journal; inspect Vercel and Render; retrieve existing source configuration privately; export Neon consistently read-only; back up local SQLite and inspect private Blob store; import and verify D1 archives; build and deploy isolated saved live release; check native modules, public HTTP, desktop/mobile browser, and authorization failures.',
    'results': 'Cloudflare Worker/Container site deployed at https://adaptive-english.adaptive-learning-c3.workers.dev, version b45dc8b2-2f42-4034-adcb-3e20213d486b. Production D1 archive: 28 tables, 590 rows, all values verified, integrity/FK PASS. Separate development snapshot: 25 tables, 817 rows, byte-for-byte D1 restoration PASS. Blob store empty. Docker build and public HTTP/browser checks exit0. Live Neon and Vercel Blob retained. No source reset/merge/deletion; no successful authenticated production acceptance or mutation test. Initial build/import/comparison failures and corrections documented in verification.md. Word pagination not visually verified.',
    'lessons': 'Discover actual deployment instead of assuming Render owns English. Local source differs from live registration flow. Preserve transaction semantics rather than pointing Prisma at D1 without adaptation. D1 SQL limits, dependency order, and Windows newline translation must be checked with complete value/byte round trips. Separate development records from production.',
    'next': 'Port interactive transactions to atomic D1-compatible operations with rollback/concurrency tests before live DB cutover; configure R2 and adapt private recordings; perform authenticated acceptance and final delta reconciliation. Keep Neon/Blob and original Vercel available meanwhile.',
    'evidence': ids
})
journal_path.write_text(json.dumps(journal, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (workspace / 'docs/WORKLOG.md').open('a', encoding='utf-8') as file:
    file.write('\n\n## 2026-11-09 — Cloudflare hosting and data archives (EN-20261109-01)\n\n'
               '- Deployed https://adaptive-english.adaptive-learning-c3.workers.dev using the saved live release. Live database remains Neon; Vercel Blob retained. Full D1/R2 runtime cutover remains unfinished.\n'
               '- Production D1 archive: 28 tables/590 rows, every value round-trip verified, FK/integrity PASS. Separate development snapshot: 25 tables/817 rows, byte-for-byte D1 restore PASS. No source resets, merges, or deletions.\n'
               '- Docker/native-module/public HTTP/desktop and mobile browser checks PASS; no successful authenticated production workflow/mutation acceptance. Initial failures and corrections preserved.\n'
               '- Entry: research-journal/journal.json#EN-20261109-01; evidence: research-journal/evidence/EN-20261109-01/. Word pagination not visually verified.\n')
print(json.dumps({'entry': 'EN-20261109-01', 'evidence': ids, 'status': 'recorded'}))
