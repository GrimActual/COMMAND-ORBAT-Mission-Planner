importScripts('sqf-migration.js');
self.onmessage=event=>{try{self.postMessage({ok:true,report:CompanionSQFMigration.analyze(event.data)});}catch(error){self.postMessage({ok:false,error:error.message});}};
