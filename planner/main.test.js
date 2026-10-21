'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),{EventEmitter}=require('node:events');
async function desktop(){
 const app=new EventEmitter(),dialogs=[],windows=[];let rejectLoad;
 Object.assign(app,{requestSingleInstanceLock:()=>true,whenReady:()=>Promise.resolve(),getVersion:()=> 'test',getPath:()=> '/test-profile',quit:()=>app.emit('before-quit')});
 class Window extends EventEmitter{
  constructor(){super();windows.push(this);this.webContents=new EventEmitter();this.webContents.setWindowOpenHandler=()=>{};this.webContents.send=()=>{};}
  setMenuBarVisibility(){}isDestroyed(){return false;}show(){}
  loadFile(){return new Promise((resolve,reject)=>{rejectLoad=reject;});}
 }
 const electron={app,BrowserWindow:Window,ipcMain:{handle(){},on(){}},shell:{},dialog:{showErrorBox:(...args)=>dialogs.push(args)}};
 const fakeFS={mkdirSync(){},existsSync:()=>false,appendFileSync(){}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'main.js'),'utf8'),{require:name=>name==='electron'?electron:name==='fs'?fakeFS:require(name),__dirname,process:{platform:'win32'},console,AbortController,setTimeout,clearTimeout});
 await new Promise(setImmediate);return {app,win:windows[0],dialogs,reject:()=>rejectLoad(Object.assign(Error('aborted'),{code:'ERR_FAILED'}))};
}
test('closing during startup does not open a blocking load-error dialog before the closed event',async()=>{
 const d=await desktop();d.win.emit('close');d.reject();await new Promise(setImmediate);assert.equal(d.dialogs.length,0);d.win.emit('closed');
});
test('a genuine load failure still reports the missing application and quits',async()=>{
 const d=await desktop();let quit=false;d.app.on('before-quit',()=>{quit=true;});d.reject();await new Promise(setImmediate);assert.equal(d.dialogs.length,1);assert.match(d.dialogs[0][0],/could not open/);assert.equal(quit,true);
});
