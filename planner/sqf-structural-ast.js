/* Bounded structural SQF AST. Expressions remain opaque; never executes or lowers source. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./sqf-migration'),require('node:crypto').webcrypto);else root.CompanionSQFAST=factory(root.CompanionSQFMigration,root.crypto);})(globalThis,(S,crypto)=>{
'use strict';
const LIMITS=Object.freeze({files:64,fileBytes:262144,totalBytes:2097152,nodes:10000,findings:1000,bytes:8388608});
const REVIEW=Object.freeze(['expression-types-and-effects','variable-scopes-and-bindings','scheduling-and-locality','native-adapter-semantics','control-flow-lowering']);
const KINDS=['Program','Block','If','ExitWith','While','ForRange','ForCode','ForEach','CodeAssignment','Assignment','CodeLiteral','OpaqueStatement','Unsupported'];
const fail=message=>{throw Error(message);},bytes=s=>new TextEncoder().encode(s).length;
function record(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))fail('Invalid AST record');const d=Object.getOwnPropertyDescriptors(value);if(Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!d[k]||!d[k].enumerable||!('value' in d[k])))fail('Unsupported AST fields');}
function list(value,max){if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>max)fail('AST array limit or shape rejected');const keys=Reflect.ownKeys(value).filter(k=>k!=='length');if(keys.length!==value.length||keys.some(k=>typeof k!=='string'||!/^\d+$/.test(k)||Number(k)>=value.length||!('value' in Object.getOwnPropertyDescriptor(value,k))))fail('Invalid AST array fields');}
function blockers(kind){const result=['semantic-analysis-required'];if(['While','ForRange','ForCode','ForEach'].includes(kind))result.push('loop-runtime-semantics-unresolved');if(kind==='ExitWith')result.push('scope-exit-target-unresolved');if(['CodeAssignment','CodeLiteral'].includes(kind))result.push('code-value-execution-unresolved');if(kind==='OpaqueStatement')result.push('expression-and-command-semantics-unresolved');if(kind==='Unsupported')result.push('unsupported-syntax');return result;}
const summary=doc=>({files:doc.files.length,nodes:doc.nodes.length,blocks:doc.nodes.filter(n=>n.kind==='Block').length,conditionals:doc.nodes.filter(n=>['If','ExitWith'].includes(n.kind)).length,loops:doc.nodes.filter(n=>['While','ForRange','ForCode','ForEach'].includes(n.kind)).length,codeAssignments:doc.nodes.filter(n=>n.kind==='CodeAssignment').length,opaqueStatements:doc.nodes.filter(n=>n.kind==='OpaqueStatement').length,unsupported:doc.nodes.filter(n=>n.kind==='Unsupported').length,findings:doc.findings.length,executionReady:0});
async function sha(text){const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(data)].map(n=>n.toString(16).padStart(2,'0')).join('');}
async function build(rawFiles){
 list(rawFiles,LIMITS.files);if(!rawFiles.length)fail('Select at least one source file');let total=0;const names=new Set(),inputs=[];
 for(const file of rawFiles){record(file,['name','text']);if(typeof file.name!=='string'||!file.name||file.name.length>240||typeof file.text!=='string')fail('Invalid source file');const name=file.name.replace(/\\/g,'/');if(/^[\/]|[:\x00-\x1f\x7f]/.test(name)||name.split('/').some(s=>!s||s==='.'||s==='..')||! /\.(sqf|sqm|ext|hpp)$/i.test(name)||names.has(name.toLowerCase()))fail('Unsafe or duplicate source filename');names.add(name.toLowerCase());const size=bytes(file.text);total+=size;if(size>LIMITS.fileBytes||total>LIMITS.totalBytes)fail('AST source byte limit exceeded');inputs.push({name,text:file.text,size});}
 inputs.sort((a,b)=>a.name.toLowerCase()<b.name.toLowerCase()?-1:1);
 const doc={schema:'command-sqf-structural-ast',version:1,executable:false,syntaxOnly:true,offsetEncoding:'utf16-code-units',requiredReview:[...REVIEW],files:[],nodes:[],findings:[],summary:null};
 for(const input of inputs){
  const {name,text}=input,tokens=S.tokenize(text),pairs=new Map(),stack=[];
  tokens.forEach((token,i)=>{if(token.kind!=='symbol')return;if('[{('.includes(token.value))stack.push(i);else if(']})'.includes(token.value)){const open=stack.pop();pairs.set(open,i);}});
  const source=(a,b)=>({file:name,line:tokens[a]?.line||1,column:tokens[a]?.column||1,start:tokens[a]?.start??0,end:b>a?tokens[b-1].end:(tokens[a]?.start??0)});
  const preview=span=>text.slice(span.start,Math.min(span.end,span.start+160));
  function node(kind,a,b,span=source(a,b)){if(doc.nodes.length>=LIMITS.nodes)fail('AST node limit exceeded');const n={id:'node-'+doc.nodes.length,kind,source:span,preview:preview(span),parts:[],children:[],blockers:blockers(kind)};doc.nodes.push(n);return n;}
  const part=(role,a,b)=>{if(a>=b)fail('Missing structural expression');const span=source(a,b);return {role,source:span,preview:preview(span),semanticStatus:'unresolved'};};
  const word=(i,value)=>tokens[i]?.kind==='word'&&tokens[i].value.toLowerCase()===value;
  const symbol=(i,value)=>tokens[i]?.kind==='symbol'&&tokens[i].value===value;
  const blockEnd=i=>symbol(i,'{')?pairs.get(i):undefined;
  function marker(a,b,words){for(let i=a;i<b;i++){if(tokens[i].kind==='word'&&words.includes(tokens[i].value.toLowerCase()))return i;if(pairs.has(i))i=pairs.get(i);}return -1;}
  function finding(code,n,message){if(doc.findings.length>=LIMITS.findings)fail('AST finding limit exceeded');doc.findings.push({code,nodeId:n.id,source:{...n.source},message});}
  function block(a){const end=blockEnd(a),n=node('Block',a,end+1);sequence(a+1,end,n);return n;}
  const child=(parent,role,n)=>parent.children.push({role,nodeId:n.id});
  function nested(parent,a,b){for(let i=a;i<b;i++)if(symbol(i,'{')){child(parent,'nested-code',block(i));i=pairs.get(i);}}
  function opaque(a,b,unsupported=false){const n=node(unsupported?'Unsupported':'OpaqueStatement',a,b);nested(n,a,b);if(unsupported)finding('UNSUPPORTED_CONTROL_SYNTAX',n,'Control syntax is retained for manual review; no lowering or execution is available.');return n;}
  function statement(a,b){
   if(a>=b)fail('Empty statement range');
   // SQF functions are code-valued assignments, not automatically invoked bodies.
   let lhs=a;if(word(lhs,'private'))lhs++;
   if(tokens[lhs]?.kind==='word'&&symbol(lhs+1,'=')&&!symbol(lhs+2,'=')){
    const rhs=lhs+2;if(rhs>=b)return opaque(a,b,true);
    if(blockEnd(rhs)===b-1){const n=node('CodeAssignment',a,b);n.parts.push(part('target',lhs,lhs+1));child(n,'body',block(rhs));return n;}
    const n=node('Assignment',a,b);n.parts.push(part('target',lhs,lhs+1));
    if(['if','while','for'].some(w=>word(rhs,w)))child(n,'value',statement(rhs,b));else{n.parts.push(part('expression',rhs,b));nested(n,rhs,b);}return n;
   }
   if(word(a,'if')){
    const m=marker(a+1,b,['then','exitwith']);if(m<0||m===a+1||blockEnd(m+1)===undefined)return opaque(a,b,true);
    const end=blockEnd(m+1);let otherwise=-1;
    if(end!==b-1){if(!word(m,'then')||!word(end+1,'else')||blockEnd(end+2)!==b-1)return opaque(a,b,true);otherwise=end+2;}
    const n=node(word(m,'exitwith')?'ExitWith':'If',a,b);n.parts.push(part('condition',a+1,m));child(n,word(m,'exitwith')?'body':'then',block(m+1));if(otherwise>=0)child(n,'else',block(otherwise));return n;
   }
   if(word(a,'while')){const conditionEnd=blockEnd(a+1);if(conditionEnd===undefined||!word(conditionEnd+1,'do')||blockEnd(conditionEnd+2)!==b-1)return opaque(a,b,true);const n=node('While',a,b);child(n,'condition',block(a+1));child(n,'body',block(conditionEnd+2));return n;}
   if(word(a,'for')){
    if(symbol(a+1,'[')){
     const ranges=[];let at=a+2;for(let i=0;i<3;i++){const end=blockEnd(at);if(end===undefined)return opaque(a,b,true);ranges.push(at);at=end+1;if(i<2){if(!symbol(at,','))return opaque(a,b,true);at++;}}
     if(!symbol(at,']')||!word(at+1,'do')||blockEnd(at+2)!==b-1)return opaque(a,b,true);const n=node('ForCode',a,b);['init','condition','update'].forEach((role,i)=>child(n,role,block(ranges[i])));child(n,'body',block(at+2));return n;
    }
    const to=marker(a+3,b,['to']),doAt=marker(a+3,b,['do']),step=marker(to+1,doAt,['step']);
    if(tokens[a+1]?.kind!=='string'||!word(a+2,'from')||to<=a+3||doAt<=to+1||blockEnd(doAt+1)!==b-1||(step>=0&&(step===to+1||step===doAt-1)))return opaque(a,b,true);
    const n=node('ForRange',a,b);n.parts.push(part('counter',a+1,a+2),part('from',a+3,to),part('to',to+1,step<0?doAt:step));if(step>=0)n.parts.push(part('step',step+1,doAt));child(n,'body',block(doAt+1));return n;
   }
   if(symbol(a,'{')){const end=blockEnd(a);if(end===b-1){const n=node('CodeLiteral',a,b);child(n,'code',block(a));return n;}if(word(end+1,'foreach')&&end+2<b){const n=node('ForEach',a,b);n.parts.push(part('iterable',end+2,b));child(n,'body',block(a));return n;}}
   return opaque(a,b,['switch','try','catch','waituntil','foreach','else','then'].some(w=>word(a,w)));
  }
  function sequence(a,b,parent){let at=a;while(at<b){if(symbol(at,';')){at++;continue;}let end=at;while(end<b&&!symbol(end,';')){if(pairs.has(end))end=pairs.get(end);end++;}child(parent,'statement',statement(at,end));at=end+1;}}
  const root=node('Program',0,tokens.length,{file:name,line:1,column:1,start:0,end:text.length});
  const isSQF=/\.sqf$/i.test(name);if(isSQF){sequence(0,tokens.length,root);if(tokens.some(t=>t.kind==='symbol'&&t.value==='#'))finding('PREPROCESSING_UNRESOLVED',root,'Preprocessing was not expanded; all expressions and execution context remain unresolved.');}else finding('CONFIGURATION_ONLY',root,'Configuration files remain inventory-only; no scene graph or configuration AST is reconstructed.');
  doc.files.push({name,textBytes:input.size,textLength:text.length,tokenCount:tokens.length,sha256:await sha(text),hashScope:'decoded-utf8-text',mode:isSQF?'structural-ast':'inventory-only',rootId:root.id});
 }
 doc.summary=summary(doc);return validate(doc);
}
function validate(raw){
 record(raw,['schema','version','executable','syntaxOnly','offsetEncoding','requiredReview','files','nodes','findings','summary']);if(raw.schema!=='command-sqf-structural-ast'||raw.version!==1||raw.executable!==false||raw.syntaxOnly!==true||raw.offsetEncoding!=='utf16-code-units')fail('Expected non-executable structural AST version 1');list(raw.requiredReview,REVIEW.length);if(raw.requiredReview.some(v=>typeof v!=='string'))fail('Invalid AST review gate');if(JSON.stringify(raw.requiredReview)!==JSON.stringify(REVIEW))fail('AST review gates cannot be removed');list(raw.files,LIMITS.files);list(raw.nodes,LIMITS.nodes);list(raw.findings,LIMITS.findings);if(!raw.files.length||!raw.nodes.length)fail('AST package is empty');
 const integer=(n,max)=>{if(!Number.isSafeInteger(n)||n<0||n>max)fail('Invalid AST bound');},text=(v,max)=>{if(typeof v!=='string'||v.length>max)fail('Invalid AST text');};
 const files=new Map(),roots=new Set();let total=0;
 for(const f of raw.files){record(f,['name','textBytes','textLength','tokenCount','sha256','hashScope','mode','rootId']);text(f.name,240);if(!f.name||/^[\/]|[\\:\x00-\x1f\x7f]/.test(f.name)||f.name.split('/').some(s=>!s||s==='.'||s==='..')||! /\.(sqf|sqm|ext|hpp)$/i.test(f.name)||[...files.keys()].some(n=>n.toLowerCase()===f.name.toLowerCase()))fail('Invalid AST filename');integer(f.textBytes,LIMITS.fileBytes);integer(f.textLength,LIMITS.fileBytes);integer(f.tokenCount,S.LIMITS.tokens);total+=f.textBytes;text(f.sha256,64);if(!/^[a-f0-9]{64}$/.test(f.sha256)||f.hashScope!=='decoded-utf8-text'||f.mode!==(/\.sqf$/i.test(f.name)?'structural-ast':'inventory-only')||roots.has(f.rootId))fail('Invalid AST source identity');text(f.rootId,40);files.set(f.name,f);roots.add(f.rootId);}if(total>LIMITS.totalBytes)fail('AST source byte limit exceeded');
 const span=value=>{record(value,['file','line','column','start','end']);const f=files.get(value.file);if(!f)fail('AST references an unknown source');integer(value.start,f.textLength);integer(value.end,f.textLength);integer(value.line,f.textLength+1);integer(value.column,f.textLength+1);if(!value.line||!value.column||value.start>value.end)fail('Invalid AST source span');};
 const contains=(a,b)=>a.file===b.file&&a.start<=b.start&&a.end>=b.end;
 const parents=new Set();
 for(let i=0;i<raw.nodes.length;i++){const n=raw.nodes[i];record(n,['id','kind','source','preview','parts','children','blockers']);if(n.id!=='node-'+i||!KINDS.includes(n.kind))fail('Invalid AST node identity');span(n.source);text(n.preview,160);list(n.parts,6);list(n.children,LIMITS.nodes);list(n.blockers,4);if(n.blockers.some(v=>typeof v!=='string'))fail('Invalid AST semantic blocker');if(JSON.stringify(n.blockers)!==JSON.stringify(blockers(n.kind)))fail('AST semantic blockers cannot be removed');for(const p of n.parts){record(p,['role','source','preview','semanticStatus']);text(p.role,30);span(p.source);text(p.preview,160);if(p.semanticStatus!=='unresolved'||!contains(n.source,p.source))fail('Unverified AST expression');}
  for(const c of n.children){record(c,['role','nodeId']);text(c.role,30);text(c.nodeId,40);const index=Number(c.nodeId.slice(5));if(!/^node-\d+$/.test(c.nodeId)||!Number.isSafeInteger(index)||index<=i||index>=raw.nodes.length||parents.has(c.nodeId)||roots.has(c.nodeId))fail('Invalid, cyclic or multiply owned AST edge');parents.add(c.nodeId);}
 }
 const nodeMap=new Map(raw.nodes.map(n=>[n.id,n]));
 for(const n of raw.nodes){for(const c of n.children){const target=raw.nodes[Number(c.nodeId.slice(5))];if(!contains(n.source,target.source))fail('AST child escapes its parent source range');}if((n.kind==='Program')!==roots.has(n.id)||(!roots.has(n.id)&&!parents.has(n.id)))fail('Disconnected AST node');const roles=n.children.map(c=>c.role),parts=n.parts.map(p=>p.role);let valid=true;
  if(['Program','Block'].includes(n.kind))valid=roles.every(r=>r==='statement')&&!parts.length;
  else if(n.kind==='If')valid=['then','then,else'].includes(roles.join(','))&&parts.join(',')==='condition';
  else if(n.kind==='ExitWith')valid=roles.join(',')==='body'&&parts.join(',')==='condition';
  else if(n.kind==='While')valid=roles.join(',')==='condition,body'&&!parts.length;
  else if(n.kind==='ForRange')valid=roles.join(',')==='body'&&['counter,from,to','counter,from,to,step'].includes(parts.join(','));
  else if(n.kind==='ForCode')valid=roles.join(',')==='init,condition,update,body'&&!parts.length;
  else if(n.kind==='ForEach')valid=roles.join(',')==='body'&&parts.join(',')==='iterable';
  else if(n.kind==='CodeAssignment')valid=roles.join(',')==='body'&&parts.join(',')==='target';
  else if(n.kind==='CodeLiteral')valid=roles.join(',')==='code'&&!parts.length;
  else if(n.kind==='Assignment')valid=(roles.join(',')==='value'&&parts.join(',')==='target')||(roles.every(r=>r==='nested-code')&&parts.join(',')==='target,expression');
  else valid=roles.every(r=>r==='nested-code')&&!parts.length;
  if(!valid)fail('AST node shape does not match its structural kind');
  const blockChildren=['If','ExitWith','While','ForRange','ForCode','ForEach','CodeAssignment','CodeLiteral'];
  if(blockChildren.includes(n.kind)&&n.children.some(c=>nodeMap.get(c.nodeId).kind!=='Block'))fail('AST control body must be a code block');
  if(['Program','Block'].includes(n.kind)&&n.children.some(c=>nodeMap.get(c.nodeId).kind==='Program'))fail('Nested program rejected');
  if(['OpaqueStatement','Unsupported','Assignment'].includes(n.kind)&&n.children.some(c=>c.role==='nested-code'&&nodeMap.get(c.nodeId).kind!=='Block'))fail('Nested code must be a code block');
 }
 for(const f of raw.files){const root=nodeMap.get(f.rootId);if(!root||root.kind!=='Program'||root.source.file!==f.name||root.source.start!==0||root.source.end!==f.textLength||(f.mode==='inventory-only'&&root.children.length))fail('Invalid AST file root');}
 for(const row of raw.findings){record(row,['code','nodeId','source','message']);span(row.source);text(row.message,256);const n=nodeMap.get(row.nodeId);if(!['UNSUPPORTED_CONTROL_SYNTAX','PREPROCESSING_UNRESOLVED','CONFIGURATION_ONLY'].includes(row.code)||!n||!contains(n.source,row.source))fail('Invalid AST finding');}
 record(raw.summary,Object.keys(summary(raw)));for(const value of Object.values(raw.summary))integer(value,LIMITS.nodes);if(JSON.stringify(raw.summary)!==JSON.stringify(summary(raw)))fail('Inconsistent AST summary');const serialized=JSON.stringify(raw);if(bytes(serialized)>LIMITS.bytes)fail('AST report byte limit exceeded');return JSON.parse(serialized);
}
return {LIMITS,REVIEW,build,validate};
});
