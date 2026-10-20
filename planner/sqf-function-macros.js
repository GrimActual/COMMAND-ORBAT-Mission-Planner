/* Bounded token macros for offline source review. No SQF execution or native promotion. */
'use strict';
const LIMITS=Object.freeze({definitions:256,parameters:8,bodyCharacters:4096,tokens:32768,expansions:4096,depth:32});
const NAME=/^[A-Za-z_][A-Za-z0-9_]{0,127}$/;
function tokens(text,offset,source,block){
 const result=[];let at=0;
 const add=(kind,value,start)=>{if(result.length>=LIMITS.tokens)block('MACRO_TOKEN_LIMIT',source,'Macro token limit exceeded');result.push({kind,value,start:offset+start,end:offset+at});};
 while(at<text.length){const start=at,c=text[at];if(/\s/.test(c)){at++;continue;}
  if(c==="'")block('MACRO_SINGLE_QUOTED_STRING',source,'Single-quoted preprocessing has Arma-specific expansion rules and remains manual');
  if(c==='"'){at++;let closed=false;while(at<text.length){if(text[at++]==='"'){if(text[at]==='"')at++;else{closed=true;break;}}}if(!closed)block('MACRO_UNCLOSED_STRING',source,'Unclosed macro string');add('string',text.slice(start,at),start);continue;}
  if(/[A-Za-z_]/.test(c)){while(at<text.length&&/[A-Za-z0-9_]/.test(text[at]))at++;add('name',text.slice(start,at),start);continue;}
  if(/[0-9]/.test(c)){at++;while(at<text.length&&/[A-Za-z0-9_.]/.test(text[at]))at++;add('number',text.slice(start,at),start);continue;}
  if(text.slice(at,at+2)==='##'){at+=2;add('paste','##',start);continue;}
  if(c.charCodeAt(0)>127)block('MACRO_NONASCII_TOKEN',source,'Non-ASCII tokens outside quoted strings require review');
  at++;add('symbol',c,start);
 }return result;
}
function create(markers,block,location,sourceView){
 const definitions=new Map();let operations=0;
 const reject=(source,message)=>block('UNSUPPORTED_FUNCTION_MACRO',source,message);
 const signature=()=>JSON.stringify([...markers].sort().map(n=>[n,definitions.get(n)?.signature??null]));
 function define(payload,source,active,includeOccurrenceId){
  if(!active)return;
  const head=/^([A-Za-z_][A-Za-z0-9_]*)(\([^)]*\))?(?:\s+([\s\S]*))?$/.exec(payload);
  if(!head||!NAME.test(head[1])||head[1].startsWith('__'))reject(source,'Expected a bounded macro definition with explicit parameters');
  const name=head[1],params=head[2]===undefined?null:head[2].slice(1,-1).trim()===''?[]:head[2].slice(1,-1).split(',').map(s=>s.trim()),body=head[3]||'';
  if(body.length>LIMITS.bodyCharacters||params&&(params.length>LIMITS.parameters||params.some(p=>!NAME.test(p)||p.startsWith('__'))||new Set(params).size!==params.length))reject(source,'Variadic, duplicate, reserved or excessive parameters are unsupported');
  const bodyTokens=tokens(body,0,source,block),definition={name,params,body:bodyTokens,source,includeOccurrenceId,signature:JSON.stringify([params,bodyTokens.map(t=>[t.kind,t.value])])};
  if(markers.has(name)&&(!definitions.has(name)||definitions.get(name).signature!==definition.signature))reject(source,'Conflicting or externally defined macro requires explicit undef');
  if(!markers.has(name)&&markers.size>=LIMITS.definitions)reject(source,'Macro definition limit exceeded');
  definitions.set(name,definition);markers.add(name);
 }
 function replacements(file,start,end){
  const source=location(file,start,end),original=tokens(sourceView(file).slice(start,end),start,source,block),trace=[];
  function expand(stream,nesting=0){
  if(nesting>LIMITS.depth)block('MACRO_DEPTH_LIMIT',source,'Macro argument expansion depth exceeded');
  for(let at=0;at<stream.length;){const token=stream[at];if(token.kind!=='name'){at++;continue;}const name=token.value;
   if(name.startsWith('__'))block('BUILTIN_MACRO_REQUIRES_REVIEW',token.source,'Engine and compiler builtin substitutions remain manual; no builtin is evaluated');
   if(!markers.has(name)){at++;continue;}const def=definitions.get(name);
   if(!def)reject(token.source,'An externally defined marker has no selected replacement definition');
   if(token.disabled.includes(name))block('MACRO_RECURSION',token.source,'Recursive macro expansion requires review');
   let stop=at+1,args=null;
   if(def.params!==null){
    if(stream[stop]?.value!=='('){at++;continue;}const stack=['('];args=[];let current=[];stop++;
    while(stop<stream.length&&stack.length){const t=stream[stop++];if(t.kind==='symbol'&&'([{'.includes(t.value)){stack.push(t.value);current.push(t);}
     else if(t.kind==='symbol'&&')]}'.includes(t.value)){const open=stack.pop();if(open!==({')':'(',']':'[','}':'{'})[t.value])reject(t.source,'Unbalanced function-macro arguments');if(stack.length)current.push(t);else if(current.length||args.length||def.params.length)args.push(current);}
     else if(t.kind==='symbol'&&t.value===','&&stack.length===1){args.push(current);current=[];}else current.push(t);
    }
    if(stack.length||args.length!==def.params.length||args.some(a=>!a.length))reject(token.source,'Function macro needs its complete explicit argument list; empty arguments remain manual');
   }
   if(++operations>LIMITS.expansions)block('MACRO_EXPANSION_LIMIT',token.source,'Macro expansion operation limit exceeded');
   if(token.disabled.length>=LIMITS.depth)block('MACRO_DEPTH_LIMIT',token.source,'Macro expansion depth exceeded');
   const last=stream[stop-1],invocation=location(file,token.source.start,Math.max(token.source.end,last.source.end)),bound=new Map((def.params||[]).map((p,i)=>[p,args[i]])),prescanned=new Map(),disabled=[...token.disabled,name],expanded=[];
   const prescan=p=>{if(!prescanned.has(p))prescanned.set(p,expand(bound.get(p).map(t=>({...t})),nesting+1));return prescanned.get(p);};
   const copy=t=>({...t,source:invocation,disabled:[...new Set([...(t.disabled||[]),...disabled])]});
   for(let i=0;i<def.body.length;i++){const t=def.body[i];
    if(t.value==='#'){
     const arg=bound.get(def.body[++i]?.value);if(!arg||arg.length!==1||arg[0].kind!=='name')reject(invocation,'Stringification currently requires one literal identifier argument');
     expanded.push(copy({kind:'string',value:'"'+arg[0].value+'"'}));continue;
    }
    if(t.value==='##'){
     const left=expanded.pop(),next=def.body[++i],arg=bound.get(next?.value),right=arg?arg.length===1?arg[0]:null:next;
     if(!left||!right||left.kind!=='name'||right.kind!=='name'||!NAME.test(left.value+right.value))reject(invocation,'Token pasting requires two bounded identifier tokens');
     expanded.push(copy({kind:'name',value:left.value+right.value}));continue;
    }
    const arg=bound.get(t.value);if(arg)expanded.push(...(def.body[i+1]?.value==='##'?arg:prescan(t.value)).map(copy));else expanded.push(copy(t));
   }
   trace.push({name,invocation,definition:def.source,definitionIncludeOccurrenceId:def.includeOccurrenceId});
   stream.splice(at,stop-at,...expanded);if(stream.length>LIMITS.tokens)block('MACRO_TOKEN_LIMIT',invocation,'Expanded macro token limit exceeded');
  }return stream;
  }
  const stream=expand(original.map(t=>({...t,source:location(file,t.start,t.end),disabled:[]})));
  if(!trace.length)return [];
  let text='';const tokenOrigins=[];for(const t of stream){if(text)text+=' ';const outputStart=text.length;text+=t.value;tokenOrigins.push({outputStart,outputEnd:text.length,source:t.source,macroStack:t.disabled});}
  return [{source,text,trace,tokenOrigins}];
 }
 return {signature,define,undef:name=>definitions.delete(name),replacements};
}
module.exports={LIMITS,create};
