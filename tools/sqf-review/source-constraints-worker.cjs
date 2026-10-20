'use strict';
const {parentPort,workerData}=require('node:worker_threads');
(async()=>{try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).join(',')!=='files')throw Error('Source-constraint source set must contain exactly files');parentPort.postMessage({ok:true,report:await require('../../planner/sqf-source-constraints').build(input.files)});}catch(error){parentPort.postMessage({ok:false,error:error.message});}})();
