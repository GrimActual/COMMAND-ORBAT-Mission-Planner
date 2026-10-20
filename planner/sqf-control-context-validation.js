/* Source-bound replay validation. No source-free authenticity, runtime semantics or execution authority. */
'use strict';
const {types}=require('node:util'),F=require('./sqf-control-context');
const LIMITS=Object.freeze({depth:64,values:1000000,arrayItems:50000,bytes:F.LIMITS.reportBytes});
function snapshot(raw){
 let result,values=0,units=0;const active=new WeakSet(),stack=[{value:raw,depth:0,parent:null,key:null}];
 const put=(frame,value)=>{if(frame.parent===null)result=value;else frame.parent[frame.key]=value;};
 while(stack.length){const frame=stack.pop();if(frame.exit){active.delete(frame.exit);continue;}const value=frame.value;
  if(frame.depth>LIMITS.depth||++values>LIMITS.values)throw Error('IR JSON shape/depth budget exceeded');
  if(value===null||typeof value==='boolean'){put(frame,value);continue;}
  if(typeof value==='number'){if(!Number.isFinite(value))throw Error('IR JSON number must be finite');put(frame,Object.is(value,-0)?0:value);continue;}
  if(typeof value==='string'){units+=value.length;if(units>LIMITS.bytes)throw Error('IR JSON text budget exceeded');put(frame,value);continue;}
  if(typeof value!=='object'||types.isProxy(value))throw Error('IR must contain plain JSON data');
  if(active.has(value))throw Error('Cyclic IR JSON data rejected');
  const array=Array.isArray(value),prototype=Object.getPrototypeOf(value);
  if(array?prototype!==Array.prototype:![Object.prototype,null].includes(prototype))throw Error('IR JSON prototype rejected');
  const descriptors=Object.getOwnPropertyDescriptors(value),keys=Reflect.ownKeys(descriptors);
  if(array&&(value.length>LIMITS.arrayItems||keys.length!==value.length+1))throw Error('IR JSON arrays must be bounded and dense');
  const out=array?new Array(value.length):Object.create(null);put(frame,out);active.add(value);stack.push({exit:value});
  for(let i=keys.length-1;i>=0;i--){const key=keys[i];if(array&&key==='length')continue;const descriptor=descriptors[key];if(typeof key!=='string'||!descriptor.enumerable||!('value'in descriptor)||array&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length))throw Error('IR JSON accessor/field rejected');units+=key.length;if(units>LIMITS.bytes)throw Error('IR JSON text budget exceeded');stack.push({value:descriptor.value,depth:frame.depth+1,parent:out,key});}
 }
 const encoded=JSON.stringify(result);if(Buffer.byteLength(encoded,'utf8')>LIMITS.bytes)throw Error('IR JSON byte budget exceeded');return {value:result,encoded};
}
function matchesReplay(imported,expected){
 const stack=[[imported,expected]];
 while(stack.length){const [a,b]=stack.pop();if(a===b)continue;if(a===null||b===null||typeof a!==typeof b||typeof a!=='object')return false;if(Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);if(keys.length!==Object.keys(b).length)return false;for(const key of keys){if(!Object.hasOwn(b,key))return false;stack.push([a[key],b[key]]);}}
 return true;
}
async function validate(raw,files){
 // Capture both arguments before the source builder's asynchronous hash can yield.
 const imported=snapshot(raw),source=snapshot({files}).value;
 if(imported.value?.schema!=='command-sqf-control-context-ir'||imported.value.version!==1)throw Error('Expected control/context IR version 1');
 const expected=await F.build(source.files);
 if(!matchesReplay(imported.value,expected))throw Error('IR does not match source replay: fields, graph, bindings, types or review gates differ');
 // Return the fresh source-produced report, not untrusted records or another full clone.
 return expected;
}
async function verify(raw,files){const report=await validate(raw,files);return {schema:'command-sqf-control-context-verification',version:1,executable:false,sourceReplayMatched:true,nativeVerified:false,reviewContextSHA256:report.reviewContextSHA256,summary:{nodes:report.summary.nodes,contexts:report.summary.contexts,expressionSlots:report.summary.expressionSlots,executionReady:0}};}
module.exports={LIMITS,snapshot,validate,verify};
