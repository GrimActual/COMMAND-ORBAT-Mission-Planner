#!/usr/bin/env node
/* Local developer CLI. Never executes source or copies audio; output is exclusive and staged. */
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const Package=require('../../planner/sqf-review-package');
const MAX={entries:1024,files:64,fileBytes:262144,totalBytes:2097152};
const inside=(root,target)=>{const relative=path.relative(root,target);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));};
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
async function review(input,output){
 if(typeof input!=='string'||typeof output!=='string'||!input||!output)throw Error('Supply input and output directories');
 const inputPath=await fs.realpath(input);if(!(await fs.stat(inputPath)).isDirectory())throw Error('Input must be a directory');
 // Require an existing real parent; output must never alter the input tree or overwrite a bundle.
 const outputPath=path.resolve(output),parent=await fs.realpath(path.dirname(outputPath)),target=path.join(parent,path.basename(outputPath));
 if(inside(inputPath,target)||inside(target,inputPath))throw Error('Output must be separate from the source directory');
 if(await fs.lstat(target).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e;}))throw Error('Output already exists; choose a new directory');
 const entries=await fs.readdir(inputPath,{withFileTypes:true});if(entries.length>MAX.entries)throw Error('Directory entry limit exceeded');
 const selected=entries.filter(e=>/\.(sqf|sqm|ext|hpp)$/i.test(e.name)).sort((a,b)=>a.name.toLowerCase()<b.name.toLowerCase()?-1:1);
 if(!selected.length||selected.length>MAX.files)throw Error('Select a directory with 1-64 supported loose text files');
 const files=[],originals=[];let total=0;
 for(const entry of selected){if(!entry.isFile()||entry.isSymbolicLink())throw Error('Source links or non-regular files are not supported');
  const file=path.join(inputPath,entry.name),real=await fs.realpath(file);if(!inside(inputPath,real)||path.dirname(real)!==inputPath)throw Error('Source path escaped selected directory');
  const stat=await fs.stat(real);if(stat.size>MAX.fileBytes)throw Error('Source file byte limit exceeded');total+=stat.size;if(total>MAX.totalBytes)throw Error('Source package byte limit exceeded');
  const bytes=await fs.readFile(real);if(bytes.length!==stat.size)throw Error('Source changed during inspection');
  // Preserve BOM as decoded source text instead of silently dropping its hash contribution.
  const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);files.push({name:entry.name,text});originals.push({name:entry.name,sha256:sha(bytes),file:real});
 }
 const bundle=await Package.build(files);
 for(const original of originals){const current=await fs.realpath(original.file);if(current!==original.file||sha(await fs.readFile(current))!==original.sha256)throw Error('Source changed during review; no bundle published');}
 const receipt={schema:'command-sqf-local-review-receipt',version:1,executable:false,originalByteHashScope:'exact-file-bytes',originalsUnchanged:true,sources:originals.map(({name,sha256})=>({name,sha256})),ignored:entries.filter(e=>!selected.includes(e)).map(e=>({name:e.name,reason:e.isDirectory()?'directory-not-traversed':'unsupported-input-not-read'})).sort((a,b)=>a.name<b.name?-1:1)};
 let staging=null;
 try{
  staging=await fs.mkdtemp(path.join(parent,'.command-sqf-review-'));
  for(const [name,text] of Object.entries(bundle.outputs))await fs.writeFile(path.join(staging,name),text,{encoding:'utf8',flag:'wx'});
  await fs.writeFile(path.join(staging,'source-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{encoding:'utf8',flag:'wx'});
  await fs.rename(staging,target);staging=null;return {output:target,manifest:bundle.manifest,receipt};
 }finally{if(staging&&path.dirname(staging)===parent&&path.basename(staging).startsWith('.command-sqf-review-'))await fs.rm(staging,{recursive:true,force:true});}
}
async function main(args){if(args.length!==4||args[0]!=='--input'||args[2]!=='--output')throw Error('Usage: node review.cjs --input <loose-source-folder> --output <new-review-folder>');const result=await review(args[1],args[3]);console.log(JSON.stringify({output:result.output,sourceFiles:result.manifest.sources.length,originalsUnchanged:true,executionReady:0,bundleSHA256:result.manifest.bundleSHA256},null,2));}
if(require.main===module)main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={review,main,MAX};
