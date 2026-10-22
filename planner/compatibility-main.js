'use strict';
const fs=require('node:fs'),path=require('node:path');
function install({ipcMain,getWindow,indexURL,version=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8')).version,proof=()=>require('./sqf-scheduled-functions').verification()}){
 const release=JSON.parse(fs.readFileSync(path.join(__dirname,'release-info.json'),'utf8'));
 const trusted=(event,args)=>{const win=getWindow();if(!win||win.isDestroyed()||event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||event.senderFrame.url!==indexURL||args.length)throw Error('Unexpected compatibility sender');};
 const describe=verified=>({releaseChannel:release.channel==='stable-planner'||release.channel==='stable-planner-experimental-live'?"Stable planner — live controls experimental":"Release candidate — live integration remains experimental",matchingBridgeVersion:release.matchingBridgeVersion,desktopVersion:version,lastNativeEngine:verified?.engineVersion||null,schedulerCases:verified?.cases||0,generatedProjectNeedsCompilation:true,liveSessionVerified:false,liveProtocol:3,trackingLimit:60,bridgeProjectId:'6A969EB0C5012BB9',orderCapabilities:['ai-orders-v1','ai-tactical-v1'],offlineAvailable:true});
 // The connection hint needs declared versions, not an expensive native-fixture recheck.
 ipcMain.handle('compatibility-summary',(event,...args)=>{trusted(event,args);return describe(null);});
 ipcMain.handle('compatibility-status',async(event,...args)=>{trusted(event,args);return describe(await proof());});
}
module.exports={install};
