'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{
 const input=JSON.parse(workerData.sourceText);
 if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='configRoots,files,mounts')throw Error('Registration source set must contain exactly files, mounts and configRoots');
 const report=require('../../planner/sqf-function-registrations').build(input.files,input.mounts,input.configRoots);
 parentPort.postMessage({ok:true,report});
}catch(error){parentPort.postMessage({ok:false,error:error.message});}
