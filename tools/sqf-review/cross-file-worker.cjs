'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='configRoots,files,mounts')throw Error('Cross-file source set must contain exactly files, mounts and configRoots');parentPort.postMessage({ok:true,report:require('../../planner/sqf-cross-file').build(input.files,input.mounts,input.configRoots)});}catch(error){parentPort.postMessage({ok:false,error:error.message});}
