'use strict';
const {parentPort,workerData}=require('node:worker_threads');
(async()=>{try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).join(',')!=='files')throw Error('Statement-effect source set must contain exactly files');parentPort.postMessage({ok:true,report:await require('../../planner/sqf-statement-effects').build(input.files)});}catch(error){parentPort.postMessage({ok:false,error:error.message});}})();
