/* Source value-shape IR review. No execution, statement lowering or target code generation. */
'use strict';
const E=require('./sqf-expression-ast'),B=require('./sqf-binding-review');
const LIMITS=Object.freeze({nodes:20000,bytes:8388608});
async function build(raw){
 const files=E.captureSources(raw),[expressions,bindings]=await Promise.all([E.build(files),B.build(files)]),texts=new Map(files.map(f=>[f.name.replace(/\\/g,'/'),f.text]));
 if(JSON.stringify(expressions.files)!==JSON.stringify(bindings.files))throw Error('Value IR source identity mismatch');
 const refs=new Map(bindings.references.map(r=>[r.source.file+':'+r.source.start+':'+r.source.end,r]));
 const report={schema:'command-sqf-value-ir-review',version:1,executable:false,controlFlowLowered:false,evaluationPerformed:false,offsetEncoding:'utf16-code-units',files:expressions.files.map(f=>({...f})),entries:[],requiredReview:['source-types-effects-and-context','numeric-precision-and-domain','target-type-and-resource-mapping','control-flow-and-lifecycle','native-compile-and-behavior'],summary:{entries:0,nodes:0,sourceShapeKnownRoots:0,unknownShapeRoots:0,unsupportedExpressions:0,bindingCandidateLinks:0,executionReady:0}};
 let totalNodes=0,totalBytes=0;
 for(const expression of expressions.expressions){
  const entry={nodeId:expression.nodeId,role:expression.role,source:{...expression.source},status:expression.status==='recognized'?'value-shape-review':'unsupported-expression',root:null,nodes:[],issue:expression.issue?{...expression.issue}:null,executionReady:false};
  const id=value=>'value-'+value.slice(5),get=value=>entry.nodes[Number(value.slice(6))];
  for(const n of expression.nodes){if(++totalNodes>LIMITS.nodes)throw Error('Value IR node limit exceeded');
   const source={file:expression.source.file,start:expression.source.start+n.start,end:expression.source.start+n.end};
   const value={id:id(n.id),kind:n.kind,source,sourceType:'unknown',targetType:null,evaluationPerformed:false};
   if(n.kind==='Literal'){value.sourceType='source-'+n.literalType;value.literalValue=n.value;value.sourceLexeme=texts.get(source.file).slice(source.start,source.end);if(n.literalType==='number')value.numericRepresentation='unverified-source-precision';}
   else if(n.kind==='Symbol'){value.name=n.name;const r=refs.get(source.file+':'+source.start+':'+source.end);value.bindingEvidence=r?{status:r.status,candidateBindingIds:[...r.candidateBindingIds],bindingResolved:false}:{status:'unresolved-source-context',candidateBindingIds:[],bindingResolved:false};report.summary.bindingCandidateLinks+=value.bindingEvidence.candidateBindingIds.length;}
   else if(n.kind==='Array'){value.elements=n.elements.map(id);value.sourceType='source-array';value.elementSourceTypes=[...new Set(value.elements.map(child=>get(child).sourceType))].sort();value.targetElementType=null;}
   else if(n.kind==='Group'){value.operand=id(n.operand);value.sourceType=get(value.operand).sourceType;}
   else if(n.kind==='Unary'){value.operator=n.operator;value.operand=id(n.operand);value.operatorRule=get(value.operand).sourceType==='source-number'?'numeric-shape-only':'unresolved-overload';if(value.operatorRule==='numeric-shape-only')value.sourceType='source-number';}
   else if(n.kind==='Binary'){value.operator=n.operator;value.left=id(n.left);value.right=id(n.right);value.operatorRule=[get(value.left).sourceType,get(value.right).sourceType].every(t=>t==='source-number')?'numeric-shape-only':'unresolved-overload';if(value.operatorRule==='numeric-shape-only')value.sourceType='source-number';}
   entry.nodes.push(value);
  }
  if(expression.root){entry.root=id(expression.root);if(get(entry.root).sourceType==='unknown')report.summary.unknownShapeRoots++;else report.summary.sourceShapeKnownRoots++;}else report.summary.unsupportedExpressions++;
  totalBytes+=Buffer.byteLength(JSON.stringify(entry),'utf8');if(totalBytes>LIMITS.bytes)throw Error('Value IR report byte limit exceeded');report.entries.push(entry);
 }
 report.summary.entries=report.entries.length;report.summary.nodes=totalNodes;
 if(Buffer.byteLength(JSON.stringify(report),'utf8')>LIMITS.bytes)throw Error('Value IR report byte limit exceeded');return report;
}
module.exports={LIMITS,build};
