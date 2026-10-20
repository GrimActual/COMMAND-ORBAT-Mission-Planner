#!/usr/bin/env node
'use strict';
// Local files only; never connects, starts an engine or changes a saved plan.
const fs=require('node:fs'),{create}=require('./contract.cjs'),{normalize,normalizeSeries}=require('./normalize.cjs'),profiles=require('./profiles.cjs');
function read(file,max){const s=fs.statSync(file);if(!s.isFile()||s.size>max)throw Error('Input file exceeds bounds');return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}
function run(args){
 const series=args[0]==='--series';if(series)args=args.slice(1);
 if(series?args.length!==3:args.length!==1&&args.length!==3)throw Error('Use [--series] INDEX_OR_DISCOVERY.json [PROFILE_ID NATIVE_CAPTURE_OR_RUN.json]');
 const input=read(args[0],5*1024*1024),registry=create(profiles,input.schema==='companion-resource-index'?input:input.index);
 if(args.length===1)return {schema:'command-aircraft-inventory',version:1,environment:registry.environment,scope:'Supplied metadata index only; no server availability or flight claim.',aircraft:registry.inventory()};
 const profile=registry.snapshot().profiles.find(p=>p.id===args[1]);if(!profile)throw Error('Unknown exact profile ID');
 let capture=read(args[2],262144);
 if(capture.result){if(capture.status!=='observed')throw Error('Successful native run outcome required');capture=capture.result;}
 if(series)return normalizeSeries(registry,profile.identity,Array.isArray(capture)?capture:capture.reports);
 return normalize(registry,profile.identity,capture.report||capture);
}
if(require.main===module){try{process.stdout.write(JSON.stringify(run(process.argv.slice(2)),null,2)+'\n');}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}}
module.exports={run};
