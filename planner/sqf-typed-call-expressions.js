/* Boolean expressions and closed literal-array calls. No general engine commands. */
'use strict';
const S=require('./sqf-migration'),D=require('./sqf-source-dependencies');
const LIMITS=Object.freeze({characters:8192,tokens:1024,nodes:256,depth:32});
function literal(value){
 if(typeof value==='boolean')return {targetType:'bool',value,code:String(value)};
 if(typeof value==='number'&&Number.isInteger(value)&&Math.abs(value)<=16777215)return {targetType:'int',value,code:String(value)};
 if(typeof value==='string'&&value.length<=256&&/^[\x20-\x7e]*$/.test(value))return {targetType:'string',value,code:JSON.stringify(value)};
 throw Error('Only Boolean, bounded exact integer or short printable ASCII string values are supported');
}
function parse(text){
 if(typeof text!=='string'||text.length>LIMITS.characters||D.sourceLexicalView(text).unterminated)throw Error('Invalid typed call expression');
 const tokens=S.tokenize(text);if(tokens.length>LIMITS.tokens)throw Error('Typed call token limit exceeded');
 const nodes=[];let at=0;const add=(kind,start,end,extra={})=>{if(nodes.length>=LIMITS.nodes)throw Error('Typed call node limit exceeded');const n={id:nodes.length,kind,start,end,...extra};nodes.push(n);return n;};
 const take=v=>tokens[at]?.kind==='symbol'&&tokens[at]?.value===v?(at++,true):false;
 function expression(min=0,depth=0){
  if(depth>LIMITS.depth)throw Error('Typed call depth limit exceeded');const t=tokens[at++];if(!t)throw Error('Missing typed call operand');let left;
  const key=t.kind==='word'?t.value.toLowerCase():t.value;
  if(t.kind==='word'&&['true','false'].includes(key))left=add('Value',t.start,t.end,literal(key==='true'));
  else if(t.kind==='string')left=add('Value',t.start,t.end,literal(t.value));
  else if(t.kind==='number'&&/^-?(?:0|[1-9][0-9]*)$/.test(t.value))left=add('Value',t.start,t.end,literal(Number(t.value))); 
  else if(t.kind==='word'&&/^_[A-Za-z][A-Za-z0-9_]*$/.test(t.value))left=add('Local',t.start,t.end,{name:t.value});
  else if((t.kind==='word'&&key==='not')||(t.kind==='symbol'&&key==='!')){const value=expression(10,depth+1);left=add('Not',t.start,value.end,{operand:value.id});}
  else if(t.kind==='symbol'&&key==='('){const value=expression(0,depth+1);if(!take(')'))throw Error('Missing typed call closing parenthesis');left=add('Group',t.start,tokens[at-1].end,{operand:value.id});}
  else if(t.kind==='symbol'&&key==='['){const args=[];if(!take(']')){do{args.push(expression(0,depth+1).id);}while(take(','));if(!take(']'))throw Error('Missing typed call array bracket');}left=add('Arguments',t.start,tokens[at-1].end,{arguments:args});}
  else throw Error('Only Boolean values, initialized locals and closed calls are supported');
  while(at<tokens.length){const op=tokens[at],k=op.kind==='word'?op.value.toLowerCase():op.kind==='symbol'?op.value:'',p=k==='call'?4:['&&','and'].includes(k)?2:['||','or'].includes(k)?1:-1;if(p<min)break;at++;
   if(k==='call'){const name=tokens[at++];if(left.kind!=='Arguments'||name?.kind!=='word'||!/^[A-Za-z][A-Za-z0-9_]*_fnc_[A-Za-z0-9_]+$/i.test(name.value))throw Error('Call requires a literal argument array and selected TAG_fnc_name target');left=add('Call',left.start,name.end,{sourceTarget:name.value,arguments:left.arguments});}
   else{const right=expression(p+1,depth+1);left=add('BooleanBinary',left.start,right.end,{operator:['&&','and'].includes(k)?'&&':'||',left:left.id,right:right.id});}
  }
  return left;
 }
 const root=expression();if(at!==tokens.length)throw Error('Unsupported or unconsumed typed call syntax');return {root:root.id,nodes};
}
function lower(text,state,call){
 const tree=parse(text),reads=new Set();
 const boolean=v=>{if(v.targetType!=='bool')throw Error('Boolean operator requires Boolean operands');return v;};
 function emit(id){const n=tree.nodes[id];switch(n.kind){
  case 'Value':return {code:n.code,targetType:n.targetType};
  case 'Local':{const b=state.get(n.name.toLowerCase());if(!b)throw Error('Local read has no preceding typed declaration: '+n.name);reads.add(b.sourceName);return {code:b.target,targetType:b.targetType};}
  case 'Group':{const v=emit(n.operand);return {...v,code:v.targetType==='bool'?'('+v.code+')':v.code};}
  case 'Not':return {code:'(!'+boolean(emit(n.operand)).code+')',targetType:'bool'};
  case 'BooleanBinary':return {code:'('+boolean(emit(n.left)).code+' '+n.operator+' '+boolean(emit(n.right)).code+')',targetType:'bool'};
  case 'Call':return call(n,n.arguments.map(id=>({node:tree.nodes[id],...emit(id)})));
  default:throw Error('Argument arrays cannot be used as scalar values');
 }}
 return {...emit(tree.root),reads:[...reads],syntax:tree};
}
module.exports={LIMITS,literal,parse,lower};
