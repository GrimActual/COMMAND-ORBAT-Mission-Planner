importScripts('sqf-migration.js','sqf-structural-ast.js');
self.onmessage=async event=>{try{self.postMessage({ok:true,report:await CompanionSQFAST.build(event.data)});}catch(error){self.postMessage({ok:false,error:error.message});}};
