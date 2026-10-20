'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{parentPort.postMessage({ok:true,report:require('./sqf-source-dependencies').build(workerData.files,workerData.mounts)});}catch(e){parentPort.postMessage({ok:false,error:e.message});}
