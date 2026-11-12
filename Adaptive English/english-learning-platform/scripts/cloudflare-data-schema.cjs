const quote = name => '"' + name.replaceAll('"', '""') + '"';
function revisionSchema(tables) {
  const statements = [
    'CREATE TABLE _ae_revision(id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL DEFAULT 0)',
    'INSERT INTO _ae_revision(id,version) VALUES(1,0)',
    'CREATE TABLE _ae_commit_guard(id INTEGER PRIMARY KEY CHECK(id=1), valid INTEGER NOT NULL CONSTRAINT cf_revision_match CHECK(valid=1))',
    'CREATE TABLE _ae_commits(id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, revision INTEGER NOT NULL, committedAt INTEGER NOT NULL)',
    'CREATE INDEX _ae_commits_committedAt_idx ON _ae_commits(committedAt)',
  ];
  for (const table of tables) {
    for (const operation of ['INSERT', 'UPDATE', 'DELETE']) statements.push('CREATE TRIGGER ' + quote('_ae_revision_' + table + '_' + operation) + ' AFTER ' + operation + ' ON ' + quote(table) + ' BEGIN UPDATE _ae_revision SET version=version+1 WHERE id=1; END');
  }
  return statements;
}
module.exports = { revisionSchema };
