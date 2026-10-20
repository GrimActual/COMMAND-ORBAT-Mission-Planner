/* Read-only SQF migration reconnaissance. Never evaluates source or emits executable requests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CompanionSQFMigration=factory();})(typeof globalThis==='object'?globalThis:this,()=>{
'use strict';
const LIMITS=Object.freeze({files:64,fileBytes:262144,totalBytes:2097152,tokens:50000,findings:2000,depth:64});
const MOVE='{750A8D1695BD6998}Prefabs/AI/Waypoints/AIWaypoint_Move.et';
const rules={
 domove:['movement','candidate','ai-move',MOVE,'Arma 3 individual movement differs from the Companion group waypoint; resolve target group and terrain first.'],
 addwaypoint:['waypoint','candidate','ai-move',MOVE,'Waypoint type, ordering, conditions and statements require review; route execution is not implied.'],
 createunit:['spawn','needs-asset-map','spawn',null,'Arma 3 class names require an explicit reviewed addon/GUID/prefab mapping; init scripts are not executed.'],
 createvehicle:['spawn','needs-asset-map','spawn',null,'Vehicle classes and crew/placement semantics require explicit mapping.'],
 dostop:['movement','manual',null,null,'doStop is not equivalent to cancellation of a Companion-owned waypoint.'],
 setwaypointtype:['waypoint','manual',null,null,'MOVE/HOLD/SAD/GUARD and other waypoint semantics are not automatically interchangeable.'],
 setformation:['formation','manual',null,null,'Resolve a verified native formation identifier; never copy the SQF string blindly.'],
 setunitpos:['stance','manual',null,null,'Needs an explicit native stance adapter.'],
 setcombatmode:['fire-control','manual',null,null,'Strict Hold Fire equivalence has not been verified.'],
 setbehaviour:['behaviour','manual',null,null,'Behaviour modes are not behaviour-tree resource paths.'],
 setbehaviourstrong:['behaviour','manual',null,null,'Needs explicit native behaviour mapping.'],
 moveincargo:['transport','manual',null,null,'Resolve vehicle identity, seat availability and native transport adapter.'],
 moveindriver:['transport','manual',null,null,'Resolve vehicle identity and native crew adapter.'],
 ordergetin:['transport','manual',null,null,'Needs native boarding workflow.'],
 setdamage:['health','manual',null,null,'Health values and native damage/medical components differ.'],
 setpos:['transform','manual',null,null,'Terrain, coordinate space and placement policy require review.'],
 setposasl:['transform','manual',null,null,'ASL elevation requires explicit target-terrain conversion.'],
 setposatl:['transform','manual',null,null,'ATL elevation requires explicit target-terrain conversion.'],
 setdir:['transform','manual',null,null,'Resolve heading convention and target entity.'],
 deletevehicle:['removal','manual',null,null,'Native removal must preserve ownership; arbitrary deletion is not translated.'],
 execvm:['script','manual',null,null,'Dependency is inventoried only; SQF cannot execute in Enfusion.'],
 call:['script','manual',null,null,'Function resolution and side effects require review.'],
 spawn:['script','manual',null,null,'SQF scheduled execution requires an explicit lifecycle adapter.'],
 compile:['dynamic-code','manual',null,null,'Dynamic code cannot be translated by this static inspection.'],
 compilefinal:['dynamic-code','manual',null,null,'Dynamic code requires manual review.'],
 remoteexec:['network','manual',null,null,'Locality, authority and permissions require an explicit server adapter.'],
 remoteexeccall:['network','manual',null,null,'Locality and authority cannot be inferred.'],
 addeventhandler:['event','manual',null,null,'Events and handler lifetimes require native component mapping.'],
 waituntil:['control-flow','manual',null,null,'Condition and scheduling semantics are not lowered.'],
 sleep:['control-flow','manual',null,null,'Scheduling semantics are not lowered.']
};
function fail(message){throw new Error(message);}
const bytes=s=>new TextEncoder().encode(s).length;
function tokenize(text){
 const out=[];let i=0,line=1,column=1,stack=[];
 const advance=()=>{const c=text.charAt(i);i+=1;if(c==='\n'){line++;column=1;}else column++;return c;};
 const push=(kind,value,l,c,start)=>{out.push({kind,value,line:l,column:c,start,end:i});if(out.length>LIMITS.tokens)fail('Token limit exceeded');};
 while(i<text.length){let c=text[i];if(/\s/.test(c)){advance();continue;}
  if(text.slice(i,i+2)==='//'){while(i<text.length&&text[i]!=='\n')advance();continue;}
  if(text.slice(i,i+2)==='/*'){advance();advance();let closed=false;while(i<text.length){if(text.slice(i,i+2)==='*/'){advance();advance();closed=true;break;}advance();}if(!closed)fail('Unclosed comment');continue;}
  const l=line,col=column,start=i;
  if(c==='"'||c==="'"){const quote=c;advance();let value='',closed=false;while(i<text.length){const character=text.charAt(i);advance();if(character!==quote){value+=character;continue;}if(text.charAt(i)===quote){advance();value+=quote;continue;}closed=true;break;}if(!closed)fail('Unclosed string at '+l+':'+col);push('string',value,l,col,start);continue;}
  if(/[A-Za-z_]/.test(c)){let value='';while(i<text.length&&/[A-Za-z0-9_]/.test(text[i]))value+=advance();push('word',value,l,col,start);continue;}
  if(/[0-9]/.test(c)||c==='-'&&/[0-9]/.test(text[i+1]||'')){let value='';while(i<text.length&&/[0-9.eE+\-]/.test(text[i]))value+=advance();push('number',value,l,col,start);continue;}
  if('[{('.includes(c)){stack.push(c);if(stack.length>LIMITS.depth)fail('Nesting limit exceeded');}
  if(']})'.includes(c)&&stack.pop()!==({']':'[','}':'{',')':'('})[c])fail('Unbalanced delimiters');
  push('symbol',advance(),l,col,start);
 }
 if(stack.length)fail('Unclosed delimiter');return out;
}
function vector(ts,index){if(ts[index]?.value!=='[')return null;const values=[];let j=index+1;for(let n=0;n<3;n++){if(ts[j]?.kind!=='number')return null;const v=Number(ts[j++].value);if(!Number.isFinite(v))return null;values.push(v);if(n<2){if(ts[j++]?.value!==',')return null;}}if(ts[j]?.value!==']')return null;return {sourceXYZ:values,proposedEnfusionXYZ:[values[0],values[2],values[1]],terrainValidated:false};}
function analyze(files){
 if(!Array.isArray(files)||files.length<1||files.length>LIMITS.files)fail('Select 1–64 files');
 let total=0;const names=new Set(),report={schema:'command-sqf-migration-review',version:1,executable:false,scope:'Static lexical reconnaissance only; not a complete SQF/SQM parser or transpiler.',files:[],findings:[],classNames:[],dependencies:[],gates:['Explicit asset mapping','Source/target terrain alignment','Authority and lifecycle review','Control-flow and script review','Native validation before execution']};
 const add=row=>{if(report.findings.length>=LIMITS.findings)fail('Finding limit exceeded');report.findings.push(row);};
 for(const file of files){
  if(!file||typeof file.name!=='string'||typeof file.text!=='string')fail('Invalid selected file');
  const name=file.name.replace(/\\/g,'/');if(name.length>240||/^[\/]|^[A-Za-z]:|[\x00-\x1f]/.test(name)||name.split('/').some(x=>!x||x==='.'||x==='..'))fail('Unsafe relative filename');
  if(!/\.(sqf|sqm|ext|hpp)$/i.test(name))fail('Only SQF, SQM, EXT and HPP text files are supported');
  if(names.has(name.toLowerCase()))fail('Duplicate filename');names.add(name.toLowerCase());
  const size=bytes(file.text);total+=size;if(size>LIMITS.fileBytes||total>LIMITS.totalBytes)fail('File size limit exceeded');
  const ts=tokenize(file.text);report.files.push({name,bytes:size,tokens:ts.length,mode:/\.sqf$/i.test(name)?'command-inventory':'configuration-inventory'});
  for(let i=0;i<ts.length;i++){
   const token=ts[i],word=token.value.toLowerCase();
   if(token.value==='#'){add({file:name,line:token.line,column:token.column,source:'#'+(ts[i+1]?.value||''),status:'manual',family:'preprocessor',reason:'Macros/includes are not expanded; review preprocessing before translation.'});if(ts[i+1]?.value.toLowerCase()==='include'&&ts[i+2]?.kind==='string')report.dependencies.push({file:name,line:token.line,reference:ts[i+2].value,resolution:'selected-file-only'});}
   if(token.kind!=='word')continue;
   if(!/\.sqf$/i.test(name)){if(word==='type'&&ts[i+1]?.value==='='&&ts[i+2]?.kind==='string')report.classNames.push({file:name,line:token.line,className:ts[i+2].value,status:'unmapped'});continue;}
   const rule=rules[word];if(!rule){if(/_fnc_/i.test(token.value))add({file:name,line:token.line,column:token.column,source:token.value,status:'manual',family:'function',reason:'Custom/BIS function implementation is unresolved.'});continue;}
   const [family,status,intent,binding,reason]=rule,row={file:name,line:token.line,column:token.column,source:token.value,family,status,intent,binding,reason,executionReady:false};
   if(word==='domove')row.position=vector(ts,i+1);
   if(word==='addwaypoint')row.position=vector(ts,i+2);
   if(['createunit','createvehicle'].includes(word)){const value=ts[i+1]?.value==='['&&ts[i+2]?.kind==='string'?ts[i+2].value:ts[i-1]?.kind==='string'?ts[i-1].value:null;row.className=value;if(value)report.classNames.push({file:name,line:token.line,className:value,status:'unmapped'});}
   if(word==='execvm'&&ts[i+1]?.kind==='string')report.dependencies.push({file:name,line:token.line,reference:ts[i+1].value,resolution:'selected-file-only'});
   add(row);
  }
 }
 for(const dep of report.dependencies){const base=dep.file.split('/').slice(0,-1).join('/');const ref=dep.reference.replace(/\\/g,'/');dep.selected=names.has((base?base+'/':'') .concat(ref).toLowerCase());}
 report.summary={files:files.length,bytes:total,findings:report.findings.length,candidates:report.findings.filter(r=>r.status==='candidate').length,manual:report.findings.filter(r=>r.status!=='candidate').length,unmappedClasses:report.classNames.length};
 return report;
}

