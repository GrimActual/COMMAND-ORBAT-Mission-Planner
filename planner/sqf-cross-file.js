/* Lexical function-write/name evidence only. No execution, namespace binding, flow or order inference. */
'use strict';
const D=require('./sqf-source-dependencies'),R=require('./sqf-function-registrations'),crypto=require('node:crypto');
const LIMITS=Object.freeze({writes:8192,operations:8192,symbols:8192,findings:4096,candidateReferences:16384,nameCharacters:512,reportBytes:16777216});
const REVIEW=Object.freeze(['complete-source-and-preprocessing-context','namespace-and-private-scope-resolution','cross-file-load-order-and-runtime-writes','code-types-effects-lifetime-and-locality','typed-control-flow-ir','native-adapter-and-behavior-validation']);
const NAMESPACES=Object.freeze({missionnamespace:'mission',uinamespace:'ui',profilenamespace:'profile',parsingnamespace:'parsing'});
const DYNAMIC=new Set(['compile','compilefinal','compilescript','preprocessfile','preprocessfilelinenumbers','execvm','loadfile']);
const SCOPE=new Set(['private','privateall','params','with','import','publicvariable','publicvariableserver','publicvariableclient']);
const isName=name=>typeof name==='string'&&name.length<=LIMITS.nameCharacters&&/^[A-Za-z_][A-Za-z0-9_]*_fnc_[A-Za-z0-9_]+$/i.test(name);
const fail=message=>{throw Error(message);};
function build(raw,mounts=[],configRoots=[]){
 const context=D.createSourceContext(raw,mounts),{report:registrationReview,scans}=R.inspect(context.files.map(({name,text})=>({name,text})),context.mounts.map(m=>({...m})),configRoots);
 const writes=[],operations=[],coverage=[],findings=[],sourceIdentityCounts=new Map();let references=0;
 for(const file of context.files){const key=file.name.toLowerCase();sourceIdentityCounts.set(key,(sourceIdentityCounts.get(key)||0)+1);}
 const add=(list,limit,row)=>{if(list.length>=limit)fail('Cross-file inventory limit exceeded');list.push(row);return row;};
 const finding=(code,source,detail)=>add(findings,LIMITS.findings,{code,source,detail});
 const charge=count=>{references+=count;if(references>LIMITS.candidateReferences)fail('Cross-file candidate reference limit exceeded');};
 for(const file of context.files){
  if(!/\.sqf$/i.test(file.name))continue;
  const scanned=scans.get(file.name),identityAmbiguous=sourceIdentityCounts.get(file.name.toLowerCase())>1;
  if(identityAmbiguous)finding('CASE_COLLIDING_SOURCE_IDENTITY',{file:file.name,start:0,end:0,line:1,column:1},'Supplied source owners differ only by case; no owner selection is inferred.');
  if(!scanned){coverage.push({file:file.name,status:'source-syntax-unresolved',writes:0,operations:0,skippedLocalWrites:0,preprocessingUnresolved:true,identityAmbiguous});continue;}
  const {tokens,pairs}=scanned,beforeWrites=writes.length,beforeOperations=operations.length;
  let braceDepth=0,skippedLocalWrites=0;
  const span=(a,b)=>({file:file.name,start:tokens[a]?.start??0,end:tokens[b-1]?.end??tokens[a]?.end??0,line:tokens[a]?.line||1,column:tokens[a]?.column||1});
  const valueKind=(a,b)=>tokens[a]?.value==='{'&&pairs.get(a)===b-1?'code-literal-candidate':tokens.slice(a,b).some(t=>t.kind==='word'&&DYNAMIC.has(t.value.toLowerCase()))?'dynamic-code-or-source':'unmodeled-value';
  const operation=(i,kind,detail)=>add(operations,LIMITS.operations,{id:'operation-'+operations.length,command:tokens[i].value.toLowerCase(),kind,source:span(i,i+1),detail,effectResolved:false});
  const write=(name,a,b,rhsA,rhsB,form,namespace,broadcast)=>{
   if(form==='direct-assignment'&&name.startsWith('_')){skippedLocalWrites++;return;}
   add(writes,LIMITS.writes,{id:'write-'+writes.length,nameCandidate:name,canonicalName:name.toLowerCase(),source:span(a,b),valueSource:span(rhsA,rhsB),form,namespace,broadcast,valueKind:valueKind(rhsA,rhsB),lexicalBraceDepth:braceDepth,activation:'not-evaluated',bindingResolved:false,executionReady:false});
  };
  for(let i=0;i<tokens.length;i++){
   const t=tokens[i];if(t.kind==='symbol'){if(t.value==='{')braceDepth++;else if(t.value==='}')braceDepth--;continue;}if(t.kind!=='word')continue;
   const word=t.value.toLowerCase();
   if(DYNAMIC.has(word))operation(i,'dynamic-code-or-source','Lexical occurrence only; generated code and its writes are not inspected or executed.');
   if(SCOPE.has(word))operation(i,'scope-or-locality-unresolved','Private/caller/namespace/network context needs later semantic analysis.');
   if(isName(t.value)&&tokens[i+1]?.value==='='&&tokens[i+2]?.value!=='='&&!['=','!','<','>'].includes(tokens[i-1]?.value)){
    if(tokens[i-1]?.kind==='word'&&tokens[i-1].value.toLowerCase()==='private'){skippedLocalWrites++;continue;}
    let end=i+2;
    // Preserve a bounded RHS span without interpreting/evaluating its expression.
    while(end<tokens.length&&![';','}',']',')'].includes(tokens[end].value)){if(pairs.has(end))end=pairs.get(end)+1;else end++;}
    if(end===i+2){operation(i,'unresolved-write-form','Assignment-like tokens have no supported RHS.');continue;}
    write(t.value,i,i+1,i+2,end,'direct-assignment','implicit-unresolved','not-present');
   }
   if(word!=='setvariable')continue;
   const open=i+1,close=pairs.get(open);
   if(tokens[open]?.value!=='['||close===undefined){operation(i,'unresolved-namespace-write','Only a literal setVariable argument array can provide a named write candidate.');continue;}
   const args=[];let start=open+1;
   for(let at=start;at<close;at++){if(tokens[at].value===','){args.push([start,at]);start=at+1;}else if(pairs.has(at))at=pairs.get(at);}
   args.push([start,close]);const key=args[0];
   if(args.length<2||args.length>3||args.some(([a,b])=>a===b)||key[1]!==key[0]+1||tokens[key[0]]?.kind!=='string'){operation(i,'unresolved-namespace-write','Computed/nonliteral keys or unsupported argument shapes may hide function writes.');continue;}
   const name=tokens[key[0]].value;if(!isName(name))continue;
   const receiver=tokens[i-1],namespace=receiver?.kind==='word'&&Object.hasOwn(NAMESPACES,receiver.value.toLowerCase())?NAMESPACES[receiver.value.toLowerCase()]:'dynamic-or-object-unresolved';
   write(name,key[0],key[1],args[1][0],args[1][1],'set-variable',namespace,args.length===3?'unresolved-expression':'not-present');
  }
  const preprocessingUnresolved=tokens.some(t=>t.kind==='directive')||/\\[\t ]*(?:\r\n|\r|\n)/.test(file.text);
  coverage.push({file:file.name,status:'lexical-write-inventory',writes:writes.length-beforeWrites,operations:operations.length-beforeOperations,skippedLocalWrites,preprocessingUnresolved,identityAmbiguous});
  if(preprocessingUnresolved)finding('PREPROCESSING_WRITE_CONTEXT_UNRESOLVED',{file:file.name,start:0,end:0,line:1,column:1},'Raw directives/line splices may change writes and scope; inactive branches are not selected here.');
 }
 const grouped=new Map();
 const group=name=>{const key=name.toLowerCase();if(!grouped.has(key)){if(grouped.size>=LIMITS.symbols)fail('Cross-file symbol limit exceeded');grouped.set(key,{canonicalName:key,spellings:new Set(),registrations:[],writes:[],calls:[]});}const row=grouped.get(key);row.spellings.add(name);return row;};
 for(const registration of registrationReview.registrations)if(registration.nameCandidate)group(registration.nameCandidate).registrations.push(registration);
 for(const row of writes)group(row.nameCandidate).writes.push(row);
 for(const call of registrationReview.calls)if(call.targetNameCandidate&&!call.targetNameCandidate.startsWith('_'))group(call.targetNameCandidate).calls.push(call);
 const symbols=[],callLinks=[];
 for(const row of [...grouped.values()].sort((a,b)=>a.canonicalName<b.canonicalName?-1:1)){
  charge(row.registrations.length+row.writes.length+row.calls.length);const hazards=[],partitions=new Map();
  for(const write of row.writes){if(!partitions.has(write.namespace))partitions.set(write.namespace,[]);partitions.get(write.namespace).push(write.id);}
  if([...partitions.values()].some(ids=>ids.length>1))hazards.push('repeated-write-candidates-in-one-domain');
  if(partitions.size>1||partitions.has('implicit-unresolved')||partitions.has('dynamic-or-object-unresolved'))hazards.push('namespace-resolution-required');
  if(new Set(row.writes.map(w=>w.source.file)).size>1)hazards.push('cross-file-order-unresolved');
  if(row.registrations.length>1)hazards.push('duplicate-registration-candidates');
  if(row.registrations.length&&row.writes.length)hazards.push('registration-runtime-write-overlap');
  if(row.writes.some(w=>w.valueKind!=='code-literal-candidate'))hazards.push('dynamic-or-untyped-write');
  if(row.writes.some(w=>w.lexicalBraceDepth>0))hazards.push('nested-code-context-unresolved');
  charge(row.writes.length);
  const symbol={id:'symbol-'+symbols.length,canonicalName:row.canonicalName,nameSpellings:[...row.spellings].sort(),registrationIds:row.registrations.map(r=>r.id),writeIds:row.writes.map(w=>w.id),callIds:row.calls.map(c=>c.id),namespacePartitions:[...partitions].sort((a,b)=>a[0]<b[0]?-1:1).map(([namespace,writeIds])=>({namespace,writeIds})),hazards,bindingResolved:false,executionReady:false};symbols.push(symbol);
  if(hazards.length)finding('FUNCTION_NAME_REQUIRES_REVIEW',row.writes[0]?.source||row.registrations[0]?.source||row.calls[0].source,hazards.join('; '));
 }
 const globalBlockers=['lexical-name-match-only','namespace-private-scope-and-load-order-unresolved','preprocessing-and-runtime-bindings-unresolved'];
 if(operations.length)globalBlockers.push('dynamic-scope-or-source-operations-present');
 if(coverage.some(c=>c.identityAmbiguous))globalBlockers.push('case-colliding-source-identities-present');
 for(const call of registrationReview.calls){
  const row=call.targetNameCandidate&&!call.targetNameCandidate.startsWith('_')?grouped.get(call.targetNameCandidate.toLowerCase()):null;
  const writerCandidates=row?.writes||[],registrationCandidates=call.candidateRegistrationIds;
  charge(writerCandidates.length+registrationCandidates.length);
  const status=call.kind!=='named-candidate'||call.targetNameCandidate.startsWith('_')?'unresolved-call-context':writerCandidates.length>1?'multiple-write-name-candidates':writerCandidates.length===1?'unique-write-name-candidate':registrationCandidates.length?'registration-name-candidates-only':'unmatched-name';
  callLinks.push({callId:call.id,source:call.source,targetNameCandidate:call.targetNameCandidate,candidateWriteIds:writerCandidates.map(w=>w.id),candidateRegistrationIds:[...registrationCandidates],status,blockers:[...globalBlockers],bindingResolved:false,executionReady:false});
 }
 const report={schema:'command-sqf-cross-file-review',version:1,executable:false,evidenceLevel:'lexical-candidates-only',preprocessingPerformed:false,symbolBindingsResolved:false,filesystemAccess:false,offsetEncoding:'utf16-code-units',files:registrationReview.files,configRoots:registrationReview.configRoots,reviewContextSHA256:crypto.createHash('sha256').update('COMMAND-CROSS-FILE-v1\0'+registrationReview.reviewContextSHA256,'utf8').digest('hex'),registrationReview,coverage,writes,operations,symbols,callLinks,findings,requiredReview:[...REVIEW],summary:{files:registrationReview.files.length,writes:writes.length,symbols:symbols.length,calls:callLinks.length,uniqueWriteNameCandidates:callLinks.filter(c=>c.status==='unique-write-name-candidate').length,multipleWriteNameCandidates:callLinks.filter(c=>c.status==='multiple-write-name-candidates').length,symbolsRequiringReview:symbols.filter(s=>s.hazards.length).length,opaqueOperations:operations.length,preprocessingUnresolvedFiles:coverage.filter(c=>c.preprocessingUnresolved).length,candidateReferences:references,executionReady:0}};
 if(Buffer.byteLength(JSON.stringify(report),'utf8')>LIMITS.reportBytes)fail('Cross-file report byte limit exceeded');return report;
}
module.exports={LIMITS,REVIEW,build};
