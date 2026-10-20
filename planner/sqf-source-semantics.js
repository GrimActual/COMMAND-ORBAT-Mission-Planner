/* Bounded source-shape/effect review. No evaluation, flow-sensitive types or target execution. */
'use strict';
const E=require('./sqf-expression-ast'),B=require('./sqf-binding-review');
const LIMITS=Object.freeze({nodes:20000,findings:5000,bytes:8388608});
const REVIEW=Object.freeze(['source-preprocessing-and-profile-version','flow-sensitive-types-and-definite-values','source-version-and-runtime-domain','callback-return-scheduling-and-locality','full-statement-and-control-flow-effects','target-resources-and-native-adapters']);
const form=(...args)=>args.map(types=>types.split('|'));
const definitions=[
 ['player',[form()],'object',['read-player-context'],['resolve-current-player-and-locality']],
 ['hasInterface',[form()],'boolean',['read-client-context'],['resolve-client-server-headless-context']],
 ['objNull',[form()],'object',[],['preserve-null-object-semantics']],
 ['nil',[form()],'nothing',[],['preserve-undefined-value-semantics']],
 ['playableUnits',[form()],'array',['read-playable-unit-set'],['preserve-multiplayer-and-respawn-selection']],
 ['switchableUnits',[form()],'array',['read-switchable-unit-set'],['preserve-client-and-singleplayer-selection']],
 ['isNull',[form('object|control|display|group|location|task|script|config|diary-record|team-member')],'boolean',[],['preserve-source-null-type']],
 ['isNil',[form('string|code')],'boolean',[],['resolve-isnil-overload-and-environment']],
 ['vehicle',[form('object')],'object',['read-vehicle-context'],['resolve-current-vehicle-and-lifetime']],
 ['findDisplay',[form('number|string')],'display',['read-ui'],['requires-client-ui','map-display-resource-and-lifetime']],
 ['count',[form('string|config|hashmap|array')],'number',['read-collection'],['preserve-string-encoding-and-source-collection-semantics']],
 ['displayCtrl',[form('display','number')],'control',['read-ui'],['requires-client-ui','map-control-resource-and-lifetime']],
 ['lbAdd',[form('array'),form('control','string')],'number',['mutate-ui'],['requires-client-ui','preserve-list-row-identity']],
 ['getVariable',[form('namespace|object|group|task|team-member|location|control|display','string|array')],'unknown',['read-variable-space'],['resolve-variable-owner-name-default-and-locality']],
 ['arrayIntersect',[form('array','array')],'array',['read-collections'],['preserve-identity-deduplication-and-version-specific-order']],
 ['select',[form('array|string|config','number|boolean|array|code')],'unknown',['read-indexed-value'],['resolve-select-overload-index-domain-and-source-version']],
 ['addAction',[form('object','array')],'number',['register-action'],['requires-client-ui','own-action-id-and-cleanup','analyze-action-arguments-and-eligibility']],
 ['addEventHandler',[form('object|group','array')],'number',['subscribe-event'],['resolve-source-event-owner-and-version','own-event-id-and-cleanup','map-event-parameters-and-locality']]
];
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const RULES=freeze(Object.fromEntries(definitions.map(([name,forms,returnType,effects,obligations])=>[name.toLowerCase(),{name,forms,returnType,effects,obligations,sourceReference:'https://community.bohemia.net/wiki/'+name,nativeVerified:false}])));
const equalityTypes=['number','string','object','group','side','structured-text','config','display','control','location','diary-record','namespace','boolean'];
async function build(raw){
 const files=E.captureSources(raw),[syntax,bindings]=await Promise.all([E.buildExtended(files),B.build(files)]);
 if(JSON.stringify(syntax.files)!==JSON.stringify(bindings.files))throw Error('Source semantic identity mismatch');
 const references=new Map(bindings.references.map(ref=>[ref.source.file+':'+ref.source.start+':'+ref.source.end,ref]));
 const lines=new Map(files.map(f=>{const starts=[0];for(let i=0;i<f.text.length;i++)if(f.text[i]==='\n')starts.push(i+1);return [f.name.replace(/\\/g,'/'),starts];}));
 const span=(file,start,end)=>{const starts=lines.get(file);let lo=0,hi=starts.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(starts[mid]<=start)lo=mid;else hi=mid;}return {file,line:lo+1,column:start-starts[lo]+1,start,end};};
 const report={schema:'command-sqf-source-semantics',version:1,executable:false,evaluationPerformed:false,targetTypesResolved:false,offsetEncoding:'utf16-code-units',coverage:'selected-structural-expression-parts-only',fullStatementEffectsAnalyzed:false,files:syntax.files.map(f=>({...f})),sourceContextFindings:bindings.findings.map(f=>({...f,source:{...f.source}})),entries:[],findings:[],requiredReview:[...REVIEW],summary:{entries:0,nodes:0,commands:0,compatibleShapeChecks:0,unresolvedShapeChecks:0,invalidShapeChecks:0,invalidDependencyNodes:0,callbackObligations:0,executionReady:0}};
 const finding=(code,entry,node,message)=>{if(report.findings.length>=LIMITS.findings)throw Error('Source semantics finding limit exceeded');report.findings.push({code,entryNodeId:entry.nodeId,entryRole:entry.role,nodeId:node.id,source:{...node.source},message});};
 let nodeCount=0,serializedBytes=0;
 for(const expression of syntax.expressions){
  const entry={nodeId:expression.nodeId,role:expression.role,source:{...expression.source},syntaxStatus:expression.status,syntaxIssue:expression.issue?{...expression.issue}:null,root:expression.root,nodes:[],potentialEffects:[],obligations:[],executionReady:false};
  const facts=new Map(),originals=new Map(expression.nodes.map(n=>[n.id,n]));
  const unwrap=id=>{let n=originals.get(id);while(n?.kind==='Group')n=originals.get(n.operand);return n;};
  const matches=(type,allowed)=>type==='unknown'?'unresolved':allowed.includes(type)||allowed.includes('anything')?'compatible':'invalid';
  for(const n of expression.nodes){if(++nodeCount>LIMITS.nodes)throw Error('Source semantics node limit exceeded');
   const node={id:n.id,kind:n.kind,source:span(expression.source.file,expression.source.start+n.start,expression.source.start+n.end),shape:'unknown',shapeEvidence:'unresolved',status:'shape-only',operands:[...(n.elements||n.arguments||(n.operand?[n.operand]:n.left?[n.left,n.right]:[]))],targetType:null,callResolved:false,potentialEffects:[],obligations:[]};
   const children=n.elements||n.arguments||(n.operand?[n.operand]:n.left?[n.left,n.right]:[]);
   const invalidDependency=children.some(id=>['invalid-known-operands','blocked-by-invalid-dependency'].includes(facts.get(id).status));
   function check(forms,ids){let outcomes=forms.filter(f=>f.length===ids.length).map(f=>f.map((allowed,i)=>matches(facts.get(ids[i]).shape,allowed)));if(outcomes.some(out=>out.every(s=>s==='compatible')))return 'compatible-known-shapes';if(outcomes.some(out=>out.every(s=>s!=='invalid')))return 'unresolved-operands';return 'invalid-known-operands';}
   function descriptor(id,minimum,maximum,fields){const raw=unwrap(id);if(raw?.kind!=='Array')return 'unresolved-operands';if(raw.elements.length<minimum)return 'invalid-known-operands';if(maximum!==null&&raw.elements.length>maximum)return 'unresolved-operands';const outcomes=fields.filter(([index])=>index<raw.elements.length).map(([index,types])=>matches(facts.get(raw.elements[index]).shape,types));return outcomes.includes('invalid')?'invalid-known-operands':outcomes.includes('unresolved')?'unresolved-operands':'compatible-known-shapes';}
   if(n.kind==='Literal'){node.shape=n.literalType;node.shapeEvidence='literal-syntax';}
   else if(n.kind==='Symbol'){const ref=references.get(node.source.file+':'+node.source.start+':'+node.source.end);node.bindingEvidence=ref?{status:ref.status,candidateBindingIds:[...ref.candidateBindingIds],bindingResolved:false}:{status:'unresolved-source-context',candidateBindingIds:[],bindingResolved:false};node.potentialEffects.push('read-binding');node.obligations.push('resolve-runtime-binding-type-and-value');}
   else if(n.kind==='CodeValue'){node.shape='code';node.shapeEvidence='opaque-code-value';node.obligations.push('code-body-not-analyzed');}
   else if(n.kind==='Array'){node.shape='array';node.shapeEvidence='array-syntax';node.potentialEffects.push('construct-array-value');}
   else if(n.kind==='Group'){node.shape=facts.get(n.operand).shape;node.shapeEvidence=facts.get(n.operand).shapeEvidence;}
   else if(n.kind==='Unary'){node.operator=n.operator;
    const allowed=['!','not'].includes(n.operator)?['boolean']:n.operator==='+'?['number','array']:['number'];node.status=check([[allowed]],[n.operand]);
    if(node.status==='compatible-known-shapes'){node.shape=['!','not'].includes(n.operator)?'boolean':facts.get(n.operand).shape;node.shapeEvidence='derived-source-shape';}
    if(facts.get(n.operand).shape==='array')node.obligations.push('preserve-array-copy-and-aliasing');if(['+','-'].includes(n.operator))node.obligations.push('numeric-domain-and-precision-review');
   }
   else if(n.kind==='Binary'){node.operator=n.operator;
    const types=[facts.get(n.left).shape,facts.get(n.right).shape];
    if(['+','-','*','/','%'].includes(n.operator)){
     const forms=[[['number'],['number']]];if(['+','-'].includes(n.operator))forms.push([['array'],['array']]);if(n.operator==='+')forms.push([['string'],['string']]);node.status=check(forms,[n.left,n.right]);
     if(node.status==='compatible-known-shapes'){node.shape=types[0];node.shapeEvidence='derived-source-shape';}node.obligations.push('preserve-operator-overload-and-allocation','numeric-domain-and-precision-review');
    }else if(['<','>','<=','>='].includes(n.operator)){node.status=check([[['number'],['number']]],[n.left,n.right]);if(node.status==='compatible-known-shapes'){node.shape='boolean';node.shapeEvidence='derived-source-shape';}}
    else if(['==','!='].includes(n.operator)){
     node.status=types.includes('unknown')?'unresolved-operands':types[0]===types[1]&&equalityTypes.includes(types[0])?'compatible-known-shapes':'invalid-known-operands';if(node.status==='compatible-known-shapes'){node.shape='boolean';node.shapeEvidence='derived-source-shape';}
     if(types.includes('string'))node.obligations.push('preserve-sqf-case-insensitive-string-comparison');if(types.includes('boolean'))node.obligations.push('requires-arma3-2.00-boolean-comparison');if(types.includes('object'))node.obligations.push('preserve-null-object-comparison-behavior');
    }else if(['&&','and','||','or'].includes(n.operator)){
     node.status=check([[['boolean'],['boolean']],[['boolean'],['code']]],[n.left,n.right]);if(node.status==='compatible-known-shapes'){node.shape='boolean';node.shapeEvidence='derived-source-shape';}
     if(types[1]==='code'){node.potentialEffects.push('conditional-code-execution');node.obligations.push('analyze-lazy-code-boolean-return-and-effects');}
     else if(types[1]==='boolean')node.obligations.push('preserve-eager-boolean-operands-vs-lazy-code-overload');
     else if(types[1]==='unknown')node.obligations.push('resolve-logical-overload-and-evaluation-policy');
    }
   }
   else if(n.kind==='Command'){
    report.summary.commands++;node.command=n.command;const rule=RULES[n.command.toLowerCase()];if(!rule)throw Error('Missing source command rule');node.sourceReference=rule.sourceReference;node.status=check(rule.forms,n.arguments);node.potentialEffects.push(...rule.effects);node.obligations.push(...rule.obligations);
    const command=n.command.toLowerCase(),argument=index=>facts.get(n.arguments[index]).shape;
    let descriptorStatus=null;
    if(command==='lbadd'&&n.arity===1)descriptorStatus=descriptor(n.arguments[0],2,2,[[0,['number']],[1,['string']]]);
    if(command==='getvariable'&&argument(1)==='array'){descriptorStatus=descriptor(n.arguments[1],2,2,[[0,['string']]]);node.obligations.push('default-expression-is-evaluated-eagerly');}
    if(command==='addaction'){descriptorStatus=descriptor(n.arguments[1],2,12,[[0,['string']],[1,['code','string']]]);node.potentialEffects.push('deferred-scheduled-action-code','per-frame-unscheduled-condition-string');node.obligations.push('analyze-action-script-and-condition-string-separately');}
    if(command==='addeventhandler'){descriptorStatus=descriptor(n.arguments[1],2,2,[[0,['string']],[1,['code','string']]]);node.potentialEffects.push('deferred-event-callback');node.obligations.push('analyze-event-code-or-string-with-owned-unsubscribe');}
    if(descriptorStatus==='invalid-known-operands')node.status=descriptorStatus;else if(descriptorStatus==='unresolved-operands'&&node.status!=='invalid-known-operands')node.status=descriptorStatus;
    if(command==='isnil'){
     if(argument(0)==='code'){node.potentialEffects.push('execute-code-unscheduled');node.obligations.push('analyze-isnil-code-without-suspension');}
     else if(argument(0)==='string'){node.potentialEffects.push('read-dynamic-binding');node.obligations.push('resolve-name-string-without-evaluation');}
     else node.obligations.push('isnil-may-execute-code-overload');
    }
    if(command==='select'){
     // Only narrow documented forms are shape-classified; other valid forms remain unresolved.
     if(argument(0)==='array'&&argument(1)==='code'){node.potentialEffects.push('execute-filter-code-per-element');node.obligations.push('analyze-filter-return-and-implicit-loop-bindings');}
     else if(argument(0)==='array'&&['number','boolean'].includes(argument(1)))node.obligations.push('resolve-selected-element-type-and-index-domain');
     else node.status=node.status==='invalid-known-operands'?node.status:'unresolved-operands';
    }
    node.declaredReturnShape=rule.returnType;
    if(node.status==='compatible-known-shapes'){node.shape=rule.returnType;node.shapeEvidence=rule.returnType==='unknown'?'unresolved':'documented-return-if-source-call-valid';}
   }
   if(invalidDependency){node.status='blocked-by-invalid-dependency';node.shape='unknown';node.shapeEvidence='unresolved';report.summary.invalidDependencyNodes++;}
   if(node.status==='invalid-known-operands'){node.shape='unknown';node.shapeEvidence='unresolved';report.summary.invalidShapeChecks++;finding('KNOWN_OPERAND_SHAPE_MISMATCH',entry,node,'Known source operand/descriptor shapes do not match the bounded documented rule.');}
   else if(node.status==='unresolved-operands'){report.summary.unresolvedShapeChecks++;finding('UNRESOLVED_OPERAND_SHAPE',entry,node,'Runtime binding types, descriptor fields or overload semantics remain unresolved.');}
   else if(node.status==='compatible-known-shapes')report.summary.compatibleShapeChecks++;
   if(node.obligations.some(s=>/code|callback|condition-string/.test(s)))report.summary.callbackObligations++;
   node.executionReady=false;entry.nodes.push(node);facts.set(node.id,node);
  }
  entry.potentialEffects=[...new Set(entry.nodes.flatMap(n=>n.potentialEffects))].sort();entry.obligations=[...new Set(entry.nodes.flatMap(n=>n.obligations))].sort();
  serializedBytes+=Buffer.byteLength(JSON.stringify(entry));if(serializedBytes>LIMITS.bytes)throw Error('Source semantics report byte limit exceeded');report.entries.push(entry);
 }
 report.summary.entries=report.entries.length;report.summary.nodes=nodeCount;
 if(Buffer.byteLength(JSON.stringify(report))>LIMITS.bytes)throw Error('Source semantics report byte limit exceeded');return require('./sqf-source-semantics-validation').validate(report);
}
module.exports={LIMITS,REVIEW,RULES,build};
