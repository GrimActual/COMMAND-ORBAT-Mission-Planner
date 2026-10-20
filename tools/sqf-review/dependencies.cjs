#!/usr/bin/env node
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{start,MAX_INPUT_BYTES}=require('./dependency-runner.cjs');
async function inspect(input,output,{profile='dependencies'}={}){
 if(!['dependencies','registrations','includes','conditions','scalars','aliases','macros','crossfile','flow','effects','constraints'].includes(profile))throw Error('Unknown compiler review profile');
 if(typeof input!=='string'||typeof output!=='string'||!input||!output)throw Error('Supply source-set JSON and a new report filename');
 const source=path.resolve(input),target=path.resolve(output);
 const stat=await fs.lstat(source);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>MAX_INPUT_BYTES)throw Error('Source set must be a bounded regular JSON file');
 const bytes=await fs.readFile(source);if(bytes.length>MAX_INPUT_BYTES)throw Error('Source-set byte budget exceeded');
 const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),originalHash=hash(bytes);
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes),report=await start(text,{profile}).promise;
 const after=await fs.lstat(source);if(!after.isFile()||after.isSymbolicLink()||after.size>MAX_INPUT_BYTES||hash(await fs.readFile(source))!==originalHash)throw Error('Source set changed during inspection');
 // An exclusive create cannot overwrite the source, a prior report or a symlink target.
 const content=JSON.stringify(report,null,2)+'\n';await fs.writeFile(target,content,{flag:'wx'});
 return {output:target,...(profile==='dependencies'?{sourceSetSHA256:report.sourceSetSHA256}:{reviewContextSHA256:report.reviewContextSHA256}),sourceJSONSHA256:originalHash,summary:report.summary,executable:false};
}
async function main(args){if(args.length!==4||args[0]!=='--source-set'||args[2]!=='--output')throw Error('Usage: node dependencies.cjs --source-set <files-and-mounts.json> --output <new-report.json>');console.log(JSON.stringify(await inspect(args[1],args[3]),null,2));}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={inspect,main};
