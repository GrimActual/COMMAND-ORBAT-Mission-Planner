#!/usr/bin/env node
/* Explicit unpacked components -> one source snapshot -> four existing review workers. */
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {read,start}=require('../../planner/sqf-dependency-main');
const D=require('../../planner/sqf-source-dependencies'),E=require('../../planner/sqf-diagnostic-export');
const LIMITS=Object.freeze({files:64,fileBytes:262144,totalBytes:2097152,entries:4096,depth:24,components:16});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=o=>JSON.stringify(o,null,2)+'\n';
const within=(root,file)=>{const r=path.relative(root,file);return !path.isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+path.sep);};
const plain=(v,keys)=>v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).sort().join(',')===keys.sort().join(',');
async function capture(manifest){
 if(!plain(manifest,['components'])||!Array.isArray(manifest.components)||!manifest.components.length||manifest.components.length>LIMITS.components)throw Error('Supply 1-16 explicit unpacked components');
 const files=[],mounts=[],originals=[],skipped=[],components=[];let bytes=0,entries=0;
 for(const c of manifest.components){
  if(!plain(c,['folder','root','prefix'])||typeof c.folder!=='string'||!path.isAbsolute(c.folder)||typeof c.root!=='string'||!c.root||typeof c.prefix!=='string')throw Error('Each component needs an absolute folder, relative package root and virtual prefix');
  // Reuse the source resolver's path and mount validation before touching the tree.
  const checked=D.createSourceContext([{name:c.root+'/__identity__.sqf',text:''}],[{prefix:c.prefix,root:c.root}]);
  const mount=checked.mounts[0];
  if(components.some(x=>x.root.toLowerCase()===mount.root.toLowerCase()||x.prefix.toLowerCase()===mount.prefix.toLowerCase()))throw Error('Component identities and virtual prefixes must be unique');
  const folder=path.resolve(c.folder),stat=await fs.lstat(folder);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Component folders must be regular directories');
  const real=await fs.realpath(folder);
  if(components.some(x=>within(x.real,real)||within(real,x.real)))throw Error('Select separate, non-overlapping component folders');
  components.push({folder,real,root:mount.root,prefix:mount.prefix});mounts.push({...mount});
  async function walk(dir,relative,depth){
   if(depth>LIMITS.depth)throw Error('Component directory depth limit exceeded');
   const children=await fs.readdir(dir,{withFileTypes:true});children.sort((a,b)=>a.name<b.name?-1:1);
   for(const entry of children){
    if(++entries>LIMITS.entries)throw Error('Component entry limit exceeded');
    const local=path.join(dir,entry.name),rel=relative?relative+'/'+entry.name:entry.name,name=mount.root+'/'+rel;
    const st=await fs.lstat(local);if(st.isSymbolicLink()||!within(real,await fs.realpath(local)))throw Error('Source links and paths outside selected components are not followed');
    if(st.isDirectory()){await walk(local,rel,depth+1);continue;}
    if(!st.isFile())throw Error('Only regular files and directories are accepted');
    if(!/\.(sqf|sqm|ext|hpp)$/i.test(name)){skipped.push({name,bytes:st.size,reason:'not-supported-source-text'});continue;}
    if(files.length>=LIMITS.files)throw Error('Combined review source limit exceeded (64 files)');
    const content=await read(local,LIMITS.fileBytes);bytes+=content.length;if(bytes>LIMITS.totalBytes)throw Error('Combined review source byte limit exceeded (2 MiB)');
    const text=new TextDecoder('utf-8',{fatal:true}).decode(content);
    files.push({name,text});originals.push({file:local,name,sha256:sha(content),max:LIMITS.fileBytes});
   }
  }
  await walk(folder,'',0);
 }
 const context=D.createSourceContext(files,mounts);
 // Reject case collisions rather than presenting ambiguous component identities as a complete package.
 if(new Set(context.files.map(f=>f.name.toLowerCase())).size!==context.files.length)throw Error('Case-colliding source identities');
 return {input:{files:context.files.map(({name,text})=>({name,text})),mounts:context.mounts.map(m=>({...m}))},originals,skipped,components,bytes};
}
async function verifySources(captured){for(const f of captured.originals)if(sha(await read(f.file,f.max))!==f.sha256)throw Error('Source files changed during project review');}
async function inspect(manifestFile,output,{run=start}={}){
 if(typeof manifestFile!=='string'||typeof output!=='string'||!path.isAbsolute(manifestFile)||!path.isAbsolute(output))throw Error('Use absolute manifest and new output-folder paths');
 const target=path.resolve(output),parent=await fs.realpath(path.dirname(target));
 // Do not follow an existing output or write into selected source trees.
 try{await fs.lstat(target);throw Error('Choose a new output folder');}catch(e){if(e.code!=='ENOENT')throw e;}
 const manifestBytes=await read(manifestFile,65536),captured=await capture(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(manifestBytes)));
 if(captured.components.some(c=>within(c.real,parent)))throw Error('Review output must be outside selected component folders');
 const snapshots=[],timings={};
 for(const profile of ['dependencies','functions','types','effects']){
  const t=performance.now(),report=await run(captured.input,{profile}).promise;
  snapshots.push({profile,input:captured.input,report});timings[profile]=Math.round((performance.now()-t)*100)/100;
 }
 await verifySources(captured);
 if(sha(await read(manifestFile,65536))!==sha(manifestBytes))throw Error('Component manifest changed during inspection');
 const bundle=E.build(snapshots,{includeSources:false});
 if(bundle.summary.distinctSourceSets!==1||bundle.missingReviews.length)throw Error('Project review did not produce one complete source selection');
 const receipt={schema:'command-component-source-receipt',version:1,executable:false,sourceFiles:captured.originals.map(({file,max,...f})=>f),skipped:captured.skipped,sourceBytes:captured.bytes,timingsMs:timings,bundleSHA256:bundle.bundleSHA256,selection:'Only explicitly selected component folders; no archive extraction, source execution or source writes.',limitations:['Only SQF/SQM/EXT/HPP text is included; config.cpp, INC, binary config, compiled SQFC and archives are inventory-only.','Include activation and macros are not evaluated; exact paths are not proven runtime bindings.','The source package and report excerpts may contain private or third-party source. Review rights before sharing.']};
 const deps=snapshots[0].report;
 const summary=['# COMMAND component review','','All four reviews use the same captured source set. No source was executed or converted.','',`Source files: ${captured.input.files.length}. Bytes: ${captured.bytes}. Skipped entries: ${captured.skipped.length}.`, `Literal includes: ${deps.summary.exactResolved} exact; ${deps.summary.unresolved} unresolved.`, '',...deps.includes.filter(x=>x.status!=='resolved-exact').map(x=>`- ${x.source.file}:${x.source.line} — ${x.status} — ${x.requested||'non-literal include'}`),'','Open combined-review.html for all four summaries. Load source-package.json into each existing desktop inspector to reproduce the same selection. The CLI does not populate the running app automatically.','',...receipt.limitations.map(s=>'- '+s),'',`Bundle SHA-256: ${bundle.bundleSHA256}`,''].join('\n');
 // No output exists until all four reviews and source checks have succeeded.
 await fs.mkdir(target);
 for(const [name,text] of Object.entries({'source-package.json':json(captured.input),'combined-review.json':json(bundle),'combined-review.html':E.html(bundle),'source-receipt.json':json(receipt),'REVIEW.md':summary}))await fs.writeFile(path.join(target,name),text,{flag:'wx'});
 return {output:target,files:captured.input.files.length,skipped:captured.skipped.length,sourceBytes:captured.bytes,summary:bundle.summary,dependencies:deps.summary,timingsMs:timings,bundleSHA256:bundle.bundleSHA256,executable:false};
}
async function main(args){if(args.length!==4||args[0]!=='--manifest'||args[2]!=='--output')throw Error('Usage: node project.cjs --manifest <absolute-components.json> --output <absolute-new-folder>');console.log(json(await inspect(args[1],args[3])));}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={LIMITS,capture,verifySources,inspect,main};
