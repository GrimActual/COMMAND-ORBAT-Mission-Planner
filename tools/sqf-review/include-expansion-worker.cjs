'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='entries,files,mounts')throw Error('Include source set must contain exactly files, mounts and entries');parentPort.postMessage({ok:true,report:require('../../planner/sqf-include-expansion').build(input.files,input.mounts,input.entries)});}catch(error){parentPort.postMessage({ok:false,error:error.message});}
