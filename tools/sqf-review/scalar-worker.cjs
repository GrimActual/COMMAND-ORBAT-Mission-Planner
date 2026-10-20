'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='entries,environment,files,mounts')throw Error('Scalar source set must contain exactly files, mounts, entries and environment');parentPort.postMessage({ok:true,report:require('../../planner/sqf-include-expansion').buildScalar(input.files,input.mounts,input.entries,input.environment)});}catch(error){parentPort.postMessage({ok:false,error:error.message});}
