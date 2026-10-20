/* Pure, fully grouped Boolean expression extraction. Never lowers a statement or invokes source code. */
'use strict';
const E=require('./sqf-expression-ast'),S=require('./sqf-source-dependencies'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const VERSION='command-pure-boolean-v1',LIMITS=Object.freeze({characters:8192,nodes:256,fragments:1000});
const sha=text=>crypto.createHash('sha256').update(text,'utf8').digest('hex');
function lower(text){
 if(typeof text!=='string'||text.length>LIMITS.characters)throw Error('Boolean expression size rejected');
 const syntax=E.parseExtended(text);if(syntax.status!=='recognized'||syntax.nodes.length>LIMITS.nodes)throw Error('Outside the bounded Boolean expression family');
 const map=new Map(syntax.nodes.map(n=>[n.id,n])),values=new Map();
 for(const n of syntax.nodes){let value,code;
  if(n.kind==='Literal'&&n.literalType==='boolean'){value=n.value;code=value?'true':'false';}
  else if(n.kind==='Group'){const child=values.get(n.operand);if(!child)throw Error('Unknown Boolean operand');({value,code}=child);code='('+code+')';}
  else if(n.kind==='Unary'&&['!','not'].includes(n.operator)){const child=values.get(n.operand);if(!child||!['Literal','Group'].includes(map.get(n.operand).kind))throw Error('Explicit grouping required');value=!child.value;code='(!'+child.code+')';}
  else if(n.kind==='Binary'&&['&&','and','||','or'].includes(n.operator)){const left=values.get(n.left),right=values.get(n.right);if(!left||!right||![n.left,n.right].every(id=>['Literal','Group'].includes(map.get(id).kind)))throw Error('Explicit grouping required');const and=['&&','and'].includes(n.operator);value=and?(left.value&&right.value):(left.value||right.value);code='('+left.code+(and?' && ':' || ')+right.code+')';}
  else throw Error('Variables, commands, code values and non-Boolean operands remain manual');
  values.set(n.id,{value,code});
 }
 const root=values.get(syntax.root);if(!root)throw Error('Missing Boolean expression');return {mapping:VERSION,targetType:'bool',targetExpression:root.code,expectedValue:root.value,pure:true,sourceExecuted:false,statementLowered:false};
}
function fixture(){const expressions=['true','false','!true','!false','not true','not false'];for(const a of ['true','false'])for(const b of ['true','false'])for(const op of ['&&','and','||','or'])expressions.push(a+' '+op+' '+b);for(const a of ['true','false'])for(const b of ['true','false'])for(const c of ['true','false']){expressions.push('('+a+' and '+b+') or '+c);expressions.push(a+' and ('+b+' or '+c+')');expressions.push('not ('+a+' or ('+b+' and '+c+'))');}const rows=expressions.map((source,i)=>({id:i,source,...lower(source)}));const methods=rows.map(r=>' static bool Case_'+r.id+'() { return '+r.targetExpression+'; }');return {rows,code:'class COMMAND_BooleanProofValues\n{\n'+methods.join('\n')+'\n};\n'};}
function verification(){try{const receipt=JSON.parse(fs.readFileSync(path.join(__dirname,'native-evidence/pure-boolean-v1.json'),'utf8'));if(receipt.mapping!==VERSION||receipt.mappingSHA256!==sha(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n'))||receipt.fixtureSHA256!==sha(fixture().code)||receipt.compiled!==true||receipt.executed!==true||receipt.failures!==0||receipt.cases!==fixture().rows.length)throw Error('Native proof does not match this mapping');return receipt;}catch{return null;}}
function review(snapshot){
 if(!['types','effects'].includes(snapshot?.profile)||!snapshot.report?.controlContextReview)throw Error('Choose a completed Types or Effects review');
 const files=S.createSourceContext(snapshot.input.files,snapshot.input.mounts||[]).files,source=new Map(files.map(f=>[f.name,f.text])),flow=snapshot.report.controlContextReview;
 const reported=new Map(flow.files.map(f=>[f.name,f.sha256]));if(files.some(f=>reported.get(f.name)!==sha(f.text)))throw Error('Boolean review source identity mismatch');
 const dependencies=S.build(snapshot.input.files,snapshot.input.mounts||[]),blocked=dependencies.directives.length>0,fragments=[],unresolved=[];
 for(const slot of flow.expressionSlots){if(!/\.sqf$/i.test(slot.source.file))continue;try{if(blocked)throw Error('Selected package contains preprocessing directives');const text=source.get(slot.source.file).slice(slot.source.start,slot.source.end),mapped=lower(text);if(fragments.length>=LIMITS.fragments)throw Error('Boolean fragment limit exceeded');fragments.push({slotId:slot.id,nodeId:slot.ownerNodeId,role:slot.role,source:{...slot.source,sha256:reported.get(slot.source.file)},...mapped});}catch(e){if(e.message==='Boolean fragment limit exceeded')throw e;unresolved.push({slotId:slot.id,nodeId:slot.ownerNodeId,source:{...slot.source},reason:e.message});}}
 return {schema:'command-boolean-fragment-review',version:1,mapping:VERSION,executable:false,sourceExecuted:false,wholeStatementsLowered:false,fragments,unresolved,requiredReview:['effective-source-and-external-preprocessor-context','manual-parent-statement-and-lifecycle-integration','source-rights-and-attribution','target-engine-version-and-project-integration'],scope:'Pure expression values only; no parent node, variable, function, loop, scheduling or mission behavior is converted.'};
}
function attach(scaffold,snapshot){
 const proof=verification();if(!proof)throw Error('Matching native Boolean verification is not available');const report=review(snapshot);if(!report.fragments.length)throw Error('No supported pure Boolean expressions in this review');
 const lines=['// COMMAND — extracted pure Boolean values; not migrated source functions.','// Requires reviewed effective source and manual caller/lifecycle integration.','class COMMAND_BooleanFragments','{'];
 for(const [i,f] of report.fragments.entries()){const startLine=lines.length+1;lines.push(' static bool Value_'+String(i+1).padStart(4,'0')+'()',' {','  return '+f.targetExpression+';',' }');f.output={path:'Fragments/COMMAND_BooleanFragments.c',startLine,endLine:lines.length};f.tier='green-expression-only';f.nativeVerified=true;f.targetEngineVersion=proof.engineVersion;}
 lines.push('};');report.nativeProof={mappingSHA256:proof.mappingSHA256,fixtureSHA256:proof.fixtureSHA256,engineVersion:proof.engineVersion,cases:proof.cases,environment:proof.environment};report.summary={greenExpressionFragments:report.fragments.length,unresolvedExpressionSlots:report.unresolved.length,greenStatements:0,executionReadyMissions:0};
 scaffold.manifest.booleanFragments={report:'boolean-fragments.json',...report.summary};delete scaffold.manifest.manifestSHA256;scaffold.manifest.manifestSHA256=sha(JSON.stringify(scaffold.manifest));
 const files=scaffold.files.map(f=>f.path==='manifest.json'?{...f,text:JSON.stringify(scaffold.manifest,null,2)+'\n'}:f.path==='MIGRATION-CHECKLIST.md'?{...f,text:f.text+'\n## Optional pure Boolean expression helpers\n\nSee boolean-fragments.json and Fragments/COMMAND_BooleanFragments.c. Green applies only to expression values. Parent statement/lifecycle integration remains manual. External preprocessing and source rights require review.\n'}:f);
 files.push({path:'Fragments/COMMAND_BooleanFragments.c',text:lines.join('\n')+'\n'},{path:'boolean-fragments.json',text:JSON.stringify(report,null,2)+'\n'});return {files,manifest:scaffold.manifest,report};
}
module.exports={VERSION,LIMITS,lower,fixture,verification,review,attach};
