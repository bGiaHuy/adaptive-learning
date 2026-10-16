from pathlib import Path
import subprocess,sqlite3,json
root=Path(__file__).resolve().parents[1];app=root/'english-learning-platform';out=app/'artifacts/assignment-ability-20261012';out.mkdir(exist_ok=True)
logs=root/'docs/research-journal/evidence/EN-20261012-29'
schema=(app/'prisma/schema.prisma').read_text(encoding='utf-8').replace('provider = "prisma-client-js"','provider = "prisma-client-js"\n  output = "./generated"').replace('file:./dev.db','file:./isolated.db')
(out/'schema.prisma').write_text(schema,encoding='utf-8')
r=subprocess.run(['node',str(app/'node_modules/prisma/build/index.js'),'generate','--schema',str(out/'schema.prisma')],cwd=app,capture_output=True,text=True,encoding='utf-8',errors='replace')
(logs/'isolated-client.log').write_text(r.stdout+r.stderr+'\nexit='+str(r.returncode),encoding='utf-8');print('isolated client exit',r.returncode);assert r.returncode==0
# Only add the two nullable metadata columns. Never reset or seed local user data.
db=app/'prisma/dev.db'
with sqlite3.connect(db,timeout=10) as c:
 tables=['User','Classroom','Assignment','AssignmentVersion','Submission']
 before={t:c.execute('SELECT count(*) FROM "'+t+'"').fetchone()[0] for t in tables}
 c.execute('BEGIN IMMEDIATE')
 added=[]
 for table,column in [('AssignmentVersion','difficultyJson'),('Submission','abilityEvidenceJson')]:
  if column not in [row[1] for row in c.execute('PRAGMA table_info("'+table+'")')]:
   c.execute('ALTER TABLE "'+table+'" ADD COLUMN "'+column+'" TEXT');added.append(table+'.'+column)
 after={t:c.execute('SELECT count(*) FROM "'+t+'"').fetchone()[0] for t in tables}
 assert before==after
 c.commit()
data={'database':'local prisma/dev.db only','added':added,'counts_before':before,'counts_after':after,'status':'PASS','production_changed':False}
(logs/'local-additive-migration.json').write_text(json.dumps(data,indent=2),encoding='utf-8');print(json.dumps(data))
