/* Explicit closed-set marker conditions; optional scalar-definition handler. No source execution. */
'use strict';
const NAME=/^[A-Za-z_][A-Za-z0-9_]{0,127}$/;
const LIMITS=Object.freeze({names:256,depth:64,steps:8192});
function validName(name){return typeof name==='string'&&NAME.test(name)&&!name.startsWith('__');}
function environment(raw){
 if(!raw||![Object.prototype,null].includes(Object.getPrototypeOf(raw)))throw Error('Expected plain conditional environment');
 const d=Object.getOwnPropertyDescriptors(raw);
 if(Reflect.ownKeys(d).sort().join(',')!=='defined,mode'||Object.values(d).some(x=>!x.enumerable||!('value'in x))||d.mode.value!=='explicit-closed-set')throw Error('Declare an explicit-closed-set conditional environment');
 const names=d.defined.value;
 if(!Array.isArray(names)||Object.getPrototypeOf(names)!==Array.prototype||names.length>LIMITS.names)throw Error('Conditional name budget exceeded');
 const ds=Object.getOwnPropertyDescriptors(names),seen=new Set();
 if(Reflect.ownKeys(ds).length!==names.length+1)throw Error('Sparse or extended conditional names');
 for(let i=0;i<names.length;i++){if(!ds[i]||!('value'in ds[i])||!validName(ds[i].value)||seen.has(ds[i].value))throw Error('Invalid or duplicate conditional marker');seen.add(ds[i].value);}
 return {mode:'explicit-closed-set',defined:[...seen].sort()};
}
function state(names,block,record,definitions=null){
 const stack=[];let active=true;
 const reject=(source,detail)=>block('UNSUPPORTED_CONDITIONAL_SUBSET',source,detail);
 function predicate(payload,source){
  if(definitions?.predicate)return definitions.predicate(payload,source);
  if(payload==='0'||payload==='1')return payload==='1';
  const match=/^(!\s*)?defined\s*(?:\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)|\s+([A-Za-z_][A-Za-z0-9_]*))$/.exec(payload);
  if(!match||!validName(match[2]||match[3]))reject(source,'Only 0, 1, defined(NAME), defined NAME and their !defined forms are supported.');
  const yes=names.has(match[2]||match[3]);return match[1]?!yes:yes;
 }
 return {
  get active(){return active;},
  directive(command,payload,source){
   let value=null;
   if(command==='if'||command==='ifdef'||command==='ifndef'){
    if(stack.length>=LIMITS.depth)reject(source,'Conditional nesting limit exceeded.');
    if(command==='if')value=predicate(payload,source);else{if(!validName(payload))reject(source,'Expected one literal marker name.');value=names.has(payload);if(command==='ifndef')value=!value;}
    stack.push({parent:active,taken:value,otherwise:false});active=active&&value;
   }else if(command==='elif'){
    value=predicate(payload,source);const top=stack.at(-1);if(!top||top.otherwise)reject(source,'Unmatched elif or elif after else.');active=top.parent&&!top.taken&&value;top.taken=top.taken||value;
   }else if(command==='else'){
    const top=stack.at(-1);if(payload||!top||top.otherwise)reject(source,'Unexpected else payload, duplicate else or unmatched else.');active=top.parent&&!top.taken;top.taken=true;top.otherwise=true;
   }else if(command==='endif'){
    if(payload||!stack.length)reject(source,'Unexpected endif payload or unmatched endif.');active=stack.pop().parent;
   }else if(command==='define'||command==='undef'){
    if(command==='define'&&definitions){definitions.define(payload,source,active);record({command,source,active,value});return;}
    if(!validName(payload))reject(source,'Only empty marker definitions and literal undef names are supported; replacement/function macros require another stage.');
    if(active){if(command==='define'){if(!names.has(payload)&&names.size>=LIMITS.names)reject(source,'Conditional marker budget exceeded.');names.add(payload);}else{names.delete(payload);if(definitions)definitions.undef(payload);}}
   }else reject(source,'Directive '+command+' is outside the conditional subset.');
   record({command,source,active,value});
  },
  finish(source){if(stack.length)reject(source,'Unclosed conditional block; conditional scopes cannot cross include files.');}
 };
}
module.exports={LIMITS,environment,state};
