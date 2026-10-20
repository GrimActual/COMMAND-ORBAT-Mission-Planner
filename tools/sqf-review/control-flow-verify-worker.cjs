'use strict';
const {parentPort,workerData}=require('node:worker_threads');
(async()=>{try{const input=JSON.parse(workerData.sourceText);if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='files,report')throw Error('IR verification must contain exactly files and report');parentPort.postMessage({ok:true,report:await require('../../planner/sqf-control-context-validation').verify(input.report,input.files)});}catch(error){parentPort.postMessage({ok:false,error:error.message});}})();
