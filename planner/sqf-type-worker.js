'use strict';
const {parentPort,workerData}=require('node:worker_threads');
(async()=>{try{parentPort.postMessage({ok:true,report:await require('./sqf-source-constraints').build(workerData.files)});}catch(e){parentPort.postMessage({ok:false,error:e.message});}})();
