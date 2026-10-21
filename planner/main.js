'use strict';
const {app,BrowserWindow,ipcMain,shell,dialog,clipboard,screen}=require('electron');
const path=require('path');
const fs=require('fs');
const {pathToFileURL}=require('url');
let mainWindow=null,quitting=false;
const pendingTiles=new Set();
const indexPath=path.join(__dirname,'index.html');
const indexURL=pathToFileURL(indexPath).href;
if(typeof app.setPath==='function'&&!process.argv?.some(a=>a.startsWith('--user-data-dir')))app.setPath('userData',path.join(app.getPath('appData'),'Everon-ORBAT-OneClick-Bridge'));
const deploymentClose=require('./deployment-close-main').install({app,ipcMain,getWindow:()=>mainWindow,indexURL,dialog});
const localBridge=require('./local-bridge').install({app,ipcMain,getWindow:()=>mainWindow,indexURL,clipboard});
const simulation=require('./simulation-main').install({app,ipcMain,getWindow:()=>mainWindow,indexURL});
const metadata=require('./workbench-metadata-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL});
const dependencyReview=require('./sqf-dependency-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL});
const functionReview=require('./sqf-dependency-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL,profile:'functions'});
const effectReview=require('./sqf-dependency-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL,profile:'effects'});
const typeReview=require('./sqf-dependency-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL,profile:'types'});
const projectReview=require('./sqf-project-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL,reviews:{dependencies:dependencyReview,functions:functionReview,types:typeReview,effects:effectReview}});
const diagnosticExport=require('./sqf-diagnostic-export-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL,reviews:{dependencies:dependencyReview,functions:functionReview,types:typeReview,effects:effectReview}});
const migrationAdapters=require('./sqf-adapter-main').install({ipcMain,dialog,getWindow:()=>mainWindow,indexURL,reviews:{dependencies:dependencyReview,functions:functionReview,types:typeReview,effects:effectReview}});
require('./compatibility-main').install({ipcMain,getWindow:()=>mainWindow,indexURL});
require('./display-main').install({app,ipcMain,screen,getWindow:()=>mainWindow,indexURL});
function log(event){try{const file=path.join(app.getPath('userData'),'planner-lifecycle.log');fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file)&&fs.statSync(file).size>250000)fs.renameSync(file,file+'.previous');fs.appendFileSync(file,new Date().toISOString()+' '+event+'\n')}catch{}}
function external(url){try{const parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol))return;shell.openExternal(parsed.href).catch(()=>log('external-link-failed'))}catch{}}
function showWindow(){if(quitting)return;if(!mainWindow||mainWindow.isDestroyed()){createWindow();return}if(mainWindow.isMinimized())mainWindow.restore();mainWindow.show();mainWindow.focus();}
function createWindow(){
 if(quitting)return;
 const startupSize=require('./display-main').size(screen?.getPrimaryDisplay?.()?.workArea);
 const win=new BrowserWindow({...startupSize,title:'COMMAND — Mission Planning & Control '+app.getVersion()+' — Candidate',icon:path.join(__dirname,'command-icon.ico'),show:false,webPreferences:{nodeIntegration:false,contextIsolation:true,preload:path.join(__dirname,'preload.js')}});
 mainWindow=win;deploymentClose.attach(win);win.setMenuBarVisibility(false);
 win.webContents.on('did-start-navigation',(_event,_url,_inPlace,isMainFrame)=>{if(isMainFrame){deploymentClose.reset();simulation.reset();localBridge.stop();metadata.reset();dependencyReview.reset();functionReview.reset();typeReview.reset();effectReview.reset();diagnosticExport.reset();migrationAdapters.reset();projectReview.reset();}});
 win.webContents.on('render-process-gone',()=>{simulation.reset();localBridge.stop();metadata.reset();dependencyReview.reset();functionReview.reset();typeReview.reset();effectReview.reset();diagnosticExport.reset();migrationAdapters.reset();projectReview.reset();});
 // Closing during the initial load aborts loadFile before the closed event fires.
 // Do not turn that normal shutdown into a blocking startup-error dialog.
 let closing=false;win.on('close',event=>{if(!event?.defaultPrevented)closing=true;});
 win.once('ready-to-show',()=>{if(!win.isDestroyed())win.show()});
 // Remote map imagery must not keep an otherwise usable workspace hidden.
 win.webContents.once('dom-ready',()=>{if(!closing&&!win.isDestroyed())win.show();});
 // Workshop links belong in the system browser, never in hidden app windows.
 win.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'}});
 win.webContents.on('will-navigate',(event,url)=>{if(url!==indexURL){event.preventDefault();external(url)}});
 win.webContents.on('render-process-gone',(_event,details)=>{log('renderer-exited '+details.reason);if(!quitting&&!win.isDestroyed()){win.show();dialog.showMessageBox(win,{type:'error',title:'Planner needs to reload',message:'The planner window stopped responding.',detail:'Reload to restore the last locally saved plan. Unapplied edits may not have been saved.',buttons:['Reload','Exit'],defaultId:0,cancelId:1}).then(({response})=>{if(quitting||win.isDestroyed())return;if(response===0)win.reload();else app.quit()})}});
 win.on('unresponsive',()=>log('window-unresponsive'));
 win.on('closed',()=>{if(mainWindow===win)mainWindow=null;log('main-window-closed');if(process.platform!=='darwin')app.quit()});
 win.loadFile(indexPath).then(()=>{log('window-loaded');if(!closing&&!win.isDestroyed())win.show()}).catch(error=>{if(closing||quitting||win.isDestroyed()){log('load-cancelled-on-close');return;}log('load-failed '+error.code);dialog.showErrorBox('Planner could not open','The application files could not be loaded. Extract the entire ZIP into a folder before running the EXE.');app.quit()});
}
const primary=app.requestSingleInstanceLock();
if(!primary){app.quit()}else{
 app.on('second-instance',()=>{log('second-launch-focus');if(app.isReady())showWindow();else app.once('ready',showWindow)});
 app.on('activate',()=>{if(app.isReady())showWindow()});
 app.on('before-quit',event=>{if(event?.defaultPrevented)return;metadata.reset();dependencyReview.reset();functionReview.reset();typeReview.reset();effectReview.reset();diagnosticExport.reset();migrationAdapters.reset();projectReview.reset();quitting=true;for(const controller of pendingTiles)controller.abort();log('before-quit')});
 app.on('will-quit',()=>log('will-quit'));
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
 ipcMain.handle('inject-mod-aos',async event=>{
  if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==indexURL)throw Error('Unexpected sender');
  const name='InvadeAMPAnnex-Reforged_65AF366F829759CB';
  const candidates=[path.join(app.getPath('documents'),'My Games','ArmaReforger','addons',name),path.join(app.getPath('home'),'OneDrive','Documents','My Games','ArmaReforger','addons',name)];
  let folder=candidates.find(p=>fs.existsSync(path.join(p,'meta')));
  if(!folder){const result=await dialog.showOpenDialog(mainWindow,{title:'Select Invade & Annex - Reforged 1.0.66 addon folder',properties:['openDirectory']});if(result.canceled)return null;folder=result.filePaths[0];}
  return require('./mod-ao').readAsync(folder);
 });
 ipcMain.handle('graphics-status',event=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==indexURL)throw Error('Unexpected sender');const status=app.getGPUFeatureStatus();return {compositing:status.gpu_compositing||'unknown',rasterization:status.rasterization||'unknown'};});
 ipcMain.handle('offline-base-tile',(event,c)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==indexURL)throw Error('Unexpected sender');if(!c||!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.x>3||c.y<0||c.y>3)throw Error('Invalid base tile');return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'terrain','everon',c.x+'-'+c.y+'.jpg')).toString('base64')});
 ipcMain.handle('presentation-tile',async(event,coord)=>{
  if(quitting)throw Error('Planner is closing');
  if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==indexURL)throw Error('Unexpected sender');
  if(!coord||!['z','x','y'].every(k=>Number.isInteger(coord[k]))||coord.z<0||coord.z>5||Math.abs(coord.x)>256||Math.abs(coord.y)>256)throw Error('Invalid tile');
  const ctrl=new AbortController();pendingTiles.add(ctrl);const timer=setTimeout(()=>ctrl.abort(),12000);
  try{const response=await fetch(`https://reforger.recoil.org/map-tiles/everon/${coord.z}/${coord.x}/${coord.y}/tile.jpg`,{signal:ctrl.signal,redirect:'error'});if(!response.ok)throw Error('Terrain HTTP '+response.status);const buffer=Buffer.from(await response.arrayBuffer());if(buffer.length>4000000)throw Error('Oversized tile');return 'data:image/jpeg;base64,'+buffer.toString('base64')}finally{clearTimeout(timer);pendingTiles.delete(ctrl)}
 });
 app.whenReady().then(()=>{log('startup '+app.getVersion());createWindow()}).catch(error=>{log('startup-failed '+error.name);dialog.showErrorBox('Planner startup failed','The planner could not start. See planner-lifecycle.log in the application data folder.');app.quit()});
}

