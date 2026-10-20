/* Source syntax constraints only: no type propagation, evaluation or definite initialization. */
'use strict';
const F=require('./sqf-control-context'),V=require('./sqf-control-context-validation'),E=require('./sqf-expression-ast'),{RULES}=require('./sqf-source-semantics'),crypto=require('node:crypto');
const LIMITS=Object.freeze({constraints:50000,links:50000,parameterNodes:30000,reportBytes:16777216});
const REVIEW=Object.freeze(['source-preprocessing-and-runtime-bindings','control-flow-and-definite-initialization','parameter-input-validation-and-default-evaluation','operator-overloads-and-source-runtime-types','native-target-types-and-adapters']);
const hash=value=>crypto.createHash('sha256').update(value,'utf8').digest('hex');
async function build(raw){const files=E.captureSources(raw);return analyze(await F.build(files),files);}
async function reviewImported(report,raw){const files=E.captureSources(raw);return analyze(await V.validate(report,files),files);}
function analyze(ir,files){
 const texts=new Map(files.map(f=>[f.name.replace(/\\/g,'/'),f.text])),nodes=new Map(ir.nodes.map(n=>[n.id,n])),slots=new Map(ir.expressionSlots.map(s=>[s.id,s])),declarations=new Map(ir.bindingReview.declarations.map(d=>[d.id,d]));
 const constraints=[],bindings=[],reads=[],writes=[],byBinding=new Map();let links=0,parameterNodes=0;
 const charge=n=>{links+=n;if(links>LIMITS.links)throw Error('Source constraint link limit exceeded');};
 const add=row=>{if(constraints.length>=LIMITS.constraints)throw Error('Source constraint count limit exceeded');constraints.push({id:'constraint-'+constraints.length,...row,satisfied:false,runtimeVerified:false,executionReady:false});};
 const key=s=>s.file+':'+s.start+':'+s.end,bySpan=new Map(ir.nodes.map(n=>[key(n.source),n]));
 // Parameter defaults and exemplar arrays are syntax evidence, never actual arguments or enforced types.
 const parameterPart=source=>{if(!source)return null;const syntax=E.parseExtended(texts.get(source.file).slice(source.start,source.end));parameterNodes+=syntax.nodes.length;if(parameterNodes>LIMITS.parameterNodes)throw Error('Source parameter node limit exceeded');const index=new Map(syntax.nodes.map(n=>[n.id,n]));const unwrap=id=>{let n=index.get(id);while(n?.kind==='Group')n=index.get(n.operand);return n;};const hint=n=>n?.kind==='Literal'?n.literalType:n?.kind==='Array'?'array':n?.kind==='CodeValue'?'code':'unknown',root=unwrap(syntax.root),elementShapeHints=root?.kind==='Array'?root.elements.map(id=>hint(unwrap(id))):[];charge(elementShapeHints.length);return {source,syntaxStatus:syntax.status,sourceShapeHint:hint(root),elementShapeHints,evaluated:false};};
 for(const d of declarations.values()){
  const owner=d.initializer?bySpan.get(key(d.initializer)):null;
  const row={id:d.id,name:d.name,scopeId:d.scopeId,kind:d.kind,source:d.source,initializerNodeId:owner?.id||null,writeCandidateIds:[],defaultEvidence:parameterPart(d.defaultSource),allowedTypesEvidence:parameterPart(d.allowedTypesSource),arrayCountEvidence:parameterPart(d.arrayCountSource),initializationReview:d.kind==='parameter'?'argument-and-default-paths-unresolved':d.kind==='private-name'?'declaration-without-initializer':d.kind==='private-initializer'?'initializer-value-and-execution-unresolved':'loop-entry-and-iteration-unresolved',initializationStatus:'unresolved',runtimeType:null,targetType:null,bindingResolved:false,executionReady:false};
  bindings.push(row);byBinding.set(d.id,row);
 }
 for(const n of ir.nodes){if(!n.target)continue;const ids=n.target.candidateBindingIds;charge(ids.length);const slot=n.expressionIds.map(id=>slots.get(id)).find(s=>s.role==='expression');
  const enclosingRegionIds=[];let ancestor=nodes.get(n.parentId);while(ancestor&&ancestor.contextId===n.contextId){if(['Branch','Loop','ScopeExit','Barrier'].includes(ancestor.kind)){charge(1);enclosingRegionIds.push(ancestor.id);}ancestor=nodes.get(ancestor.parentId);}
  const w={id:'write-'+writes.length,nodeId:n.id,contextId:n.contextId,enclosingRegionIds,source:n.target.source,candidateBindingIds:[...ids],sourceShapeHint:n.kind==='StoreCode'?'code':slot?.sourceShapeHint||'unknown',slotId:slot?.id||null,initializationGuaranteed:false,executionReady:false};writes.push(w);for(const id of ids)byBinding.get(id).writeCandidateIds.push(w.id);
  add({kind:'assignment-source-shape-candidate',nodeId:n.id,contextId:n.contextId,slotId:w.slotId,source:n.source,sourceShapeHint:w.sourceShapeHint,candidateBindingIds:[...ids]});charge(ids.length);
 }
 for(const slot of ir.expressionSlots){
  const owner=nodes.get(slot.ownerNodeId),evidence=new Map(slot.symbolEvidence.map(e=>[e.expressionNodeId,e]));
  if(slot.role==='condition')add({kind:'condition-requires-boolean',nodeId:owner.id,contextId:owner.contextId,slotId:slot.id,source:slot.source,syntaxShapeHint:slot.sourceShapeHint,knownSyntaxMismatch:['number','string','array','code'].includes(slot.sourceShapeHint)});
  for(const e of slot.syntax.nodes){
   if(e.kind==='Symbol'){const ref=evidence.get(e.id),ids=ref?.candidateBindingIds||[];charge(ids.length);reads.push({id:'read-'+reads.length,nodeId:owner.id,contextId:owner.contextId,slotId:slot.id,expressionNodeId:e.id,source:ref?.source||slot.source,name:e.name,candidateBindingIds:[...ids],bindingStatus:ref?.status||'unresolved',initializationStatus:'unresolved',runtimeType:null,typePropagationPerformed:false,executionReady:false});}
   if(e.kind==='Command'){const rule=RULES[e.command.toLowerCase()];if(rule){charge(e.arguments.length);add({kind:'command-signature-candidate',nodeId:owner.id,contextId:owner.contextId,slotId:slot.id,expressionNodeId:e.id,source:slot.source,command:e.command,operandExpressionIds:[...e.arguments],signatureAlternatives:rule.forms,returnTypeCandidate:rule.returnType,sourceReference:rule.sourceReference,overloadResolved:false});}}
   else if(['Unary','Binary'].includes(e.kind)){const ids=e.operand?[e.operand]:[e.left,e.right];charge(ids.length);add({kind:'operator-overload-review',nodeId:owner.id,contextId:owner.contextId,slotId:slot.id,expressionNodeId:e.id,source:slot.source,operator:e.operator,operandExpressionIds:ids,overloadResolved:false});}
  }
 }
 const report={schema:'command-sqf-source-constraint-review',version:1,executable:false,evaluationPerformed:false,typePropagationPerformed:false,definiteInitializationAnalyzed:false,runtimeTypesResolved:false,targetTypesResolved:false,nativeVerified:false,coverage:'syntax-constraints-and-unresolved-initialization',files:ir.files,sourceIRContextSHA256:ir.reviewContextSHA256,ruleSetSHA256:hash(JSON.stringify(RULES)),controlContextReview:ir,constraints,bindings,writes,reads,requiredReview:[...REVIEW],summary:{constraints:constraints.length,bindings:bindings.length,writes:writes.length,reads:reads.length,parameterEvidenceNodes:parameterNodes,links,knownConditionShapeMismatches:constraints.filter(c=>c.knownSyntaxMismatch).length,executionReady:0}};
 report.reviewContextSHA256=hash('COMMAND-SOURCE-CONSTRAINTS-v1\0'+JSON.stringify({files:report.files,ruleSetSHA256:report.ruleSetSHA256,sourceIRContextSHA256:report.sourceIRContextSHA256}));
 if(Buffer.byteLength(JSON.stringify(report),'utf8')>LIMITS.reportBytes)throw Error('Source constraint report byte limit exceeded');return report;
}
module.exports={LIMITS,REVIEW,build,reviewImported};
