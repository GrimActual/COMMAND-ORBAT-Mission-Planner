'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{
 const input=JSON.parse(workerData.sourceText);
 if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='files,mounts')throw Error('Source set must contain exactly files and mounts');
 const report=require('../../planner/sqf-source-dependencies').build(input.files,input.mounts);
 parentPort.postMessage({ok:true,report});
}catch(error){parentPort.postMessage({ok:false,error:error.message});}
