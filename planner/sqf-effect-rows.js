/* Display rows only; this adapter never resolves or invokes source effects. */
'use strict';
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CompanionEffectRows=factory();})(typeof window!=='undefined'?window:globalThis,()=>{
 function build(report,files){
  const texts=new Map(files.map(f=>[f.name,f.text])),starts=new Map();
  for(const [file,text] of texts){const lines=[0];for(let i=0;i<text.length;i++){if(text[i]==='\r'){if(text[i+1]==='\n')i++;lines.push(i+1);}else if(text[i]==='\n')lines.push(i+1);}starts.set(file,lines);}
  function span(source){const lines=starts.get(source.file);if(!lines)throw Error('Effect source unavailable');let lo=0,hi=lines.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(lines[mid]<=source.start)lo=mid;else hi=mid;}return {...source,line:lo+1,column:source.start-lines[lo]+1};}
  const nodes=new Map(report.controlContextReview.nodes.map(n=>[n.id,n])),contexts=new Map(report.controlContextReview.contexts.map(c=>[c.id,c])),rows=[];
  const push=row=>{row.source=span(row.source);row.search=[row.name,row.context,...row.effects,...row.obligations,row.reason,row.source.file].filter(Boolean).join(' ').toLocaleLowerCase();rows.push(row);};
  for(const r of report.contexts)push({kind:'contexts',label:'Unresolved execution context',name:r.kind,context:r.contextId,unknown:r.unknownCoverage,effects:r.potentialEffects,obligations:[],reason:'Context effects are not proof of invocation',source:contexts.get(r.contextId).source});
  for(const r of report.nodes){const node=nodes.get(r.nodeId);push({kind:'nodes',label:'Possible statement effects',name:node.target?.name||node.kind,context:r.contextId,write:r.potentialEffects.includes('write-binding-candidate'),unknown:r.coverage==='contains-unreviewed-source',effects:r.potentialEffects,obligations:[],reason:r.coverage==='contains-unreviewed-source'?'Contains unreviewed source':'Source candidates only',source:r.source});}
  for(const r of report.commands)push({kind:'commands',label:'Command effect candidate',name:r.command,context:r.contextId,effects:r.potentialEffects,obligations:r.obligations,reason:'Overloads and native behavior remain unresolved',source:r.source});
  for(const r of report.invocations)push({kind:'callbacks',label:'Code invocation candidate',name:r.reason,context:r.ownerContextId,effects:[],obligations:[],reason:r.targetContextId?'Target context remains uninvoked':'Target context unresolved',target:r.targetContextId,source:r.source});
  for(const row of rows){row.cleanup=row.obligations.some(s=>/cleanup|lifetime/.test(s));row.scheduling=row.effects.some(s=>/scheduled|per-frame|repeated-region/.test(s))||/lazy-code|callback|isnil-code/.test(row.name);}
  return rows;
 }
 return {build};
});
