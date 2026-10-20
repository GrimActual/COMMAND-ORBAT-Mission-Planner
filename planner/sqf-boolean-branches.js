/* Pure Boolean branches over already initialized locals. No dynamic scope or engine operations. */
'use strict';
const A=require('./sqf-structural-ast'),L=require('./sqf-boolean-locals'),D=require('./sqf-source-dependencies'),S=require('./sqf-migration'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const VERSION='command-boolean-branches-v1',LIMITS=Object.freeze({statements:128,branches:32,depth:8});
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
async function lower(name,text){
 if(D.sourceLexicalView(text).unterminated)throw Error('Unterminated source comment or string');
 const ast=await A.build([{name,text}]);if(D.build([{name,text}]).directives.length)throw Error('Preprocessing directives require review');
 const map=new Map(ast.nodes.map(n=>[n.id,n])),root=ast.nodes.find(n=>n.kind==='Program'),top=root.children.map(c=>map.get(c.nodeId));
 if(top.length<3)throw Error('Supply initialized locals, a branch and a final Boolean value');
 const env=new Map(),bindings=[],rows=[];let count=0,branches=0;
 const emit=(kind,n,target,depth,extra={})=>rows.push({kind,source:n.source,target:' '.repeat(depth*2)+target,...extra});
 function statement(n,state,depth){
  if(++count>LIMITS.statements)throw Error('Boolean branch statement limit exceeded');
  if(depth>LIMITS.depth)throw Error('Boolean branch depth limit exceeded');
  if(n.kind==='Assignment'&&!n.children.length){
   const tokens=S.tokenize(text.slice(n.source.start,n.source.end)),declaration=tokens[0]?.kind==='word'&&tokens[0].value.toLowerCase()==='private';
   if(declaration&&depth)throw Error('Declarations inside branches require scope review');
   const target=n.parts.find(p=>p.role==='target'),rhs=n.parts.find(p=>p.role==='expression'),sourceName=text.slice(target.source.start,target.source.end);
   if(!/^_[A-Za-z][A-Za-z0-9_]{0,62}$/.test(sourceName)||!rhs)throw Error('Only named Boolean locals are supported');
   const key=sourceName.toLowerCase(),prior=state.get(key);
   if(declaration&&prior)throw Error('Repeated local declaration requires scope review');
   if(!declaration&&!prior)throw Error('Branch assignment has no preceding private declaration');
   const expression=L.expression(text.slice(rhs.source.start,rhs.source.end),state),binding=prior||{sourceName,target:'local_'+String(bindings.length+1).padStart(4,'0')};
   if(declaration)bindings.push({sourceName,target:binding.target,source:target.source,targetType:'bool'});
   state.set(key,{...binding,value:expression.value});emit(declaration?'private-initializer':'local-assignment',n,(declaration?'bool ':'')+binding.target+' = '+expression.code+';',depth,{targetSource:target.source,expressionSource:rhs.source,reads:expression.reads,sourceName,targetName:binding.target});return;
  }
  if(n.kind==='If'){
   if(++branches>LIMITS.branches)throw Error('Boolean branch count limit exceeded');
   const condition=n.parts.find(p=>p.role==='condition'),value=L.expression(text.slice(condition.source.start,condition.source.end),state),yes=new Map(state),no=new Map(state);
   const arm=role=>{const c=n.children.find(c=>c.role===role);return c?map.get(c.nodeId):null;},then=arm('then'),otherwise=arm('else');
   emit('if-condition',n,'if ('+value.code+')',depth,{conditionSource:condition.source,reads:value.reads});emit('branch-open',n,'{',depth);
   // Always validate both arms, even when the isolated fixture condition is known.
   for(const child of then.children)statement(map.get(child.nodeId),yes,depth+1);
   emit('branch-close',n,'}',depth);
   if(otherwise){emit('else',n,'else',depth);emit('branch-open',n,'{',depth);for(const child of otherwise.children)statement(map.get(child.nodeId),no,depth+1);emit('branch-close',n,'}',depth);}
   const selected=value.value?yes:no;for(const [key,b]of selected)state.set(key,b);return;
  }
  throw Error('Only initialized Boolean locals, assignments and statement-form if/else are supported');
 }
 for(const n of top.slice(0,-1))statement(n,env,0);
 if(++count>LIMITS.statements)throw Error('Boolean branch statement limit exceeded');
 const final=top.at(-1);if(final.kind!=='OpaqueStatement'||final.children.length||!bindings.length||!branches)throw Error('Branch block needs initialized locals and an explicit final Boolean value');
 const result=L.expression(text.slice(final.source.start,final.source.end),env);emit('return-value',final,'return '+result.code+';',0,{reads:result.reads});
 return {mapping:VERSION,sourceExecuted:false,scope:'isolated-pure-boolean-branch-block',expectedValue:result.value,bindings,branches,statements:rows,code:rows.map(r=>r.target)};
}
async function fixture(){const rows=[];for(const cond of ['true','false'])for(const initial of ['true','false'])for(const update of ['true','false']){const pre='private _flag = '+cond+'; private _value = '+initial+'; ',examples=[pre+'if (_flag) then {_value = '+update+';} else {_value = not _value;}; _value;',pre+'if (_flag) then {_value = '+update+';}; _value;',pre+'if (_flag) then {if (_value) then {_value = '+update+';} else {_value = not _flag;};} else {_value = (_value or '+update+');}; _value;',pre+'if (_flag) then {_flag = not _value;} else {_flag = _value;}; if (_flag) then {_value = '+update+';} else {_value = not _value;}; _value;'];for(const source of examples){const id=rows.length;rows.push({id,source,...await lower('fixture-'+id+'.sqf',source)});}}return {rows,code:'class COMMAND_BooleanBranchesProofValues\n{\n'+rows.map(r=>' static bool Case_'+r.id+'()\n {\n'+r.code.map(s=>'  '+s).join('\n')+'\n }').join('\n')+'\n};\n'};}
function mappingHashes(){return Object.fromEntries(['sqf-boolean-branches.js','sqf-boolean-locals.js','sqf-expression-ast.js','sqf-structural-ast.js','sqf-migration.js','sqf-source-dependencies.js'].map(f=>[f,sha(fs.readFileSync(path.join(__dirname,f),'utf8').replace(/\r\n/g,'\n'))]));}
async function verification(){try{const proof=JSON.parse(fs.readFileSync(path.join(__dirname,'native-evidence/boolean-branches-v1.json'),'utf8')),f=await fixture();return proof.mapping===VERSION&&JSON.stringify(proof.moduleSHA256)===JSON.stringify(mappingHashes())&&proof.fixtureSHA256===sha(f.code)&&proof.cases===f.rows.length&&proof.compiled===true&&proof.executed===true&&proof.failures===0?proof:null;}catch{return null;}}
async function review(snapshot){
 if(!['types','effects'].includes(snapshot?.profile)||!snapshot.report?.controlContextReview)throw Error('Choose a completed Types or Effects review');
 const files=D.createSourceContext(snapshot.input.files,snapshot.input.mounts||[]).files,reported=new Map(snapshot.report.controlContextReview.files.map(f=>[f.name,f.sha256]));
 if(reported.size!==files.length||files.some(f=>reported.get(f.name)!==sha(f.text)))throw Error('Boolean branch source identity mismatch');
 const preprocessing=D.build(snapshot.input.files,snapshot.input.mounts||[]).directives.length>0,blocks=[],unresolved=[];
 for(const f of files){if(!/\.sqf$/i.test(f.name))continue;try{if(preprocessing)throw Error('Selected package contains preprocessing directives');blocks.push({file:f.name,sha256:sha(f.text),...await lower(f.name,f.text)});}catch(e){unresolved.push({file:f.name,reason:e.message});}}
 return {schema:'command-boolean-branch-review',version:1,mapping:VERSION,executable:false,sourceExecuted:false,wholeMissionConverted:false,blocks,unresolved,offsetEncoding:'utf16-code-units',sourceHashScope:'decoded-utf8-text',requiredReview:['effective-source-and-external-preprocessing','isolated-scope-and-caller-integration','source-rights-and-attribution','target-engine-version-and-project-integration']};
}
async function attach(scaffold,snapshot){
 const proof=await verification();if(!proof)throw Error('Matching native Boolean branch proof is unavailable');const report=await review(snapshot);if(!report.blocks.length)throw Error('No complete supported Boolean branch blocks in this review');
 const lines=['// COMMAND — isolated Boolean branches. Manual caller/lifecycle integration required.','class COMMAND_BooleanBranchBlocks','{'];
 for(const [i,b]of report.blocks.entries()){lines.push(' static bool Block_'+String(i+1).padStart(4,'0')+'()',' {');for(const row of b.statements){const line=lines.length+1;lines.push('  '+row.target);row.output={path:'Fragments/COMMAND_BooleanBranchBlocks.c',startLine:line,endLine:line};}lines.push(' }');b.tier='green-isolated-boolean-branch-block';b.nativeVerified=true;}
 lines.push('};');report.nativeProof=proof;report.summary={greenIsolatedBlocks:report.blocks.length,branches:report.blocks.reduce((n,b)=>n+b.branches,0),manualFiles:report.unresolved.length,executionReadyMissions:0};scaffold.manifest.booleanBranches={report:'boolean-branch-blocks.json',...report.summary};delete scaffold.manifest.manifestSHA256;scaffold.manifest.manifestSHA256=sha(JSON.stringify(scaffold.manifest));
 const files=scaffold.files.map(f=>f.path==='manifest.json'?{...f,text:JSON.stringify(scaffold.manifest,null,2)+'\n'}:f.path==='MIGRATION-CHECKLIST.md'?{...f,text:f.text+'\n## Optional isolated Boolean branches\n\nBoth branch arms were checked. Only writes to existing initialized Boolean locals are lowered. Branch-local declarations, loops, engine commands and caller/lifecycle integration remain manual.\n'}:f);
 files.push({path:'Fragments/COMMAND_BooleanBranchBlocks.c',text:lines.join('\n')+'\n'},{path:'boolean-branch-blocks.json',text:JSON.stringify(report,null,2)+'\n'});return {files,manifest:scaffold.manifest,report};
}
module.exports={VERSION,LIMITS,lower,fixture,mappingHashes,verification,review,attach};
