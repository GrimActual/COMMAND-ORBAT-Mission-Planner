/* Revision-bound symbol provenance. IDs are not runtime bindings, engine GUIDs or signatures. */
'use strict';
const crypto=require('node:crypto');
function build(report){const ir=report.controlContextReview;if(!ir||!Array.isArray(report.files))throw Error('Missing captured source context');const files=new Map(report.files.map(f=>[f.name,f.sha256])),scopes=new Map(ir.bindingReview.scopes.map(s=>[s.id,s])),symbols=[],byBinding={};
 function add(name,kind,source,scopeStart,localBindingId=null){const fileSHA256=files.get(source.file);if(!/^[a-f0-9]{64}$/.test(fileSHA256||''))throw Error('Missing source revision identity');const canonicalName=name.toLowerCase(),identity={file:source.file,fileSHA256,name:canonicalName,kind,scopeStart,declarationStart:source.start,declarationEnd:source.end},symbolId='command-symbol-v1:'+crypto.createHash('sha256').update('COMMAND-SYMBOL-v1\0'+JSON.stringify(identity)).digest('hex');const row={symbolId,name,canonicalName,kind,source:{...source},fileSHA256,scopeStart,localBindingId,runtimeBindingResolved:false,nativeResourceIdentity:false};symbols.push(row);if(localBindingId)byBinding[localBindingId]=symbolId;}
 for(const b of report.bindings){const scope=scopes.get(b.scopeId);if(!scope)throw Error('Unknown symbol source scope');add(b.name,b.kind,b.source,scope.source.start,b.id);}
 for(const n of ir.nodes)if(n.kind==='StoreCode'&&n.target?.name&&!n.target.name.startsWith('_'))add(n.target.name,'unresolved-global-code-definition',n.target.source,n.source.start);
 if(symbols.length>20000)throw Error('Symbol provenance limit exceeded');return {schema:'command-source-symbol-identities',version:1,offsetEncoding:'utf16-code-units',sourceHashScope:'decoded-utf8-source-text',identityScope:'exact-file-revision-and-source-scope',runtimeBindingResolved:false,symbols,byBinding};
}
module.exports={build};
