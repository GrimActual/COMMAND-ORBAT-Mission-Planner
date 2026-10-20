importScripts('resource-index.js','asset-browser.js','sqf-migration.js','sqf-class-map.js','sqf-intent-draft.js');
self.onmessage=async e=>{try{self.postMessage({ok:true,draft:await CompanionSQFIntentDraft.build(e.data.files,e.data.map)});}catch(error){self.postMessage({ok:false,error:error.message});}};
