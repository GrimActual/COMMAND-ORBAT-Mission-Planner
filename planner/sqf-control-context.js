/* Region-level control/context IR and source shape slots. Not an executable CFG or typed target IR. */
'use strict';
const B=require('./sqf-binding-review'),E=require('./sqf-expression-ast'),crypto=require('node:crypto');
const LIMITS=Object.freeze({contexts:10000,nodes:10000,relations:10000,edges:30000,expressionSlots:10000,expressionNodes:30000,bindingLinks:20000,codeContextLinks:10000,findings:5000,reportBytes:16777216,targetNameCharacters:240});
const REVIEW=Object.freeze(['complete-source-and-preprocessing-context','runtime-bindings-namespaces-and-types','loop-exit-and-evaluation-order-semantics','callback-lifetime-scheduling-and-locality','full-statement-effects-and-definite-initialization','target-types-resources-and-native-adapters','verified-control-flow-lowering']);
const KINDS=Object.freeze({Program:'ContextRoot',Block:'Sequence',If:'Branch',ExitWith:'ScopeExit',While:'Loop',ForRange:'Loop',ForCode:'Loop',ForEach:'Loop',CodeAssignment:'StoreCode',Assignment:'Assignment',CodeLiteral:'CodeValue',OpaqueStatement:'OpaqueStatement',Unsupported:'Barrier'});
async function build(raw){
 // Binding inspection captures sources before hashing yields and exposes its own freshly built structure.
 const {report:bindingReview,structure,files}=await B.inspect(raw),sources=new Map(files.map(f=>[f.name.replace(/\\/g,'/'),f.text])),lineStarts=new Map();
 const nodes=[],contexts=[],relations=[],edges=[],expressionSlots=[],findings=[],parents=new Map(),bySourceId=new Map(),contextById=new Map();let expressionNodes=0,bindingLinks=0,codeContextLinks=0;
 const add=(list,max,row)=>{if(list.length>=max)throw Error('Control/context inventory limit exceeded');list.push(row);return row;};
 const locate=source=>{let starts=lineStarts.get(source.file);if(!starts){starts=[0];const text=sources.get(source.file);for(let i=0;i<text.length;i++){if(text[i]==='\r'){if(text[i+1]==='\n')i++;starts.push(i+1);}else if(text[i]==='\n')starts.push(i+1);}lineStarts.set(source.file,starts);}let lo=0,hi=starts.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(starts[mid]<=source.start)lo=mid;else hi=mid;}return {file:source.file,start:source.start,end:source.end,line:lo+1,column:source.start-starts[lo]+1};};
 const finding=(code,node,detail)=>add(findings,LIMITS.findings,{code,nodeId:node.id,source:node.source,detail});
 for(const node of structure.nodes)for(const child of node.children)parents.set(child.nodeId,{parent:node,role:child.role});
 for(const sourceNode of structure.nodes){
  const edge=parents.get(sourceNode.id),parent=edge?bySourceId.get(edge.parent.id):null;
  const detached=!!edge&&(edge.parent.kind==='CodeAssignment'||edge.parent.kind==='CodeLiteral'||edge.role==='nested-code');
  let contextId=parent?.contextId;
  const id='flow-'+nodes.length;
  if(!parent||detached){const kind=!parent?(/\.sqf$/i.test(sourceNode.source.file)?'file':'inventory-only'):edge.parent.kind==='CodeAssignment'?'stored-code':edge.parent.kind==='CodeLiteral'?'literal-code':'opaque-nested-code';const context=add(contexts,LIMITS.contexts,{id:'context-'+contexts.length,kind,rootNodeId:id,ownerNodeId:parent?.id||null,parentContextId:parent?.contextId||null,source:locate(sourceNode.source),environmentResolved:false,invocationResolved:false,executionReady:false});contextId=context.id;contextById.set(contextId,context);}
  const node=add(nodes,LIMITS.nodes,{id,sourceNodeId:sourceNode.id,kind:KINDS[sourceNode.kind],sourceKind:sourceNode.kind,source:locate(sourceNode.source),parentId:parent?.id||null,contextId,expressionIds:[],storedContextIds:[],target:null,valueShapeHint:'unknown',runtimeType:null,targetType:null,typeResolved:false,blockers:[...sourceNode.blockers],executionReady:false});bySourceId.set(sourceNode.id,node);
  if(parent){add(relations,LIMITS.relations,{parentId:parent.id,childId:node.id,role:edge.role,kind:detached?'owns-detached-context':'structural-owner'});if(detached){parent.storedContextIds.push(contextId);finding('DETACHED_CODE_CONTEXT',node,'Stored or opaque nested code has no automatic invocation or fallthrough from its owner.');}}
  if(sourceNode.kind==='ExitWith'){node.exitTarget={status:'unresolved',contextId:null,nodeId:null};finding('SCOPE_EXIT_TARGET_UNRESOLVED',node,'No function return, loop break or enclosing-scope exit target is inferred.');}
  if(KINDS[sourceNode.kind]==='Loop'){node.loopForm=sourceNode.kind;finding('LOOP_POLICY_UNRESOLVED',node,'Iteration count, source evaluation frequency, scheduler behavior and exit semantics are unresolved.');}
  if(sourceNode.kind==='Unsupported')finding('UNSUPPORTED_STATEMENT_BARRIER',node,'Unsupported source control syntax is retained as a barrier; nested code is not an invoked region.');
 }
 const sourceKey=source=>source.file+':'+source.start+':'+source.end;
 const refs=new Map(bindingReview.references.map(r=>[sourceKey(r.source),r])),decls=new Map();
 for(const row of bindingReview.declarations){const key=sourceKey(row.source);if(!decls.has(key))decls.set(key,[]);decls.get(key).push(row.id);}
 const detachedBySpan=new Map(contexts.filter(c=>c.parentContextId).map(c=>[sourceKey(c.source),c.id]));
 const charge=count=>{bindingLinks+=count;if(bindingLinks>LIMITS.bindingLinks)throw Error('Control/context binding link limit exceeded');};
 const slot=(node,role,source)=>{
  const syntax=E.parseExtended(sources.get(source.file).slice(source.start,source.end));expressionNodes+=syntax.nodes.length;if(expressionNodes>LIMITS.expressionNodes)throw Error('Control/context expression node limit exceeded');
  const entry=add(expressionSlots,LIMITS.expressionSlots,{id:'slot-'+expressionSlots.length,ownerNodeId:node.id,role,source:locate(source),syntax,sourceShapeHint:'unknown',runtimeType:null,targetType:null,typeResolved:false,symbolEvidence:[],codeContextCandidates:[],executionReady:false});
  if(syntax.root){let root=syntax.nodes[Number(syntax.root.slice(5))];while(root.kind==='Group')root=syntax.nodes[Number(root.operand.slice(5))];entry.sourceShapeHint=root.kind==='Literal'?root.literalType:root.kind==='Array'?'array':root.kind==='CodeValue'?'code':'unknown';}
  for(const value of syntax.nodes){const absolute=locate({file:source.file,start:source.start+value.start,end:source.start+value.end});if(value.kind==='Symbol'){const ref=refs.get(sourceKey(absolute)),candidateBindingIds=ref?.candidateBindingIds||[];charge(candidateBindingIds.length);entry.symbolEvidence.push({expressionNodeId:value.id,source:absolute,name:value.name,status:ref?.status||'unresolved-source-context',candidateBindingIds:[...candidateBindingIds],bindingResolved:false});}else if(value.kind==='CodeValue'){const contextId=detachedBySpan.get(sourceKey(absolute));if(++codeContextLinks>LIMITS.codeContextLinks)throw Error('Control/context code link limit exceeded');entry.codeContextCandidates.push({expressionNodeId:value.id,source:absolute,contextId:contextId||null,invocationResolved:false});}}
  node.expressionIds.push(entry.id);if(syntax.status==='unsupported')finding('EXPRESSION_SYNTAX_UNRESOLVED',node,'Expression slot '+role+' is outside the bounded expression parser; no partial expression tree is used.');return entry;
 };
 for(const sourceNode of structure.nodes){
  const node=bySourceId.get(sourceNode.id);
  for(const part of sourceNode.parts){
   if(part.role==='target'){
    const name=sources.get(part.source.file).slice(part.source.start,part.source.end);if(name.length>LIMITS.targetNameCharacters)throw Error('Control/context target name limit exceeded');
    const declarations=decls.get(sourceKey(part.source))||[],reference=refs.get(sourceKey(part.source)),ids=declarations.length?declarations:reference?.candidateBindingIds||[];charge(ids.length);
    node.target={name,source:locate(part.source),status:declarations.length?'declaration-candidates':reference?.status||'global-or-namespace-unresolved',candidateBindingIds:[...ids],bindingResolved:false,initializationResolved:false};continue;
   }
   if(part.role==='counter'){node.counter={source:locate(part.source),bindingResolved:false};continue;}
   const entry=slot(node,part.role,part.source);
   if(part.role==='expression')node.valueShapeHint=entry.sourceShapeHint;
   if(part.role==='condition'&&['number','string','array','code'].includes(entry.sourceShapeHint))finding('CONDITION_SHAPE_REQUIRES_REVIEW',node,'The condition has a non-Boolean syntax shape; source typing and valid condition semantics still require review.');
  }
  if(sourceNode.kind==='OpaqueStatement')slot(node,'statement-result-candidate',sourceNode.source);
  if(sourceNode.kind==='CodeAssignment'||sourceNode.kind==='CodeLiteral')node.valueShapeHint='code';
 }
 const addEdge=(from,to,kind)=>{if(from.contextId!==to.contextId)throw Error('Control/context edge crosses a detached context');add(edges,LIMITS.edges,{id:'edge-'+edges.length,from:from.id,to:to.id,contextId:from.contextId,kind,verified:false});};
 for(const sourceNode of structure.nodes){
  const node=bySourceId.get(sourceNode.id),children=sourceNode.children.map(c=>({role:c.role,node:bySourceId.get(c.nodeId)}));
  if(sourceNode.kind==='Program'||sourceNode.kind==='Block'){for(let i=1;i<children.length;i++)addEdge(children[i-1].node,children[i].node,children[i-1].node.sourceKind==='ExitWith'?'exit-condition-false-continuation-candidate':'lexical-next-statement-candidate');}
  if(sourceNode.kind==='If')for(const child of children)addEdge(node,child.node,child.role==='then'?'branch-then-candidate':'branch-else-candidate');
  if(sourceNode.kind==='ExitWith')addEdge(node,children[0].node,'scope-exit-body-candidate');
  if(node.kind==='Loop'){
   for(const child of children)addEdge(node,child.node,'loop-'+child.role+'-region-candidate');
   const body=children.find(c=>c.role==='body').node,condition=children.find(c=>c.role==='condition')?.node,update=children.find(c=>c.role==='update')?.node;
   addEdge(body,update||condition||node,'loop-repeat-region-candidate');if(update&&condition)addEdge(update,condition,'loop-condition-region-candidate');
  }
 }
 // Producer invariants only; this is not an imported-report validator or executable CFG verifier.
 const nodeIds=new Set(nodes.map(n=>n.id)),slotIds=new Set(expressionSlots.map(s=>s.id)),bindingIds=new Set(bindingReview.declarations.map(d=>d.id));
 for(const node of nodes){if(!contextById.has(node.contextId)||node.parentId&&!nodeIds.has(node.parentId)||node.expressionIds.some(id=>!slotIds.has(id))||node.target?.candidateBindingIds.some(id=>!bindingIds.has(id)))throw Error('Control/context graph identity mismatch');}
 for(const entry of expressionSlots)for(const evidence of entry.symbolEvidence)if(evidence.candidateBindingIds.some(id=>!bindingIds.has(id)))throw Error('Control/context binding identity mismatch');
 const report={schema:'command-sqf-control-context-ir',version:1,executable:false,evaluationPerformed:false,controlFlowLowered:false,runtimeTypesResolved:false,targetTypesResolved:false,fullStatementEffectsAnalyzed:false,graphKind:'region-level-structural-candidates',offsetEncoding:'utf16-code-units',files:bindingReview.files,reviewContextSHA256:crypto.createHash('sha256').update('COMMAND-CONTROL-CONTEXT-v1\0'+JSON.stringify(bindingReview.files),'utf8').digest('hex'),structuralReview:{schema:structure.schema,version:structure.version,summary:structure.summary},bindingReview,contexts,nodes,relations,edges,expressionSlots,findings,requiredReview:[...REVIEW],summary:{files:bindingReview.files.length,contexts:contexts.length,detachedContexts:contexts.filter(c=>c.parentContextId).length,nodes:nodes.length,relations:relations.length,edges:edges.length,branches:nodes.filter(n=>n.kind==='Branch').length,loops:nodes.filter(n=>n.kind==='Loop').length,scopeExits:nodes.filter(n=>n.kind==='ScopeExit').length,assignments:nodes.filter(n=>['Assignment','StoreCode'].includes(n.kind)).length,expressionSlots:expressionSlots.length,expressionNodes,recognizedExpressions:expressionSlots.filter(s=>s.syntax.status==='recognized').length,unsupportedExpressions:expressionSlots.filter(s=>s.syntax.status==='unsupported').length,syntaxShapeHints:expressionSlots.filter(s=>s.sourceShapeHint!=='unknown').length,bindingCandidateLinks:bindingLinks,codeContextLinks,executionReady:0}};
 if(Buffer.byteLength(JSON.stringify(report),'utf8')>LIMITS.reportBytes)throw Error('Control/context report byte limit exceeded');return report;
}
module.exports={LIMITS,REVIEW,build};
