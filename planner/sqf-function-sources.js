/* Selected literal CfgFunctions registrations -> virtual function wrappers.
 * This does not load files, preprocess configs, register code or execute SQF. */
'use strict';
const D=require('./sqf-source-dependencies'),R=require('./sqf-function-registrations'),crypto=require('node:crypto');
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
function prepare(files,{mounts=[],configRoots=[]}={}){
 const context=D.createSourceContext(files,mounts),originals=new Map(context.files.map(f=>[f.name,f.text]));
 const report=R.build(context.files.map(({name,text})=>({name,text})),context.mounts,configRoots);
 const hasConfig=report.coverage.some(c=>c.cfgFunctionsRoots>0),bindings=[],issues=report.coverage.some(c=>c.status==='lexically-unresolved')?['Selected source has unresolved lexical structure']:[];
 if(hasConfig){
  // A partial config cannot establish an effective registration table.
  if(report.findings.length||report.coverage.some(c=>c.status==='lexically-unresolved')||D.build(files,mounts).directives.length)issues.push('Registration config requires complete literal source without preprocessing or opaque statements');
  for(const r of report.registrations){
   const unresolved=r.blockers.filter(x=>!['preprocessing-and-config-merges-unresolved','runtime-binding-and-effects-unresolved'].includes(x));
   if(unresolved.length||r.path.status!=='resolved-exact'||!r.nameCandidate||Object.values(r.initFlags).some(f=>f.status==='unresolved'||f.value===1))issues.push('Registration '+(r.nameCandidate||r.id)+' requires review: '+[...unresolved,...Object.entries(r.initFlags).filter(([,f])=>f.status==='unresolved'||f.value===1).map(([k])=>k)].join(', '));
   else bindings.push({file:r.path.target,sourceName:r.nameCandidate,registrationSource:r.source,registrationContextSHA256:report.reviewContextSHA256});
  }
  const names=new Set(),paths=new Set();for(const b of bindings){const name=b.sourceName.toLowerCase(),file=b.file.toLowerCase();if(names.has(name)||paths.has(file))issues.push('Ambiguous name or multiply registered source: '+b.sourceName);names.add(name);paths.add(file);}
 }
 const byFile=new Map(bindings.map(b=>[b.file,b])),maps=new Map(),normalized=context.files.map(f=>{
  const b=byFile.get(f.name);if(!b||issues.length)return {name:f.name,text:f.text};
  const prefix=b.sourceName+' = {\n',text=prefix+f.text+'\n};';maps.set(f.name,{...b,prefix:prefix.length,length:f.text.length});return {name:f.name,text};
 });
 function remap(value){
  if(Array.isArray(value))return value.map(remap);if(!value||typeof value!=='object')return value;
  const result=Object.fromEntries(Object.entries(value).map(([k,v])=>[k,remap(v)])),m=maps.get(value.file);
  if(m&&Number.isInteger(value.start)&&Number.isInteger(value.end)){
   result.start=Math.max(0,Math.min(m.length,value.start-m.prefix));result.end=Math.max(result.start,Math.min(m.length,value.end-m.prefix));
   const lines=originals.get(value.file).slice(0,result.start).split(/\r\n|\r|\n/);result.line=lines.length;result.column=lines.at(-1).length+1;
  }
  return result;
 }
 function restore(result){
  const out=remap(result);out.files=context.files.map(f=>({name:f.name,sha256:sha(f.text)}));
  for(const f of out.functions){const m=maps.get(f.file);if(!m)continue;const text=originals.get(f.file);f.sourceSHA256=sha(text);f.definitionSHA256=sha(text);f.registration={sourceName:m.sourceName,source:m.registrationSource,contextSHA256:m.registrationContextSHA256,scope:'selected-literal-config-only',runtimeRegistrationPerformed:false};}
  out.registrationReview={contextSHA256:report.reviewContextSHA256,registeredBodies:maps.size,issues,sourceRegistrationPerformed:false,externalConfigMergesVerified:false};return out;
 }
 return {files:normalized,issues,restore};
}
module.exports={prepare};