function validateReport(raw){
 function record(obj,keys){if(!obj||typeof obj!=='object'||Array.isArray(obj)||![Object.prototype,null].includes(Object.getPrototypeOf(obj)))fail('Invalid review record');for(const key of Reflect.ownKeys(obj)){const d=Object.getOwnPropertyDescriptor(obj,key);if(typeof key!=='string'||!keys.includes(key)||!d.enumerable||!('value' in d))fail('Unexpected review field');}}
 const str=(v,n=1024)=>{if(typeof v!=='string'||v.length>n)fail('Invalid review text');};
 const count=(v,max)=>{if(!Number.isSafeInteger(v)||v<0||v>max)fail('Invalid review count');};
 const list=(v,max)=>{if(!Array.isArray(v)||v.length>max)fail('Invalid review list');};
 record(raw,['schema','version','executable','scope','files','findings','classNames','dependencies','gates','summary']);
 if(raw.schema!=='command-sqf-migration-review'||raw.version!==1||raw.executable!==false)fail('Review must be non-executable version 1');str(raw.scope);
 list(raw.files,64);if(!raw.files.length)fail('Review has no files');const names=new Set();let total=0;
 for(const f of raw.files){record(f,['name','bytes','tokens','mode']);str(f.name,240);if(names.has(f.name)||/^[\/]|^[A-Za-z]:|[\x00-\x1f]/.test(f.name)||f.name.split('/').some(x=>!x||x==='.'||x==='..'))fail('Invalid review filename');names.add(f.name);count(f.bytes,LIMITS.fileBytes);total+=f.bytes;count(f.tokens,LIMITS.tokens);if(!['command-inventory','configuration-inventory'].includes(f.mode))fail('Invalid review mode');}
 if(total>LIMITS.totalBytes)fail('Review source limit exceeded');
 const location=row=>{str(row.file,240);if(!names.has(row.file))fail('Review references an unselected file');count(row.line,LIMITS.fileBytes+1);if(!row.line)fail('Invalid source line');};
 list(raw.findings,LIMITS.findings);
 for(const row of raw.findings){record(row,['file','line','column','source','family','status','intent','binding','reason','executionReady','position','className']);location(row);count(row.column,LIMITS.fileBytes+1);str(row.source,160);str(row.family,80);str(row.reason);if(!['candidate','manual','needs-asset-map'].includes(row.status))fail('Invalid finding status');if('executionReady' in row&&row.executionReady!==false)fail('Executable finding rejected');if('binding' in row&&row.binding!==null&&row.binding!==MOVE)fail('Unknown native binding');if('intent' in row&&![null,'ai-move','spawn'].includes(row.intent))fail('Unknown migration intent');if(row.className!==undefined&&row.className!==null)str(row.className,LIMITS.fileBytes);if(row.position!==undefined&&row.position!==null){record(row.position,['sourceXYZ','proposedEnfusionXYZ','terrainValidated']);for(const v of [row.position.sourceXYZ,row.position.proposedEnfusionXYZ]){list(v,3);if(v.length!==3||v.some(n=>!Number.isFinite(n)))fail('Invalid review coordinate');}if(row.position.terrainValidated!==false)fail('Unverified terrain claim');const v=row.position.sourceXYZ;if(JSON.stringify(row.position.proposedEnfusionXYZ)!==JSON.stringify([v[0],v[2],v[1]]))fail('Invalid proposed axis mapping');}}
 list(raw.classNames,LIMITS.tokens*64);for(const row of raw.classNames){record(row,['file','line','className','status']);location(row);str(row.className,LIMITS.fileBytes);if(row.status!=='unmapped')fail('Unverified asset mapping');}
 list(raw.dependencies,LIMITS.findings);for(const row of raw.dependencies){record(row,['file','line','reference','resolution','selected']);location(row);str(row.reference,LIMITS.fileBytes);if(row.resolution!=='selected-file-only'||typeof row.selected!=='boolean')fail('Invalid dependency review');}
 list(raw.gates,10);for(const gate of raw.gates)str(gate);record(raw.summary,['files','bytes','findings','candidates','manual','unmappedClasses']);
 const expected={files:raw.files.length,bytes:total,findings:raw.findings.length,candidates:raw.findings.filter(r=>r.status==='candidate').length,manual:raw.findings.filter(r=>r.status!=='candidate').length,unmappedClasses:raw.classNames.length};if(JSON.stringify(raw.summary)!==JSON.stringify(expected))fail('Inconsistent review summary');
 const text=JSON.stringify(raw);if(bytes(text)>8388608)fail('Review export limit exceeded');return JSON.parse(text);
}
return {LIMITS,MOVE,analyze,validateReport,tokenize};
});
