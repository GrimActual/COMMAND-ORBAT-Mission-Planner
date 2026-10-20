'use strict';
const {parentPort,workerData}=require('node:worker_threads');
(async()=>{try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).join(',')!=='files')throw Error('Control/context source set must contain exactly files');const report=await require('../../planner/sqf-control-context').build(input.files);parentPort.postMessage({ok:true,report});}catch(error){parentPort.postMessage({ok:false,error:error.message});}})();
