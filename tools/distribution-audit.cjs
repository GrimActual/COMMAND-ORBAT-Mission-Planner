'use strict';
const fs=require('node:fs'),path=require('node:path');
const SKIP=new Set(['.git','node_modules']);
function inspect(relative,bytes,{runtime=false}={}){
 const issues=[],name=relative.replace(/\\/g,'/'),parts=name.split('/'),base=parts.at(-1);
 if(parts.some(p=>/^(private(?:[-_].*)?|OriginalSources|work|profiles?)$/i.test(p))||/^\.env(?:\.|$)/i.test(base)||/\.(?:pbo|wrp|pem|key|mdmp|dmp)$/i.test(base))issues.push('private-or-nondistributable-file');
 if(runtime&&/\.test\.(?:js|cjs)$/.test(base))issues.push('runtime-test-file');
 if(/(?:^|\/)test-evidence\/.*\.json$/i.test(name)){
  let value;try{value=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));}catch{issues.push('invalid-evidence-json');return issues;}
  function walk(v){if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(/^(privateCorpora|privateSources|privateProjects)$/i.test(k)&&x&&(Array.isArray(x)?x.length:Object.keys(x).length))issues.push('private-test-details');if(/^(sourceText|rawSource|sourceBody|sourceCode|snippet)$/i.test(k)&&typeof x==='string'&&x.length)issues.push('embedded-source-body');if(k==='files'&&Array.isArray(x)&&x.some(f=>f&&typeof f.text==='string'))issues.push('embedded-source-package');if(typeof x==='object')walk(x);}}
  walk(value);
  if(typeof value.schema==='string'&&value.schema.startsWith('command-')&&/(sqf|source|diagnostic)/.test(value.schema)&&(value.files||value.reads||value.controlContextReview||value.symbols||value.symbolIdentities))issues.push('captured-review-report');
  if(/corpus/i.test(base)&&value.sourceIncluded!==false&&!(Array.isArray(value)&&value.every(row=>/^(scenario-v[12]|journal-v2|tracked-batch-v3)\.schema\.json$/.test(row.schema))))issues.push('external-corpus-record');
 }
 return [...new Set(issues)];
}
function audit(root,options={}){
 const violations=[];let checked=0;
 function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(SKIP.has(e.name))continue;const absolute=path.join(dir,e.name),relative=path.relative(root,absolute).split(path.sep).join('/');if(e.isSymbolicLink()){violations.push({path:relative,reasons:['symbolic-link']});continue;}if(e.isDirectory()){visit(absolute);continue;}if(!e.isFile())continue;checked++;const evidence=/(?:^|\/)test-evidence\/.*\.json$/i.test(relative),issues=inspect(relative,evidence?fs.readFileSync(absolute):Buffer.alloc(0),options);if(issues.length)violations.push({path:relative,reasons:issues});}}
 visit(root);return {checked,ok:!violations.length,violations};
}
if(require.main===module){const mode=process.argv[2],target=process.argv[3];if(!['--repo','--runtime'].includes(mode)||!target){console.error('Usage: node tools/distribution-audit.cjs --repo|--runtime <folder>');process.exitCode=2;}else{const report=audit(path.resolve(target),{runtime:mode==='--runtime'});console.log(JSON.stringify({checked:report.checked,ok:report.ok,violations:report.violations.map(({reasons},index)=>({item:index+1,reasons}))},null,2));process.exitCode=report.ok?0:1;}}
module.exports={audit,inspect};
