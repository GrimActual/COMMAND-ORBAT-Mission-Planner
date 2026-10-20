/* Read-only bounded expression syntax; deliberately no evaluation or native lowering. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./sqf-structural-ast'));else root.CompanionSQFExpressions=factory(root.CompanionSQFAST);})(globalThis,AST=>{
'use strict';
const LIMITS=Object.freeze({characters:262144,tokens:8192,nodes:8192,depth:64,expressions:10000,reportBytes:8388608});
const REVIEW=Object.freeze(['variable-scopes-and-bindings','operand-types-and-effects','command-signatures-and-precedence','scheduling-and-locality','native-adapter-semantics']);
const precedence=Object.freeze({'+':6,'-':6,'*':7,'/':7,'%':7});
const extendedPrecedence=Object.freeze({...precedence,'==':3,'!=':3,'>':3,'<':3,'>=':3,'<=':3,'&&':2,and:2,'||':1,or:1});
const COMMANDS=Object.freeze(Object.fromEntries([
 ['player',[0]],['hasInterface',[0]],['objNull',[0]],['nil',[0]],['playableUnits',[0]],['switchableUnits',[0]],
 ['isNull',[1]],['isNil',[1]],['vehicle',[1]],['findDisplay',[1]],['count',[1]],
 ['displayCtrl',[2]],['lbAdd',[1,2]],['getVariable',[2]],['arrayIntersect',[2]],['select',[2]],['addAction',[2]],['addEventHandler',[2]]
].map(([name,arities])=>[name.toLowerCase(),Object.freeze({name,arities:Object.freeze(arities),sourceReference:'https://community.bohemia.net/wiki/'+name,operandTypesResolved:false,nativeAdapterVerified:false})])));
function parse(text){return parseSyntax(text,false);}
function parseExtended(text){return parseSyntax(text,true);}
function parseSyntax(text,extended){
 if(typeof text!=='string')throw Error('Expression source must be text');
 const reject=(message,offset)=>{const e=Error(message);e.offset=offset;throw e;};
 let at=0;const tokens=[],nodes=[];
 const add=(kind,value,start,end)=>{if(tokens.length>=LIMITS.tokens)reject('Expression token limit exceeded',start);tokens.push({kind,value,start,end});};
 try{
  if(text.length>LIMITS.characters)reject('Expression source limit exceeded',0);
  while(at<text.length){
   const start=at,c=text[at];if(/\s/.test(c)){at++;continue;}
   if(text.startsWith('//',at)){while(at<text.length&&text[at]!=='\n')at++;continue;}
   if(text.startsWith('/*',at)){const end=text.indexOf('*/',at+2);if(end<0)reject('Unterminated expression comment',at);at=end+2;continue;}
   if(c==='"'||c==="'"){const quote=c;let value='',closed=false;at++;while(at<text.length){if(text[at]===quote){if(text[at+1]===quote){value+=quote;at+=2;}else{at++;closed=true;break;}}else value+=text[at++];}if(!closed)reject('Unterminated expression string',start);add('string',value,start,at);continue;}
   if(extended&&c==='{'){
    let depth=0,closed=false;
    while(at<text.length){
     if(text.startsWith('//',at)){while(at<text.length&&text[at]!=='\n')at++;continue;}
     if(text.startsWith('/*',at)){const end=text.indexOf('*/',at+2);if(end<0)reject('Unterminated code-value comment',at);at=end+2;continue;}
     const ch=text[at];
     if(ch==='"'||ch==="'"){const quote=ch;let quoted=false;at++;while(at<text.length){if(text[at]===quote){if(text[at+1]===quote)at+=2;else{at++;quoted=true;break;}}else at++;}if(!quoted)reject('Unterminated code-value string',at);continue;}
     at++;if(ch==='{'){if(++depth>LIMITS.depth)reject('Code-value nesting limit exceeded',at-1);}else if(ch==='}'&&--depth===0){closed=true;break;}
    }
    if(!closed)reject('Unterminated code value',start);add('code',null,start,at);continue;
   }
   if(extended&&['==','!=','>=','<=','&&','||'].includes(text.slice(at,at+2))){at+=2;add('symbol',text.slice(start,at),start,at);continue;}
   const number=text.slice(at).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
   if(number){at+=number[0].length;const value=Number(number[0]);if(!Number.isFinite(value))reject('Non-finite numeric literal',start);add('number',value,start,at);continue;}
   const word=text.slice(at).match(/^[A-Za-z_][A-Za-z_0-9]*/);
   if(word){at+=word[0].length;add('word',word[0],start,at);continue;}
   if(('+-*/%(),[]'+(extended?'!<>':'')).includes(c)){add('symbol',c,start,++at);continue;}
   reject('Unsupported expression token',start);
  }
  let cursor=0;
  const emit=(kind,start,end,extra={})=>{if(nodes.length>=LIMITS.nodes)reject('Expression node limit exceeded',start);const id='expr-'+nodes.length;nodes.push({id,kind,start,end,...extra});return id;};
  const get=id=>nodes[Number(id.slice(5))];
  const commandNode=(command,args,start,end)=>emit('Command',start,end,{command:command.name,arity:args.length,arguments:args,sourceReference:command.sourceReference,signatureStatus:'syntax-arity-only',operandTypesResolved:false,nativeAdapterVerified:false});
  const take=value=>tokens[cursor]?.value===value&&tokens[cursor]?.kind==='symbol'?(cursor++,true):false;
  function expression(min=0,depth=0){
   if(depth>=LIMITS.depth)reject('Expression nesting limit exceeded',tokens[cursor]?.start??text.length);
   const t=tokens[cursor++];if(!t)reject('Missing expression operand',text.length);let left;
   if(t.kind==='number'||t.kind==='string')left=emit('Literal',t.start,t.end,{value:t.value,literalType:t.kind});
   else if(t.kind==='code')left=emit('CodeValue',t.start,t.end,{bodyStatus:'opaque-not-invoked',contextResolved:false});
   else if(t.kind==='word'){
    const lower=t.value.toLowerCase();
    if(['true','false'].includes(lower))left=emit('Literal',t.start,t.end,{value:lower==='true',literalType:'boolean'});
    else if(extended&&lower==='not'){const operand=expression(10,depth+1);left=emit('Unary',t.start,get(operand).end,{operator:'not',operand});}
    else if(extended&&Object.hasOwn(COMMANDS,lower)&&COMMANDS[lower].arities.includes(0))left=commandNode(COMMANDS[lower],[],t.start,t.end);
    else if(extended&&Object.hasOwn(COMMANDS,lower)&&COMMANDS[lower].arities.includes(1)){const operand=expression(10,depth+1);left=commandNode(COMMANDS[lower],[operand],t.start,get(operand).end);}
    else if(/^_[A-Za-z0-9_]+$/.test(t.value))left=emit('Symbol',t.start,t.end,{name:t.value,binding:'unresolved'});
    else reject('Command or namespace symbol requires a verified signature',t.start);
   }
   else if(t.kind==='symbol'&&['+','-',...(extended?['!']:[])].includes(t.value)){const operand=expression(10,depth+1);left=emit('Unary',t.start,get(operand).end,{operator:t.value,operand});}
   else if(t.kind==='symbol'&&t.value==='('){const operand=expression(0,depth+1);if(!take(')'))reject('Expected closing parenthesis',tokens[cursor]?.start??text.length);left=emit('Group',t.start,tokens[cursor-1].end,{operand});}
   else if(t.kind==='symbol'&&t.value==='['){const elements=[];if(!take(']')){do{elements.push(expression(0,depth+1));}while(take(','));if(!take(']'))reject('Expected closing array bracket',tokens[cursor]?.start??text.length);}left=emit('Array',t.start,tokens[cursor-1].end,{elements});}
   else reject('Unsupported expression operand',t.start);
   while(cursor<tokens.length){const op=tokens[cursor],key=op.kind==='word'?op.value.toLowerCase():op.value,table=extended?extendedPrecedence:precedence;
    const cmd=extended&&op.kind==='word'&&Object.hasOwn(COMMANDS,key)&&COMMANDS[key].arities.includes(2)?COMMANDS[key]:null;
    const priority=cmd?4:(op.kind==='symbol'||extended&&['and','or'].includes(key))&&Object.hasOwn(table,key)?table[key]:null;
    if(priority===null||priority<min)break;cursor++;const right=expression(priority+1,depth+1);
    left=cmd?commandNode(cmd,[left,right],get(left).start,get(right).end):emit('Binary',get(left).start,get(right).end,{operator:key,left,right});
   }
   return left;
  }
  const root=expression();if(cursor!==tokens.length)reject('Unconsumed syntax or unsupported command',tokens[cursor].start);
  return {status:'recognized',executable:false,semanticStatus:'unresolved',root,nodes,issue:null};
 }catch(error){return {status:'unsupported',executable:false,semanticStatus:'unresolved',root:null,nodes:[],issue:{message:error.message,offset:error.offset??at}};}
}
function captureSources(raw){
 // Capture validated data properties before the first asynchronous hash yields.
 if(!Array.isArray(raw)||Object.getPrototypeOf(raw)!==Array.prototype||!raw.length||raw.length>64)throw Error('Invalid expression source array');
 const keys=Reflect.ownKeys(raw).filter(k=>k!=='length');
 if(keys.length!==raw.length||keys.some(k=>typeof k!=='string'||!/^\d+$/.test(k)||Number(k)>=raw.length||!('value' in Object.getOwnPropertyDescriptor(raw,k))))throw Error('Invalid expression source fields');
 const files=raw.map(file=>{
  if(!file||![Object.prototype,null].includes(Object.getPrototypeOf(file)))throw Error('Invalid expression source record');
  const d=Object.getOwnPropertyDescriptors(file);
  if(Reflect.ownKeys(file).length!==2||!d.name||!d.text||!('value' in d.name)||!('value' in d.text)||!d.name.enumerable||!d.text.enumerable||typeof d.name.value!=='string'||typeof d.text.value!=='string')throw Error('Invalid expression source data');
  return {name:d.name.value,text:d.text.value};
 });
 return files;
}
async function build(raw){return buildProfile(raw,false);}
async function buildExtended(raw){return buildProfile(raw,true);}
async function buildProfile(raw,extended){
 const files=captureSources(raw);
 // The structural builder validates plain input, filenames, aggregate sizes and source hashes first.
 const structural=await AST.build(files),sources=new Map(files.map(f=>[f.name.replace(/\\/g,'/'),f.text]));
 const report={schema:'command-sqf-expression-review',version:extended?2:1,executable:false,syntaxOnly:true,offsetEncoding:'utf16-code-units',requiredReview:[...REVIEW],files:structural.files.map(f=>({...f})),expressions:[],summary:{recognized:0,unsupported:0,executionReady:0}};
 let serializedBytes=0;
 for(const node of structural.nodes){for(const part of node.parts){if(['target','counter'].includes(part.role))continue;
  if(report.expressions.length>=LIMITS.expressions)throw Error('Expression review count limit exceeded');
  const entry={nodeId:node.id,role:part.role,source:{...part.source},...(extended?parseExtended:parse)(sources.get(part.source.file).slice(part.source.start,part.source.end))};
  // Offsets inside each expression tree are relative to its full source span, never its short preview.
  serializedBytes+=new TextEncoder().encode(JSON.stringify(entry)).length;
  if(serializedBytes>LIMITS.reportBytes)throw Error('Expression review byte limit exceeded');
  report.expressions.push(entry);report.summary[entry.status]++;
 }}
 if(new TextEncoder().encode(JSON.stringify(report)).length>LIMITS.reportBytes)throw Error('Expression review byte limit exceeded');
 return report;
}
return {LIMITS,REVIEW,COMMANDS,parse,parseExtended,build,buildExtended,captureSources};
});
