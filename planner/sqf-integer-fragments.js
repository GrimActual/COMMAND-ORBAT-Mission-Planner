/* Exact integer expression values only. Parent statements and numeric runtime bindings stay manual. */
'use strict';
const E=require('./sqf-expression-ast'),D=require('./sqf-source-dependencies'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const VERSION='command-exact-integer-v1',LIMITS=Object.freeze({characters:8192,nodes:256,fragments:1000,magnitude:16777215});
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
function lower(text){
 if(typeof text!=='string'||text.length>LIMITS.characters)throw Error('Integer expression size limit exceeded');
 const syntax=E.parseExtended(text);if(syntax.status!=='recognized'||syntax.nodes.length>LIMITS.nodes)throw Error('Outside the bounded integer expression family');
 const map=new Map(syntax.nodes.map(n=>[n.id,n])),values=new Map();
 for(const n of syntax.nodes){let value,code;
  if(n.kind==='Literal'&&n.literalType==='number'){if(!/^\d+$/.test(text.slice(n.start,n.end)))throw Error('Only decimal integer literal syntax is supported');value=n.value;code=String(value);}
  else if(n.kind==='Group'){const c=values.get(n.operand);if(!c)throw Error('Unknown integer operand');value=c.value;code=c.code;}
  else if(n.kind==='Unary'&&n.operator==='-'){const c=values.get(n.operand);if(!c||!['Literal','Group'].includes(map.get(n.operand).kind))throw Error('Explicit integer grouping required');value=-c.value;code='(-'+c.code+')';}
  else if(n.kind==='Binary'&&['+','-','*'].includes(n.operator)){const l=values.get(n.left),r=values.get(n.right);if(!l||!r||![n.left,n.right].every(id=>['Literal','Group'].includes(map.get(id).kind)))throw Error('Explicit integer grouping required');value=n.operator==='+'?l.value+r.value:n.operator==='-'?l.value-r.value:l.value*r.value;code='('+l.code+' '+n.operator+' '+r.code+')';}
  else throw Error('Variables, decimals, division, commands and non-integer operands remain manual');
  if(!Number.isSafeInteger(value)||Math.abs(value)>LIMITS.magnitude)throw Error('Integer intermediate result exceeds the exact supported range');
  if(Object.is(value,-0))value=0;values.set(n.id,{value,code});
 }
 const r=values.get(syntax.root);if(!r)throw Error('Missing integer expression');return {mapping:VERSION,targetType:'int',targetExpression:r.code,expectedValue:r.value,pure:true,sourceExecuted:false,statementLowered:false};
}
function fixture(){const sources=['0','7','-7','16777215','-16777215','-(3)'];for(const a of ['0','3','-4'])for(const b of ['1','-2','5']){for(const op of ['+','-','*'])sources.push('('+a+') '+op+' ('+b+')');sources.push('(('+a+') + ('+b+')) * 2');}const rows=sources.map((source,id)=>({id,source,...lower(source)}));return {rows,code:'class COMMAND_IntegerProofValues\n{\n'+rows.map(r=>' static int Case_'+r.id+'() { return '+r.targetExpression+'; }').join('\n')+'\n};\n'};}
function mappingHashes(){return Object.fromEntries(['sqf-integer-fragments.js','sqf-expression-ast.js','sqf-structural-ast.js','sqf-migration.js','sqf-source-dependencies.js'].map(f=>[f,sha(fs.readFileSync(path.join(__dirname,f),'utf8').replace(/\r\n/g,'\n'))]));}
function verification(){try{const proof=JSON.parse(fs.readFileSync(path.join(__dirname,'native-evidence/exact-integer-v1.json'),'utf8')),f=fixture();return proof.mapping===VERSION&&JSON.stringify(proof.moduleSHA256)===JSON.stringify(mappingHashes())&&proof.fixtureSHA256===sha(f.code)&&proof.cases===f.rows.length&&proof.compiled===true&&proof.executed===true&&proof.failures===0?proof:null;}catch{return null;}}
function review(snapshot){
 if(!['types','effects'].includes(snapshot?.profile)||!snapshot.report?.controlContextReview)throw Error('Choose a completed Types or Effects review');
 const files=D.createSourceContext(snapshot.input.files,snapshot.input.mounts||[]).files,source=new Map(files.map(f=>[f.name,f.text])),flow=snapshot.report.controlContextReview,reported=new Map(flow.files.map(f=>[f.name,f.sha256]));
 if(reported.size!==files.length||files.some(f=>reported.get(f.name)!==sha(f.text)))throw Error('Integer review source identity mismatch');
 const blocked=D.build(snapshot.input.files,snapshot.input.mounts||[]).directives.length>0,fragments=[],unresolved=[];
 for(const slot of flow.expressionSlots){if(!/\.sqf$/i.test(slot.source.file))continue;try{if(blocked)throw Error('Selected package contains preprocessing directives');const mapped=lower(source.get(slot.source.file).slice(slot.source.start,slot.source.end));if(fragments.length>=LIMITS.fragments)throw Error('Integer fragment limit exceeded');fragments.push({slotId:slot.id,nodeId:slot.ownerNodeId,role:slot.role,source:{...slot.source,sha256:reported.get(slot.source.file)},...mapped});}catch(e){if(e.message==='Integer fragment limit exceeded')throw e;unresolved.push({slotId:slot.id,nodeId:slot.ownerNodeId,source:slot.source,reason:e.message});}}
 return {schema:'command-integer-fragment-review',version:1,mapping:VERSION,executable:false,sourceExecuted:false,wholeStatementsLowered:false,fragments,unresolved,requiredReview:['effective-source-and-external-preprocessing','manual-parent-statement-types-and-lifecycle-integration','source-rights-and-attribution','target-engine-version-and-project-integration'],scope:'Exact integer expression values only. Parent assignments, functions and missions are not converted.'};
}
function attach(scaffold,snapshot){
 const proof=verification();if(!proof)throw Error('Matching native integer proof is unavailable');const report=review(snapshot);if(!report.fragments.length)throw Error('No supported exact integer expressions in this review');
 const lines=['// COMMAND — extracted exact integer values; parent statements and caller integration remain manual.','class COMMAND_IntegerFragments','{'];
 for(const [i,f]of report.fragments.entries()){const startLine=lines.length+1;lines.push(' static int Value_'+String(i+1).padStart(4,'0')+'()',' {','  return '+f.targetExpression+';',' }');f.output={path:'Fragments/COMMAND_IntegerFragments.c',startLine,endLine:lines.length};f.tier='green-expression-only';f.nativeVerified=true;}
 lines.push('};');report.nativeProof=proof;report.offsetEncoding='utf16-code-units';report.sourceHashScope='decoded-utf8-text';report.summary={greenExpressionFragments:report.fragments.length,unresolvedExpressionSlots:report.unresolved.length,greenStatements:0,executionReadyMissions:0};scaffold.manifest.integerFragments={report:'integer-fragments.json',...report.summary};delete scaffold.manifest.manifestSHA256;scaffold.manifest.manifestSHA256=sha(JSON.stringify(scaffold.manifest));
 const files=scaffold.files.map(f=>f.path==='manifest.json'?{...f,text:JSON.stringify(scaffold.manifest,null,2)+'\n'}:f.path==='MIGRATION-CHECKLIST.md'?{...f,text:f.text+'\n## Optional exact integer values\n\nSee integer-fragments.json. Every literal and intermediate result stays within ±16,777,215. Parent statements, types and integration remain manual.\n'}:f);files.push({path:'Fragments/COMMAND_IntegerFragments.c',text:lines.join('\n')+'\n'},{path:'integer-fragments.json',text:JSON.stringify(report,null,2)+'\n'});return {files,manifest:scaffold.manifest,report};
}
module.exports={VERSION,LIMITS,lower,fixture,mappingHashes,verification,review,attach};
