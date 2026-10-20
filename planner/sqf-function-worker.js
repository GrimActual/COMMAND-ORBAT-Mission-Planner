'use strict';
const {parentPort,workerData}=require('node:worker_threads');
try{parentPort.postMessage({ok:true,report:require('./sqf-cross-file').build(workerData.files,workerData.mounts,workerData.configRoots)});}catch(e){parentPort.postMessage({ok:false,error:e.message});}
