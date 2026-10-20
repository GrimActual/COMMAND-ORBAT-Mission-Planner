/* File-level diagnostic coverage only; never returns generated code or writes files. */
'use strict';
const modules={functions:require('./sqf-typed-functions'),boolean:require('./sqf-boolean-fragments'),integers:require('./sqf-integer-fragments'),locals:require('./sqf-boolean-locals'),branches:require('./sqf-boolean-branches')};
async function build(snapshot,family){
 if(typeof family!=='string'||!Object.hasOwn(modules,family))throw Error('Unknown conversion family');
 const r=await modules[family].review(snapshot),expressions=['boolean','integers'].includes(family),functionFamily=family==='functions',accepted=expressions?r.fragments:functionFamily?r.functions:r.blocks,rows=[];
 for(const f of snapshot.input.files){const matching=accepted.filter(x=>(expressions?x.source.file:x.file)===f.name),manual=r.unresolved.filter(x=>(expressions?x.source.file:x.file)===f.name),inventory=!/\.sqf$/i.test(f.name);rows.push({file:f.name,status:inventory?'inventory':matching.length?manual.length?'mixed':'supported':'manual',supported:matching.length,unresolved:manual.length,reasons:[...new Set(manual.map(x=>functionFamily&&x.sourceName?x.sourceName+': '+x.reason:x.reason))].slice(0,3)});}
 return {schema:'command-conversion-coverage',version:1,executable:false,sourceExecuted:false,family,scope:expressions?'expression-values-only':functionFamily?'typed-function-module':'isolated-complete-blocks',rows,summary:{files:rows.length,supportedValues:expressions?accepted.length:0,supportedBlocks:expressions||functionFamily?0:accepted.length,supportedFunctions:functionFamily?accepted.length:0,mixedFiles:rows.filter(r=>r.status==='mixed').length,manualFiles:rows.filter(r=>r.status==='manual').length,inventoryFiles:rows.filter(r=>r.status==='inventory').length,executionReadyMissions:0}};
}
module.exports={build};
