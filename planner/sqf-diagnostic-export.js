/* Source-bound review packaging and comment-only migration placeholders. No emission of executable logic. */
'use strict';
const crypto=require('node:crypto'),D=require('./sqf-source-dependencies'),S=require('./sqf-migration');
const SCHEMAS=Object.freeze({dependencies:'command-source-dependency-review',functions:'command-sqf-cross-file-review',types:'command-sqf-source-constraint-review',effects:'command-sqf-statement-effect-review'});
const LIMITS=Object.freeze({bundleBytes:33554432,outputBytes:67108864,entries:10000});
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const canonical=v=>JSON.stringify(v,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(k=>[k,item[k]])):item);
const bounded=(text,max=LIMITS.outputBytes)=>{if(Buffer.byteLength(text,'utf8')>max)throw Error('Diagnostic export byte limit exceeded');return text;};
function sources(input){const c=D.createSourceContext(input.files,input.mounts||[]);return c.files.map(f=>({name:f.name,sha256:sha(f.text),textBytes:Buffer.byteLength(f.text,'utf8'),textLength:f.text.length,hashScope:'decoded-utf8-text',text:f.text}));}
function build(snapshots,{includeSources=false}={}){
 if(typeof includeSources!=='boolean'||!Array.isArray(snapshots)||!snapshots.length||snapshots.length>4)throw Error('Choose at least one completed diagnostic review');
 const seen=new Set(),reviews=[],sourceSets=new Map();
 for(const s of snapshots){if(!Object.hasOwn(SCHEMAS,s.profile)||seen.has(s.profile)||s.report?.schema!==SCHEMAS[s.profile]||s.report.version!==1||s.report.executable!==false)throw Error('Diagnostic snapshot rejected');seen.add(s.profile);
  const captured=sources(s.input),identities=captured.map(({text,...identity})=>identity),sourceSetSHA256=sha(canonical(identities));
  const reported=new Map((s.report.files||[]).map(f=>[f.name,f.sha256]));if(reported.size!==captured.length||captured.some(f=>reported.get(f.name)!==f.sha256))throw Error('Review and captured source identities differ');
  if(!sourceSets.has(sourceSetSHA256))sourceSets.set(sourceSetSHA256,{id:sourceSetSHA256,files:captured.map(({text,...identity})=>includeSources?{...identity,text}:identity)});
  const context={mounts:s.input.mounts||[],configRoots:s.input.configRoots||[]};
  reviews.push({profile:s.profile,sourceSetSHA256,selectionContextSHA256:sha(canonical(context)),selectionContext:context,reportSHA256:sha(canonical(s.report)),report:s.report});
 }
 reviews.sort((a,b)=>a.profile<b.profile?-1:1);
 const result={schema:'command-combined-diagnostic-review',version:1,executable:false,evaluationPerformed:false,targetTypesResolved:false,nativeVerified:false,coverage:'completed-session-review-snapshots',snapshotPolicy:'Captured source text; files are not reloaded at export time. Separate source selections remain separate.',sourceTextIncluded:includeSources,reportsMayContainSourceExcerpts:true,missingReviews:Object.keys(SCHEMAS).filter(k=>!seen.has(k)),sourceSets:[...sourceSets.values()].sort((a,b)=>a.id<b.id?-1:1),reviews,summary:{reviews:reviews.length,distinctSourceSets:sourceSets.size,mixedSourceSets:sourceSets.size>1,executionReady:0},requiredReview:['source-and-redistribution-rights','complete-source-and-preprocessing-context','runtime-types-bindings-and-locality','callback-scheduling-and-owned-cleanup','verified-target-mappings-and-native-behavior']};
 result.bundleSHA256=sha(canonical(result));bounded(json(result),LIMITS.bundleBytes);return result;
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function html(bundle){
 const sections=bundle.reviews.map(r=>'<section><h2>'+escape(r.profile)+'</h2><p>Source set: '+escape(r.sourceSetSHA256)+'</p><p>Selection context: '+escape(r.selectionContextSHA256)+'</p><pre>'+escape(json(r.report.summary||{}))+'</pre><details><summary>Full captured review</summary><pre>'+escape(json(r.report))+'</pre></details></section>').join('');
 return bounded('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"><title>COMMAND — Combined diagnostic review</title><style>body{font:16px/1.5 system-ui;max-width:1100px;margin:2em auto;padding:0 1em;background:#13201b;color:#edf5ed}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#1e3028;padding:1em}section{border-top:1px solid #617867;margin-top:2em}h1,h2{color:#bed799}</style><h1>COMMAND — Combined diagnostic review</h1><p>Read-only source analysis. No source execution, verified target mapping or native validation.</p><p>'+escape(bundle.snapshotPolicy)+'</p><p>'+bundle.summary.distinctSourceSets+' distinct source selection(s). Missing reviews: '+escape(bundle.missingReviews.join(', ')||'none')+'.</p><p>Bundle identity: '+escape(bundle.bundleSHA256)+'</p>'+sections+'<section><h2>Source identity inventory</h2><pre>'+escape(json(bundle.sourceSets))+'</pre></section></html>');
}
const comment=s=>String(s).replace(/\*\//g,'* /').replace(/[\r\n\u2028\u2029]/g,' ').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,' ');
function scaffold(snapshot,bundle){
 if(!['types','effects'].includes(snapshot?.profile))throw Error('Scaffolds require a completed Types or Effects review');
 const flow=snapshot.report.controlContextReview;if(!flow||flow.executable!==false||!Array.isArray(flow.nodes)||flow.nodes.length>LIMITS.entries)throw Error('Missing bounded control/context review');
 const captured=sources(snapshot.input),files=[],entries=[],sourceCopies=[],findingsByNode=new Map();let outputBytes=0;
 for(const finding of flow.findings){if(!findingsByNode.has(finding.nodeId))findingsByNode.set(finding.nodeId,[]);findingsByNode.get(finding.nodeId).push(finding);}
 const add=(path,text)=>{outputBytes+=Buffer.byteLength(text,'utf8');if(outputBytes>LIMITS.outputBytes)throw Error('Scaffold output byte limit exceeded');files.push({path,text});};
 const risky=new Set(['waituntil','deletevehicle','remoteexec','remoteexeccall','spawn','compile','compilefinal','execvm']);
 for(const [ordinal,file] of captured.entries()){
  const suffix=String(ordinal+1).padStart(4,'0'),copy='OriginalSources/source-'+suffix+file.name.slice(file.name.lastIndexOf('.')).toLowerCase(),output='Scaffolds/source-'+suffix+'.c';
  sourceCopies.push({source:file.name,sha256:file.sha256,copy});add(copy,file.text);
  const lines=['/*',' COMMAND — COMMENT-ONLY MIGRATION REVIEW',' No executable declarations, inferred signatures or converted behavior.',' Original source and notices are preserved in '+copy+'.',' Review authority, types, lifecycle, resources and licensing in Workbench.','*/'];
  const relevant=flow.nodes.filter(n=>n.source.file===file.name&&!['ContextRoot','Sequence'].includes(n.kind));
  for(const node of relevant){const span=node.source;if(!Number.isInteger(span.start)||!Number.isInteger(span.end)||span.start<0||span.end<span.start||span.end>file.text.length)throw Error('Invalid scaffold source span');
   const words=S.tokenize(file.text.slice(span.start,span.end)).filter(t=>t.kind==='word').map(t=>t.value.toLowerCase()),manual=words.filter(w=>risky.has(w));
   const syntax=(findingsByNode.get(node.id)||[]).filter(f=>['UNSUPPORTED_STATEMENT_BARRIER','EXPRESSION_SYNTAX_UNRESOLVED'].includes(f.code));
   const tier=node.kind==='Barrier'||manual.length||syntax.length?'red':'yellow',reasons=tier==='red'?['manual-body-required',...new Set(manual.map(w=>'source-operation:'+w)),...syntax.map(f=>f.code)]:['structural-placeholder-only','target-signature-types-and-semantics-unverified'];
   const startLine=lines.length+1;
   lines.push('/*',' '+tier.toUpperCase()+' — '+comment(node.kind),' Source: '+comment(file.name)+':'+span.line+':'+span.column+' ['+span.start+','+span.end+')',' Source SHA-256: '+file.sha256,' Node: '+comment(node.id)+' / '+comment(node.sourceNodeId)+'; context: '+comment(node.contextId),' Review: '+reasons.map(comment).join('; '),' TODO: Implement only after source semantics and target behavior are verified.','*/');
   entries.push({nodeId:node.id,sourceNodeId:node.sourceNodeId,contextId:node.contextId,kind:node.kind,tier,source:{...span,sha256:file.sha256,hashScope:'decoded-utf8-text'},output:{path:output,startLine,endLine:lines.length},reasons,unresolved:[...flow.requiredReview],nativeVerified:false,executionReady:false});
  }
  if(!relevant.length){const startLine=lines.length+1;lines.push('/* Inventory-only source. No executable or structural conversion generated. */');entries.push({nodeId:null,kind:'inventory-only',tier:'red',source:{file:file.name,start:0,end:file.text.length,line:1,column:1,sha256:file.sha256,hashScope:'decoded-utf8-text'},output:{path:output,startLine,endLine:lines.length},reasons:['configuration-or-empty-source-requires-target-mapping'],unresolved:[...flow.requiredReview],nativeVerified:false,executionReady:false});}
  add(output,lines.join('\n')+'\n');
 }
 const manifest={schema:'command-comment-scaffold-manifest',version:1,executable:false,mode:'comment-only',bundleSHA256:bundle.bundleSHA256,reviewProfile:snapshot.profile,sourceCopies,entries,findings:flow.findings,summary:{green:0,yellow:entries.filter(e=>e.tier==='yellow').length,red:entries.filter(e=>e.tier==='red').length,executionReady:0},rights:'Original captured sources and their notices are preserved. Permission to inspect is not permission to redistribute. Review source licenses and attribution before sharing.',requiredReview:[...flow.requiredReview]};
 manifest.manifestSHA256=sha(canonical(manifest));add('manifest.json',json(manifest));add('diagnostic-review.json',json(bundle));
 const checklist=['# COMMAND migration checklist','','Comment-only placeholders. Green emission: 0. Nothing was compiled or executed.','',manifest.rights,'','Preserve the OriginalSources folder and its notices with source-derived work.','',...entries.map(e=>'- [ ] '+e.tier.toUpperCase()+' '+comment(e.source.file)+':'+e.source.line+' — '+(e.nodeId||'inventory')+' → '+e.output.path+':'+e.output.startLine+' — '+e.reasons.join('; ')),'','## Source findings','',...flow.findings.map(f=>'- '+comment(f.source.file)+':'+f.source.line+' — '+f.code+' — '+comment(f.detail||'')),'','## Native integration','','Review each placeholder, implement verified mappings, wire components and validate in Enfusion Workbench. This folder is not a runnable addon.'];
 add('MIGRATION-CHECKLIST.md',checklist.join('\n')+'\n');return {files,manifest};
}
function outputFiles(files){let total=0;for(const file of files){total+=Buffer.byteLength(file.text,'utf8');if(total>LIMITS.outputBytes)throw Error('Combined scaffold output byte limit exceeded');}return files;}
module.exports={SCHEMAS,LIMITS,build,html,scaffold,outputFiles};
