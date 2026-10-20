/* Potential source effects only. Detached contexts are not invoked; source/native semantics remain unresolved. */
'use strict';
const F=require('./sqf-control-context'),V=require('./sqf-control-context-validation'),{RULES}=require('./sqf-source-semantics'),crypto=require('node:crypto');
const LIMITS=Object.freeze({commands:20000,invocations:10000,effectReferences:100000,reportBytes:16777216});
const REVIEW=Object.freeze(['complete-source-and-preprocessing-context','source-command-overloads-and-effects','runtime-bindings-and-definite-initialization','callback-invocation-lifetime-scheduling-and-locality','verified-control-flow-and-exit-semantics','target-native-adapter-and-behavior-validation']);
const hash=text=>crypto.createHash('sha256').update(text,'utf8').digest('hex');
function analyze(flow){
 const slotsByNode=new Map(),contextRows=new Map(flow.contexts.map(c=>[c.id,{contextId:c.id,kind:c.kind,parentContextId:c.parentContextId,invocationResolved:false,potentialEffects:new Set(),unknownCoverage:false}]));
 const nodes=[],commands=[],invocations=[];let effectReferences=0;
 const charge=count=>{effectReferences+=count;if(effectReferences>LIMITS.effectReferences)throw Error('Statement effect reference limit exceeded');};
 for(const slot of flow.expressionSlots){if(!slotsByNode.has(slot.ownerNodeId))slotsByNode.set(slot.ownerNodeId,[]);slotsByNode.get(slot.ownerNodeId).push(slot);}
 for(const node of flow.nodes){
  const effects=new Set(),commandIds=[],invocationIds=[],slots=slotsByNode.get(node.id)||[];let unknownCoverage=false;
  if(node.target)effects.add('write-binding-candidate');
  if(node.kind==='StoreCode'||node.kind==='CodeValue')effects.add('construct-stored-code-value');
  if(node.kind==='Branch')effects.add('conditional-control-candidate');
  if(node.kind==='Loop')effects.add('repeated-region-effects-unresolved');
  if(node.kind==='ScopeExit')effects.add('scope-exit-effects-unresolved');
  if(node.kind==='Barrier'){effects.add('unknown-statement-effects');unknownCoverage=true;}
  for(const slot of slots){
   if(slot.syntax.status!=='recognized'){effects.add('unknown-expression-effects');unknownCoverage=true;continue;}
   const syntaxNodes=new Map(slot.syntax.nodes.map(n=>[n.id,n])),codeContexts=new Map(slot.codeContextCandidates.map(c=>[c.expressionNodeId,c]));
   const unwrap=id=>{let value=syntaxNodes.get(id);while(value?.kind==='Group')value=syntaxNodes.get(value.operand);return value;};
   const sourceOf=value=>({file:slot.source.file,start:slot.source.start+value.start,end:slot.source.start+value.end});
   const invocation=(value,reason,commandId=null)=>{
    value=unwrap(value?.id);if(value?.kind!=='CodeValue')return;
    if(invocations.length>=LIMITS.invocations)throw Error('Statement invocation candidate limit exceeded');
    const context=codeContexts.get(value.id),row={id:'invocation-'+invocations.length,ownerNodeId:node.id,ownerContextId:node.contextId,slotId:slot.id,expressionNodeId:value.id,commandId,reason,targetContextId:context?.contextId||null,source:sourceOf(value),invocationResolved:false,executionReady:false};invocations.push(row);invocationIds.push(row.id);
   };
   for(const value of slot.syntax.nodes){
    if(value.kind==='Symbol')effects.add('read-binding-candidate');
    if(value.kind==='Array')effects.add('construct-array-value-candidate');
    if(value.kind==='CodeValue')effects.add('construct-code-value-candidate');
    if(['Unary','Binary'].includes(value.kind))effects.add('operator-overload-effects-unresolved');
    if(value.kind==='Binary'&&['&&','and','||','or'].includes(value.operator)){
     const right=unwrap(value.right);if(right?.kind==='CodeValue'){effects.add('conditional-code-invocation-candidate');invocation(right,'lazy-code-right-operand');}else if(right?.kind==='Literal'&&right.literalType==='boolean')effects.add('eager-boolean-operands-candidate');else effects.add('logical-overload-effects-unresolved');
    }
    if(value.kind!=='Command')continue;
    const rule=RULES[value.command.toLowerCase()];if(!rule)throw Error('Statement effect command registry mismatch');
    if(commands.length>=LIMITS.commands)throw Error('Statement command candidate limit exceeded');
    const candidateEffects=new Set(rule.effects),obligations=new Set(rule.obligations),id='command-'+commands.length,args=value.arguments.map(unwrap);
    if(value.command==='addEventHandler'){
     candidateEffects.add('deferred-event-callback-candidate');obligations.add('callback-context-and-owned-cleanup-unresolved');
     const descriptor=args[1];if(descriptor?.kind==='Array')invocation(syntaxNodes.get(descriptor.elements[1]),'event-callback-candidate',id);
    }
    if(value.command==='addAction'){
     candidateEffects.add('deferred-scheduled-action-candidate');candidateEffects.add('per-frame-condition-string-candidate');obligations.add('action-code-or-string-and-condition-lifetime-unresolved');
     const descriptor=args[1];if(descriptor?.kind==='Array')invocation(syntaxNodes.get(descriptor.elements[1]),'action-callback-candidate',id);
    }
    if(value.command==='isNil'){
     if(args[0]?.kind==='CodeValue'){candidateEffects.add('unscheduled-code-invocation-candidate');invocation(args[0],'isnil-code-overload-candidate',id);}else if(args[0]?.kind==='Literal'&&args[0].literalType==='string')candidateEffects.add('dynamic-binding-read-candidate');else obligations.add('isnil-overload-effects-unresolved');
    }
    if(value.command==='getVariable'&&args[1]?.kind==='Array')obligations.add('default-argument-expression-work-is-eager-candidate');
    if(value.command==='select'&&args[1]?.kind==='CodeValue'){candidateEffects.add('per-element-code-invocation-candidate');invocation(args[1],'select-code-overload-candidate',id);}
    const row={id,ownerNodeId:node.id,contextId:node.contextId,slotId:slot.id,expressionNodeId:value.id,command:rule.name,source:sourceOf(value),sourceReference:rule.sourceReference,potentialEffects:[...candidateEffects].sort(),obligations:[...obligations].sort(),operandTypesVerified:false,callResolved:false,nativeVerified:false,executionReady:false};commands.push(row);commandIds.push(id);charge(row.potentialEffects.length+row.obligations.length);for(const effect of row.potentialEffects)effects.add(effect);
   }
  }
  const row={nodeId:node.id,contextId:node.contextId,source:node.source,potentialEffects:[...effects].sort(),commandIds,invocationIds,coverage:unknownCoverage?'contains-unreviewed-source':'bounded-syntax-candidates-only',effectsResolved:false,executionReady:false};charge(row.potentialEffects.length);nodes.push(row);
  const context=contextRows.get(node.contextId);for(const effect of effects)context.potentialEffects.add(effect);context.unknownCoverage ||= unknownCoverage;
 }
 const contexts=[...contextRows.values()].map(c=>{const potentialEffects=[...c.potentialEffects].sort();charge(potentialEffects.length);return {...c,potentialEffects,effectsResolved:false,executionReady:false};});
 const ids=new Set(commands.map(c=>c.id)),contextIds=new Set(flow.contexts.map(c=>c.id));for(const row of invocations)if(row.commandId&&!ids.has(row.commandId)||row.targetContextId&&!contextIds.has(row.targetContextId))throw Error('Statement effect candidate graph identity mismatch');
 const sourceRuleSetSHA256=hash(JSON.stringify(RULES));
 const report={schema:'command-sqf-statement-effect-review',version:1,executable:false,evaluationPerformed:false,effectsResolved:false,fullStatementEffectsAnalyzed:false,controlFlowLowered:false,targetTypesResolved:false,offsetEncoding:'utf16-code-units',coverage:'potential-effects-in-bounded-source-regions',files:flow.files,sourceIRContextSHA256:flow.reviewContextSHA256,sourceRuleSetSHA256,reviewContextSHA256:hash('COMMAND-STATEMENT-EFFECTS-v1\0'+JSON.stringify({sourceIRContextSHA256:flow.reviewContextSHA256,sourceRuleSetSHA256})),controlContextReview:flow,nodes,contexts,commands,invocations,requiredReview:[...REVIEW],summary:{nodes:nodes.length,contexts:contexts.length,commandCandidates:commands.length,invocationCandidates:invocations.length,contextsWithUnknownCoverage:contexts.filter(c=>c.unknownCoverage).length,nodeWriteCandidates:nodes.filter(n=>n.potentialEffects.includes('write-binding-candidate')).length,effectReferences,executionReady:0}};
 if(Buffer.byteLength(JSON.stringify(report),'utf8')>LIMITS.reportBytes)throw Error('Statement effect report byte limit exceeded');return report;
}
async function build(files){return analyze(await F.build(files));}
async function reviewImported(report,files){return analyze(await V.validate(report,files));}
module.exports={LIMITS,REVIEW,build,reviewImported};
