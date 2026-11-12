"""Plan and locally verify a row delta; never resets an existing target table."""
from collections import Counter
import base64
import json
from pathlib import Path
import sqlite3
import sys

directory=Path(sys.argv[1])
expected=sqlite3.connect('file:'+(directory/'canonical.private.sqlite').resolve().as_posix()+'?mode=ro',uri=True)
actual=sqlite3.connect(':memory:')
actual.executescript(Path(sys.argv[2]).read_text(encoding='utf-8'))
quote=lambda value:'"'+value.replace('"','""')+'"'
tables=[row[0]for row in expected.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
changes=[]
summary=[]
for table in tables:
 info=list(expected.execute('PRAGMA table_info('+quote(table)+')'))
 columns=[row[1]for row in info];keys=[i for i,row in enumerate(info)if row[5]]
 assert keys,'Missing primary key'
 select='SELECT '+','.join(map(quote,columns))+' FROM '+quote(table)
 left={tuple(row[i]for i in keys):row for row in expected.execute(select)}
 right={tuple(row[i]for i in keys):row for row in actual.execute(select)}
 counts={'table':table,'inserted':0,'updated':0,'deleted':0}
 where=' AND '.join(quote(columns[i])+'=?'for i in keys)
 for key in right.keys()-left.keys():
  changes.append({'sql':'DELETE FROM '+quote(table)+' WHERE '+where,'params':list(key)});counts['deleted']+=1
 for key,row in left.items():
  if key not in right:
   changes.append({'sql':'INSERT INTO '+quote(table)+' ('+','.join(map(quote,columns))+') VALUES ('+','.join('?'for _ in row)+')','params':list(row)});counts['inserted']+=1
  elif row!=right[key]:
   changes.append({'sql':'UPDATE '+quote(table)+' SET '+','.join(quote(col)+'=?'for col in columns)+' WHERE '+where,'params':list(row)+list(key)});counts['updated']+=1
 summary.append(counts)
# Rehearse the exact batch with FK/cascade semantics before remote application.
actual.execute('PRAGMA foreign_keys=ON')
actual.execute('BEGIN')
actual.execute('PRAGMA defer_foreign_keys=ON')
for change in changes:actual.execute(change['sql'],change['params'])
actual.commit()
for table in tables:
 select='SELECT * FROM '+quote(table)
 assert Counter(expected.execute(select))==Counter(actual.execute(select)), 'Delta round trip mismatch: '+table
assert not list(actual.execute('PRAGMA foreign_key_check'))
assert actual.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
def wire(value):
 if isinstance(value,bytes):return {'blob':base64.b64encode(value).decode()}
 if isinstance(value,int):assert abs(value)<=2**53-1
 return value
payload=[{'sql':item['sql'],'params':[wire(value)for value in item['params']]}for item in changes]
(directory/'delta.private.json').write_text(json.dumps(payload),encoding='utf-8')
report={'result':'PASS','mutations':len(changes),'tables':summary,'rehearsalMatchesEveryValue':True,'foreignKeyViolations':0}
(directory/'delta-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'result':'PASS','mutations':len(changes),'allValuesMatchAfterRehearsal':True}))
