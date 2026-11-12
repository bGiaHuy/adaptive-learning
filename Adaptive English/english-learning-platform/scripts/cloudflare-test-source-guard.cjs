const { spawnSync } = require('node:child_process');
const { statements } = require('./cloudflare-source-guard.cjs');
const fs = require('node:fs');
const tables = ['GuardParent', 'GuardChild'];
const commands = [
  'CREATE TABLE "GuardParent"(id int PRIMARY KEY,value text);',
  'CREATE TABLE "GuardChild"(id int PRIMARY KEY,parent int REFERENCES "GuardParent"(id));',
  "INSERT INTO \"GuardParent\" VALUES(1,'preserve');",
  'INSERT INTO "GuardChild" VALUES(1,1);',
  'BEGIN;', ...statements(tables).map(sql => sql + ';'), 'COMMIT;',
];
for (const query of ["INSERT INTO \"GuardParent\" VALUES(2,'blocked')", 'UPDATE "GuardParent" SET value=\'blocked\' WHERE id=1', 'DELETE FROM "GuardChild" WHERE id=1', 'TRUNCATE "GuardChild"']) {
  commands.push(`DO $test$ BEGIN BEGIN ${query}; RAISE EXCEPTION 'Guard did not block'; EXCEPTION WHEN SQLSTATE '25006' THEN NULL; END; END $test$;`);
}
commands.push(`DO $test$ BEGIN IF (SELECT value FROM "GuardParent" WHERE id=1) <> 'preserve' OR (SELECT count(*) FROM "GuardChild") <> 1 THEN RAISE EXCEPTION 'Data changed'; END IF; END $test$;`);
commands.push('BEGIN;', ...statements(tables, true).map(sql => sql + ';'), 'COMMIT;', 'UPDATE "GuardParent" SET value=\'restored\' WHERE id=1;', `DO $test$ BEGIN IF (SELECT value FROM "GuardParent" WHERE id=1) <> 'restored' THEN RAISE EXCEPTION 'Removal failed'; END IF; END $test$;`);
const result = spawnSync('docker', ['exec','-i','adaptive-english-migration-guard-test-20261109','psql','-U','postgres','-v','ON_ERROR_STOP=1'], {input:commands.join('\n'),encoding:'utf8'});
fs.writeFileSync('.artifacts/d1-runtime-lab/source-guard-isolated-test.log',result.stdout+'\n'+result.stderr,{flag:'wx'});
if (result.status !== 0) process.exitCode = 1;
console.log(JSON.stringify({result:result.status===0?'PASS':'FAIL',exitCode:result.status,environment:'isolated-postgres-16',blocked:['INSERT','UPDATE','DELETE','TRUNCATE'],rowsPreserved:true,reversible:true}));
