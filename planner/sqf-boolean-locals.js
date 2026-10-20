/* Isolated, straight-line Boolean local blocks. No source function, lifecycle or engine binding. */
'use strict';
const A=require('./sqf-structural-ast'),E=require('./sqf-expression-ast'),D=require('./sqf-source-dependencies'),S=require('./sqf-migration'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const VERSION='command-boolean-locals-v1',LIMITS=Object.freeze({statements:128,expressionCharacters:8192,expressionNodes:256});
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
function expression(text,env){
 if(text.length>LIMITS.expressionCharacters)throw Error('Boolean local expression size limit exceeded');
 const tree=E.parseExtended(text);if(tree.status!=='recognized'||tree.nodes.length>LIMITS.expressionNodes)throw Error('Unsupported Boolean local expression');
 const nodes=new Map(tree.nodes.map(n=>[n.id,n])),values=new Map(),reads=[];
 for(const n of tree.nodes){let value,code;
  if(n.kind==='Literal'&&n.literalType==='boolean'){value=n.value;code=value?'true':'false';}
  else if(n.kind==='Symbol'){const found=env.get(n.name.toLowerCase());if(!found)throw Error('Local read has no preceding initialized declaration: '+n.name);value=found.value;code=found.target;reads.push(found.sourceName);}
  else if(n.kind==='Group'){const c=values.get(n.operand);if(!c)throw Error('Unresolved Boolean local operand');value=c.value;code='('+c.code+')';}
  else if(n.kind==='Unary'&&['!','not'].includes(n.operator)){const c=values.get(n.operand);if(!c||!['Literal','Symbol','Group'].includes(nodes.get(n.operand).kind))throw Error('Explicit Boolean grouping required');value=!c.value;code='(!'+c.code+')';}
  else if(n.kind==='Binary'&&['&&','and','||','or'].includes(n.operator)){const l=values.get(n.left),r=values.get(n.right);if(!l||!r||![n.left,n.right].every(id=>['Literal','Symbol','Group'].includes(nodes.get(id).kind)))throw Error('Explicit Boolean grouping required');const and=['&&','and'].includes(n.operator);value=and?l.value&&r.value:l.value||r.value;code='('+l.code+(and?' && ':' || ')+r.code+')';}
  else throw Error('Only pure Boolean values and initialized local reads are supported');
  values.set(n.id,{value,code});
 }
 const result=values.get(tree.root);if(!result)throw Error('Missing Boolean local result');return {...result,reads:[...new Set(reads)]};
}
async function lower(name,text){
 if(D.sourceLexicalView(text).unterminated)throw Error('Unterminated source comment or string');
 const doc=await A.build([{name,text}]);if(D.build([{name,text}]).directives.length)throw Error('Preprocessing directives require review');
 const root=doc.nodes.find(n=>n.kind==='Program'),map=new Map(doc.nodes.map(n=>[n.id,n])),statements=root.children.map(c=>map.get(c.nodeId));
 if(statements.length<2||statements.length>LIMITS.statements)throw Error('Supply bounded declarations and a final Boolean value');
 const env=new Map(),bindings=[],rows=[],code=[];
 for(let i=0;i<statements.length;i++){
  const n=statements[i],last=i===statements.length-1;
  if(last){if(n.kind!=='OpaqueStatement'||n.children.length)throw Error('Block must end with an explicit pure Boolean value, not an assignment');const result=expression(text.slice(n.source.start,n.source.end),env);rows.push({kind:'return-value',source:n.source,reads:result.reads,target:'return '+result.code+';'});code.push('return '+result.code+';');return {mapping:VERSION,sourceExecuted:false,scope:'isolated-straight-line-local-block',expectedValue:result.value,bindings,statements:rows,code};}
  if(n.kind!=='Assignment'||n.children.length)throw Error('Only flat initialized local declarations and assignments are supported');
  const tokens=S.tokenize(text.slice(n.source.start,n.source.end)),declaration=tokens[0]?.kind==='word'&&tokens[0].value.toLowerCase()==='private',target=n.parts.find(p=>p.role==='target'),rhs=n.parts.find(p=>p.role==='expression');
  const sourceName=text.slice(target.source.start,target.source.end);
  if(!/^_[A-Za-z][A-Za-z0-9_]{0,62}$/.test(sourceName)||!rhs)throw Error('Only named local variables are supported');
  const key=sourceName.toLowerCase(),previous=env.get(key);
  if(declaration&&previous)throw Error('Repeated local declaration requires scope review');
  if(!declaration&&!previous)throw Error('Assignment has no preceding private declaration');
  const result=expression(text.slice(rhs.source.start,rhs.source.end),env),binding=previous||{sourceName,target:'local_'+String(bindings.length+1).padStart(4,'0')};
  if(declaration)bindings.push({sourceName,target:binding.target,source:target.source,targetType:'bool'});
  env.set(key,{...binding,value:result.value});const line=(declaration?'bool ':'')+binding.target+' = '+result.code+';';code.push(line);rows.push({kind:declaration?'private-initializer':'local-assignment',source:n.source,targetSource:target.source,expressionSource:rhs.source,sourceName,targetName:binding.target,reads:result.reads,target:line});
 }
 throw Error('Missing final Boolean result');
}
async function fixture(){const sources=[];for(const a of ['true','false'])for(const b of ['true','false'])for(const op of ['and','or']){sources.push('private _first = '+a+'; private _second = '+b+'; _first '+op+' _second;');sources.push('private _first = '+a+'; private _second = '+b+'; _first = (_first '+op+' _second); _first;');sources.push('private _MixedCase = '+a+'; _mixedcase = not _MIXEDCASE; private _copy = (_mixedcase '+op+' '+b+'); _copy;');}const rows=[];for(const [id,source]of sources.entries())rows.push({id,source,...await lower('fixture-'+id+'.sqf',source)});return {rows,code:'class COMMAND_BooleanLocalsProofValues\n{\n'+rows.map(r=>' static bool Case_'+r.id+'()\n {\n'+r.code.map(s=>'  '+s).join('\n')+'\n }').join('\n')+'\n};\n'};}
function mappingHashes(){return Object.fromEntries(['sqf-boolean-locals.js','sqf-expression-ast.js','sqf-structural-ast.js','sqf-migration.js','sqf-source-dependencies.js'].map(f=>[f,sha(fs.readFileSync(path.join(__dirname,f),'utf8').replace(/\r\n/g,'\n'))]));}
async function verification(){try{const proof=JSON.parse(fs.readFileSync(path.join(__dirname,'native-evidence/boolean-locals-v1.json'),'utf8')),f=await fixture();if(proof.mapping!==VERSION||JSON.stringify(proof.moduleSHA256)!==JSON.stringify(mappingHashes())||proof.fixtureSHA256!==sha(f.code)||proof.cases!==f.rows.length||!proof.compiled||!proof.executed||proof.failures!==0)return null;return proof;}catch{return null;}}
async function review(snapshot){
 if(!['types','effects'].includes(snapshot?.profile)||!snapshot.report?.controlContextReview)throw Error('Choose a completed Types or Effects review');
 const files=D.createSourceContext(snapshot.input.files,snapshot.input.mounts||[]).files,reported=new Map(snapshot.report.controlContextReview.files.map(f=>[f.name,f.sha256]));
 if(reported.size!==files.length||files.some(f=>reported.get(f.name)!==sha(f.text)))throw Error('Boolean local source identity mismatch');
 const blocked=D.build(snapshot.input.files,snapshot.input.mounts||[]).directives.length>0,blocks=[],unresolved=[];
 for(const f of files){if(!/\.sqf$/i.test(f.name))continue;try{if(blocked)throw Error('Selected package contains preprocessing directives');const block=await lower(f.name,f.text);blocks.push({file:f.name,sha256:sha(f.text),...block});}catch(e){unresolved.push({file:f.name,reason:e.message});}}
 return {schema:'command-boolean-local-review',version:1,mapping:VERSION,executable:false,sourceExecuted:false,wholeMissionConverted:false,blocks,unresolved,offsetEncoding:'utf16-code-units',sourceHashScope:'decoded-utf8-text',requiredReview:['effective-source-and-external-preprocessing','isolated-scope-and-caller-integration','source-rights-and-attribution','target-engine-version-and-project-integration']};
}
async function attach(scaffold,snapshot){
 const proof=await verification();if(!proof)throw Error('Matching native Boolean local proof is unavailable');const report=await review(snapshot);if(!report.blocks.length)throw Error('No complete supported Boolean local blocks in this review');
 const lines=['// COMMAND — isolated Boolean local blocks. Manual caller/lifecycle integration required.','class COMMAND_BooleanLocalBlocks','{'];
 for(const [i,b]of report.blocks.entries()){lines.push(' static bool Block_'+String(i+1).padStart(4,'0')+'()',' {');for(const row of b.statements){const line=lines.length+1;lines.push('  '+row.target);row.output={path:'Fragments/COMMAND_BooleanLocalBlocks.c',startLine:line,endLine:line};}lines.push(' }');b.tier='green-isolated-boolean-block';b.nativeVerified=true;}
 lines.push('};');report.nativeProof=proof;report.summary={greenIsolatedBlocks:report.blocks.length,localDeclarations:report.blocks.reduce((n,b)=>n+b.bindings.length,0),localAssignments:report.blocks.reduce((n,b)=>n+b.statements.filter(s=>s.kind==='local-assignment').length,0),manualFiles:report.unresolved.length,executionReadyMissions:0};
 scaffold.manifest.booleanLocalBlocks={report:'boolean-local-blocks.json',...report.summary};delete scaffold.manifest.manifestSHA256;scaffold.manifest.manifestSHA256=sha(JSON.stringify(scaffold.manifest));
 const files=scaffold.files.map(f=>f.path==='manifest.json'?{...f,text:JSON.stringify(scaffold.manifest,null,2)+'\n'}:f.path==='MIGRATION-CHECKLIST.md'?{...f,text:f.text+'\n## Optional isolated Boolean local blocks\n\nSee boolean-local-blocks.json. Only complete flat initialized local blocks were lowered. Parent functions, engine hooks and caller/lifecycle integration remain manual.\n'}:f);
 files.push({path:'Fragments/COMMAND_BooleanLocalBlocks.c',text:lines.join('\n')+'\n'},{path:'boolean-local-blocks.json',text:JSON.stringify(report,null,2)+'\n'});return {files,manifest:scaffold.manifest,report};
}
module.exports={VERSION,LIMITS,expression,lower,fixture,mappingHashes,verification,review,attach};
