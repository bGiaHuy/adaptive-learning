const fs=require('fs'),path=require('path'),ts=require('typescript');
function load(file,deps={}) {
 const m={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(id=>{if(id in deps)return deps[id];throw Error(id)},m,m.exports);
 return m.exports;
}
const ability=load('lib/assignmentAbility.ts',{'./aiEngine':{requestMwapiJson:async()=>({unavailable:true})}});
module.exports={load,ability};
