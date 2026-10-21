'use strict';
const {contextBridge,ipcRenderer,webFrame}=require('electron');
contextBridge.exposeInMainWorld('presentationDesktop',{offlineBase:coord=>ipcRenderer.invoke('offline-base-tile',coord),tile:coord=>ipcRenderer.invoke('presentation-tile',coord)});

contextBridge.exposeInMainWorld('plannerDesktop',{injectModAOs:()=>ipcRenderer.invoke('inject-mod-aos'),graphicsStatus:()=>ipcRenderer.invoke('graphics-status'),displayDiagnostics:()=>ipcRenderer.invoke('display-diagnostics'),setInterfaceScale:value=>{if(Number.isFinite(value)&&value>=.5&&value<=2)webFrame.setZoomFactor(value)}});

contextBridge.exposeInMainWorld('plannerSimulation',{command:(action,options)=>ipcRenderer.invoke('simulation-command',action,options),subscribe:callback=>{if(typeof callback!=='function')throw Error('Callback required');const listener=(_event,state)=>callback(state);ipcRenderer.on('simulation-state',listener);return ()=>ipcRenderer.removeListener('simulation-state',listener);}});

contextBridge.exposeInMainWorld('plannerLocalBridge',{command:async(action,options)=>{try{return await ipcRenderer.invoke('local-bridge-command',action,options);}catch(error){const message=String(error?.message||'Game connection request failed').replace(/^Error invoking remote method ['"]local-bridge-command['"]:\s*(?:Error:\s*)?/,'');throw Error(message.slice(0,500));}},subscribe:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('local-bridge-state',listener);return ()=>ipcRenderer.removeListener('local-bridge-state',listener);}});

contextBridge.exposeInMainWorld('plannerMetadata',{exportSQFAST:report=>ipcRenderer.invoke('sqf-ast-export',report),exportTerrainQuery:query=>ipcRenderer.invoke('terrain-query-export',query),exportIntentDraft:draft=>ipcRenderer.invoke('sqf-intent-draft-export',draft),exportClassMap:map=>ipcRenderer.invoke('sqf-class-map-export',map),exportMigration:report=>ipcRenderer.invoke('sqf-migration-export',report),select:()=>ipcRenderer.invoke('workbench-metadata-select'),selectProject:()=>ipcRenderer.invoke('workbench-project-select'),selectIndex:()=>ipcRenderer.invoke('workbench-index-select'),exportIndex:index=>ipcRenderer.invoke('workbench-metadata-export',index),exportDeployment:doc=>ipcRenderer.invoke('deployment-intent-export',doc),exportCatalog:catalog=>ipcRenderer.invoke('workbench-catalog-export',catalog)});

contextBridge.exposeInMainWorld('plannerDependencies',{clear:()=>ipcRenderer.invoke('sqf-dependency-clear'),select:()=>ipcRenderer.invoke('sqf-dependency-select'),cancel:()=>ipcRenderer.invoke('sqf-dependency-cancel')});

contextBridge.exposeInMainWorld('plannerFunctions',{clear:()=>ipcRenderer.invoke('sqf-function-clear'),select:()=>ipcRenderer.invoke('sqf-function-select'),cancel:()=>ipcRenderer.invoke('sqf-function-cancel')});

contextBridge.exposeInMainWorld('plannerEffects',{clear:()=>ipcRenderer.invoke('sqf-effect-clear'),select:()=>ipcRenderer.invoke('sqf-effect-select'),cancel:()=>ipcRenderer.invoke('sqf-effect-cancel')});
contextBridge.exposeInMainWorld('plannerTypes',{clear:()=>ipcRenderer.invoke('sqf-type-clear'),select:()=>ipcRenderer.invoke('sqf-type-select'),cancel:()=>ipcRenderer.invoke('sqf-type-cancel')});

contextBridge.exposeInMainWorld('plannerDiagnostics',{preview:options=>ipcRenderer.invoke('sqf-diagnostic-preview',options),status:()=>ipcRenderer.invoke('sqf-diagnostic-status'),export:options=>ipcRenderer.invoke('sqf-diagnostic-export',options)});

contextBridge.exposeInMainWorld('plannerProjectReview',{select:()=>ipcRenderer.invoke('sqf-project-select'),folder:()=>ipcRenderer.invoke('sqf-project-folder'),context:()=>ipcRenderer.invoke('sqf-project-context'),mounts:options=>ipcRenderer.invoke('sqf-project-mounts',options),headers:options=>ipcRenderer.invoke('sqf-project-headers',options),reviewFolder:options=>ipcRenderer.invoke('sqf-project-folder-review',options),cancel:()=>ipcRenderer.invoke('sqf-project-cancel')});

contextBridge.exposeInMainWorld('plannerAdapters',{status:()=>ipcRenderer.invoke('sqf-adapter-status'),initialization:options=>ipcRenderer.invoke('sqf-adapter-initialization',options),saveInitialization:options=>ipcRenderer.invoke('sqf-adapter-save-initialization',options),preprocess:options=>ipcRenderer.invoke('sqf-adapter-preprocess',options),source:options=>ipcRenderer.invoke('sqf-adapter-source',options),previewJobs:options=>ipcRenderer.invoke('sqf-adapter-preview-jobs',options),packagePreprocessing:options=>ipcRenderer.invoke('sqf-adapter-package',options),savePreprocessing:options=>ipcRenderer.invoke('sqf-adapter-save-preprocess',options),exportJobs:options=>ipcRenderer.invoke('sqf-adapter-export-jobs',options),cancel:()=>ipcRenderer.invoke('sqf-adapter-cancel')});

contextBridge.exposeInMainWorld('plannerCompatibility',{status:()=>ipcRenderer.invoke('compatibility-status')});

contextBridge.exposeInMainWorld('plannerLifecycle',{deploymentState:state=>ipcRenderer.send('command-deployment-close-state',state)});
