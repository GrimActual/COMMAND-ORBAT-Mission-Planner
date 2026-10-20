/* Conservative source binding evidence. No execution, type inference or closure conversion. */
'use strict';
const AST=require('./sqf-structural-ast'),S=require('./sqf-migration'),{captureSources}=require('./sqf-expression-ast');
const LIMITS=Object.freeze({scopes:10000,declarations:10000,references:20000,candidateEdges:20000,findings:2000,bytes:8388608});
const local=name=>typeof name==='string'&&/^_[A-Za-z0-9_]+$/.test(name);
const canonical=name=>name.toLowerCase();
async function inspect(raw){
 const files=captureSources(raw),ast=await AST.build(files),texts=new Map(files.map(f=>[f.name.replace(/\\/g,'/'),f.text]));
 const report={schema:'command-sqf-binding-review',version:1,executable:false,evidenceLevel:'syntactic-candidates-only',offsetEncoding:'utf16-code-units',files:ast.files.map(f=>({...f})),scopes:[],declarations:[],references:[],findings:[],requiredReview:['dynamic-scope-and-call-context','types-and-definite-initialization','callback-lifetime-and-locality','native-adapter-semantics'],summary:{scopes:0,declarations:0,references:0,candidateReferences:0,unresolvedReferences:0,findings:0,executionReady:0}};
 const add=(key,row)=>{if(report[key].length>=LIMITS[key])throw Error('Binding '+key+' limit exceeded');report[key].push(row);return row;};
 const finding=(code,source,message)=>add('findings',{code,source:{...source},message});
 const parents=new Map(),nodes=new Map(ast.nodes.map(n=>[n.id,n])),scopeByNode=new Map(),scopeMap=new Map();
 for(const n of ast.nodes)for(const edge of n.children)parents.set(edge.nodeId,{nodeId:n.id,role:edge.role});
 function parentScope(id){let edge=parents.get(id);while(edge){if(scopeByNode.has(edge.nodeId))return scopeByNode.get(edge.nodeId);edge=parents.get(edge.nodeId);}return null;}
 for(const n of ast.nodes){if(!['Program','Block'].includes(n.kind))continue;if(ast.files.find(f=>f.name===n.source.file).mode!=='structural-ast')continue;
  const edge=parents.get(n.id),owner=edge?nodes.get(edge.nodeId):null,parentId=parentScope(n.id);
  let boundary=n.kind==='Program'?'file-context':'control-block',inherit=!!parentId;
  if(owner&&['CodeAssignment','CodeLiteral'].includes(owner.kind)){boundary='stored-code-context';inherit=false;}
  else if(edge?.role==='nested-code'||owner?.kind==='Unsupported'){boundary='unresolved-code-context';inherit=false;}
  const scope=add('scopes',{id:'scope-'+report.scopes.length,nodeId:n.id,parentId,source:{...n.source},boundary,inheritanceCandidate:inherit,contextResolved:false,scopeMutationCommands:[]});scopeByNode.set(n.id,scope.id);scopeMap.set(scope.id,scope);
  if(!inherit&&parentId)finding('CODE_CONTEXT_BOUNDARY',n.source,'Caller/event/scheduler context is not resolved; outer local bindings are not captured automatically.');
 }
 const declarationsByScope=new Map(report.scopes.map(s=>[s.id,new Map()])),declarationTokenStarts=new Map();
 function declare(scopeId,name,kind,source,availableAfter,detail={}){
  const map=declarationsByScope.get(scopeId),key=canonical(name),prior=map.get(key)||[];
  const d=add('declarations',{id:'binding-'+report.declarations.length,scopeId,name,canonicalName:key,kind,source:{...source},availableAfter,...detail,typeResolved:false,initializationResolved:false});prior.push(d);map.set(key,prior);
  if(prior.length>1)finding('REDECLARATION_REQUIRES_REVIEW',source,'Repeated declarations in one code scope require source execution/initialization review.');return d;
 }
 const tokenData=new Map();
 for(const file of ast.files){if(file.mode!=='structural-ast')continue;
  const recognizedPrivate=new Set(),recognizedParams=new Set();
  const tokens=S.tokenize(texts.get(file.name)),pairs=new Map(),stack=[];
  tokens.forEach((t,i)=>{if(t.kind!=='symbol')return;if('[{('.includes(t.value))stack.push(i);else if(']})'.includes(t.value))pairs.set(stack.pop(),i);});
  const scopes=report.scopes.filter(s=>s.source.file===file.name).sort((a,b)=>a.source.start-b.source.start||b.source.end-a.source.end),tokenScopes=new Map();let next=0;const active=[];
  for(const token of tokens){while(next<scopes.length&&scopes[next].source.start<=token.start){const s=scopes[next++];while(active.length&&active.at(-1).source.end<=s.source.start)active.pop();active.push(s);}while(active.length&&active.at(-1).source.end<=token.start)active.pop();if(active.length)tokenScopes.set(token.start,active.at(-1).id);}
  const span=(a,b)=>({file:file.name,line:tokens[a]?.line||1,column:tokens[a]?.column||1,start:tokens[a]?.start??0,end:tokens[b-1]?.end??0});
  const lowerBound=start=>{let lo=0,hi=tokens.length;while(lo<hi){const mid=(lo+hi)>>1;if(tokens[mid].start<start)lo=mid+1;else hi=mid;}return lo;};
  const ranges=(open,close)=>{const out=[];let start=open+1;for(let i=start;i<close;i++){if(tokens[i].kind==='symbol'&&tokens[i].value===','){out.push([start,i]);start=i+1;}else if(pairs.has(i))i=pairs.get(i);}if(start<close)out.push([start,close]);else if(out.length)throw Error('Trailing declaration item');return out;};
  const literalNames=(a,b)=>{if(b===a+1&&tokens[a]?.kind==='string'&&local(tokens[a].value))return [{name:tokens[a].value,span:span(a,b)}];if(tokens[a]?.value==='['&&pairs.get(a)===b-1)return ranges(a,b-1).map(([x,y])=>{if(y!==x+1||tokens[x].kind!=='string'||!local(tokens[x].value))throw Error('Dynamic/invalid private name');return {name:tokens[x].value,span:span(x,y)};});throw Error('Dynamic/invalid private declaration');};
  for(const n of ast.nodes){if(n.source.file!==file.name||['Program','Block'].includes(n.kind))continue;const a=lowerBound(n.source.start),b=lowerBound(n.source.end),scopeId=tokenScopes.get(tokens[a]?.start);if(!scopeId)continue;
   const first=tokens[a],word=first?.kind==='word'?first.value.toLowerCase():null;
   if(word==='private'){
    try{if(['Assignment','CodeAssignment'].includes(n.kind)&&tokens[a+1]?.kind==='word'&&local(tokens[a+1].value)){
      const t=tokens[a+1];declare(scopeId,t.value,'private-initializer',span(a+1,a+2),n.source.end,{initializer:{...n.source}});if(!declarationTokenStarts.has(file.name))declarationTokenStarts.set(file.name,new Set());declarationTokenStarts.get(file.name).add(t.start);
     }else for(const item of literalNames(a+1,b))declare(scopeId,item.name,'private-name',item.span,n.source.end);recognizedPrivate.add(first.start);
    }catch(error){if(/limit exceeded$/.test(error.message))throw error;scopeMap.get(scopeId).scopeMutationCommands.push({name:'dynamic-private',offset:n.source.start});finding('UNRESOLVED_PRIVATE_DECLARATION',n.source,'Only literal private names and simple private initializers are recognized.');}
   }
   let nestedParams=false;for(let i=a;i<b;i++){if(pairs.has(i)){i=pairs.get(i);continue;}if(tokens[i].kind==='word'&&tokens[i].value.toLowerCase()==='params')nestedParams=true;}
   if(word!=='params'&&nestedParams){scopeMap.get(scopeId).scopeMutationCommands.push({name:'unresolved-params-source',offset:n.source.start});finding('UNRESOLVED_PARAMS_SOURCE',n.source,'Binary or nested params input requires a resolved source expression and invocation context.');}
   if(word==='params'){
    try{const open=a+1,close=pairs.get(open);if(tokens[open]?.value!=='['||close!==b-1)throw Error('Unsupported params source');
     const descriptors=ranges(open,close).map(([x,y],index)=>{
      if(y===x+1&&tokens[x].kind==='string'){if(tokens[x].value==='')return null;if(!local(tokens[x].value))throw Error('Invalid parameter name');return {name:tokens[x].value,source:span(x,x+1),index,defaultSource:null,allowedTypesSource:null,arrayCountSource:null};}
      if(tokens[x].value!=='['||pairs.get(x)!==y-1)throw Error('Dynamic parameter descriptor');const fields=ranges(x,y-1);if(fields.length<2||fields.length>4)throw Error('Invalid parameter descriptor arity');const [start,end]=fields[0];if(end!==start+1||tokens[start].kind!=='string'||!local(tokens[start].value))throw Error('Invalid parameter name');return {name:tokens[start].value,source:span(start,end),index,defaultSource:span(...fields[1]),allowedTypesSource:fields[2]?span(...fields[2]):null,arrayCountSource:fields[3]?span(...fields[3]):null};
     });
     for(const d of descriptors.filter(Boolean)){const {name,source,...detail}=d;declare(scopeId,name,'parameter',source,n.source.end,{argumentSource:'implicit-_this-unresolved',...detail});}recognizedParams.add(first.start);
    }catch(error){if(/limit exceeded$/.test(error.message))throw error;scopeMap.get(scopeId).scopeMutationCommands.push({name:'dynamic-params',offset:n.source.start});finding('UNRESOLVED_PARAMS_DECLARATION',n.source,'Only unary params with literal names/descriptors is recognized; no parameter types/defaults are evaluated.');}
   }
  }
  // Introduce loop names as syntactic candidates, not values or executable semantics.
  for(const n of ast.nodes){if(n.source.file!==file.name)continue;const body=n.children.find(c=>c.role==='body'),scopeId=body&&scopeByNode.get(body.nodeId);if(!scopeId)continue;
   if(n.kind==='ForEach')for(const name of ['_x','_forEachIndex'])declare(scopeId,name,'implicit-forEach',n.source,scopeMap.get(scopeId).source.start);
   if(n.kind==='ForRange'){const p=n.parts.find(p=>p.role==='counter'),a=lowerBound(p.source.start);if(tokens[a]?.kind==='string'&&local(tokens[a].value))declare(scopeId,tokens[a].value,'range-counter',p.source,scopeMap.get(scopeId).source.start);else finding('UNRESOLVED_LOOP_COUNTER',n.source,'Range counter name is not a supported literal local identifier.');}
  }
  for(const token of tokens){const scopeId=tokenScopes.get(token.start),scope=scopeMap.get(scopeId);if(!scope)continue;
   if(token.kind==='word'&&(['private','params'].includes(token.value.toLowerCase()))&&!(token.value.toLowerCase()==='private'?recognizedPrivate:recognizedParams).has(token.start)&&!scope.scopeMutationCommands.some(c=>c.offset===token.start)){scope.scopeMutationCommands.push({name:'unresolved-'+token.value.toLowerCase()+'-context',offset:token.start});finding('UNRESOLVED_DECLARATION_CONTEXT',{file:file.name,line:token.line,column:token.column,start:token.start,end:token.end},'Declaration used outside the supported statement form prevents binding resolution in this context.');}
   if(token.kind==='symbol'&&token.value==='#'){scope.scopeMutationCommands.push({name:'#',offset:token.start});finding('PREPROCESSING_BINDINGS_UNRESOLVED',{file:file.name,line:token.line,column:token.column,start:token.start,end:token.end},'Preprocessing may change declarations and scopes; source binding candidates are not executable proof.');}
   if(token.kind==='word'&&['privateall','import','compile','compilescript','execvm'].includes(token.value.toLowerCase())){scope.scopeMutationCommands.push({name:token.value,offset:token.start});finding('DYNAMIC_SCOPE_OPERATION',{file:file.name,line:token.line,column:token.column,start:token.start,end:token.end},'Dynamic code or scope mutation prevents binding resolution in this code context.');}
  }
  tokenData.set(file.name,{tokens,tokenScopes});
 }
 let candidateEdges=0;
 for(const [file,{tokens,tokenScopes}] of tokenData){for(let i=0;i<tokens.length;i++){
  const token=tokens[i];if(token.kind!=='word'||!local(token.value)||declarationTokenStarts.get(file)?.has(token.start))continue;
  const scopeId=tokenScopes.get(token.start),key=canonical(token.value);let current=scopeMap.get(scopeId),candidates=[],status='unresolved-source-context';
  while(current){if(current.scopeMutationCommands.length){status='unresolved-dynamic-scope';break;}
   const all=declarationsByScope.get(current.id).get(key)||[];
   if(all.some(d=>d.initializer&&d.initializer.start<=token.start&&token.end<=d.initializer.end)){status='unresolved-initializer-binding';break;}
   const prior=all.filter(d=>d.availableAfter<=token.start);if(prior.length){candidates=prior.map(d=>d.id);status=prior.length===1?'syntactic-declaration-candidate':'ambiguous-redeclaration';break;}
   if(!current.inheritanceCandidate){status=current.parentId?'unresolved-code-context':'unresolved-source-context';break;}current=scopeMap.get(current.parentId);
  }
  candidateEdges+=candidates.length;if(candidateEdges>LIMITS.candidateEdges)throw Error('Binding candidate edge limit exceeded');
  const write=tokens[i+1]?.kind==='symbol'&&tokens[i+1].value==='='&&tokens[i+2]?.value!=='=';
  add('references',{id:'reference-'+report.references.length,scopeId,name:token.value,canonicalName:key,usage:write?'write':'read-or-command-operand',source:{file,line:token.line,column:token.column,start:token.start,end:token.end},status,candidateBindingIds:candidates,bindingResolved:false});
 }}
 report.summary={scopes:report.scopes.length,declarations:report.declarations.length,references:report.references.length,candidateReferences:report.references.filter(r=>r.status==='syntactic-declaration-candidate').length,unresolvedReferences:report.references.filter(r=>r.status!=='syntactic-declaration-candidate').length,findings:report.findings.length,executionReady:0};
 if(Buffer.byteLength(JSON.stringify(report),'utf8')>LIMITS.bytes)throw Error('Binding report byte limit exceeded');return {report,structure:ast,files};
}
async function build(raw){return (await inspect(raw)).report;}
module.exports={LIMITS,build,inspect};
