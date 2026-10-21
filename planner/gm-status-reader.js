/* Coalesce concurrent reads only. No cached result survives settlement or mutation. */
'use strict';
function createStatusReader(read){let epoch=0,pending=null;return{invalidate(){epoch++;pending=null;},get(){let entry=pending;if(!entry){const at=epoch;entry={promise:null};pending=entry;entry.promise=Promise.resolve().then(read).then(value=>{if(at!==epoch)throw Error('Game state changed during status check. Refresh results.');return value;}).finally(()=>{if(pending===entry)pending=null;});}return entry.promise.then(value=>structuredClone(value));}};}
module.exports={createStatusReader};
