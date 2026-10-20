'use strict';
const path=require('node:path'),fs=require('node:fs'),{spawn}=require('node:child_process');
const {createRelay}=require('./bridge-runtime/relay');
const {createRemote}=require('./remote-bridge');
function createFreeBridge(onState=()=>{},deps={}) {
 const spawnHelper=deps.spawn||spawn,relayFactory=deps.createRelay||createRelay,remoteFactory=deps.createRemote||(callback=>createRemote(callback,{allowHttp:true}));
 let generation=0,relay=null,child=null,remote=null,cancel=null,starting=false;
 let state={mode:'free',status:'off',token:'',endpoint:'',point:null,received:0};
 const publish=()=>onState({...state});
 function stop(reason='') {
  generation++;starting=false;cancel?.abort();cancel=null;
  const oldRemote=remote;remote=null;oldRemote?.stop();
  const oldChild=child;child=null;oldChild?.kill();
  const oldRelay=relay;relay=null;if(oldRelay){oldRelay.close();oldRelay.closeAllConnections();}
  state={...(reason?{diagnostics:state.diagnostics,lastReceived:state.lastReceived,traffic:state.traffic}:{}),mode:'free',status:reason?'error':'off',error:reason,token:'',endpoint:'',point:null,received:0};publish();return {...state};
 }
 async function start(options={}) {
  if(starting||state.status!=='off'&&state.status!=='error')return {...state};
  stop();const ticket=generation;starting=true;cancel=new AbortController();const signal=cancel.signal;const startedAt=Date.now();
  const check=()=>{if(ticket!==generation)throw Error('Cancelled');};
  const progress=(phase,details={})=>{if(ticket!==generation||signal.aborted)return;state={...state,startup:{phase,elapsedMs:Date.now()-startedAt,...details}};publish();};
  state.status='starting';progress('requesting-address');
  try {
   const exe=path.join(__dirname,'bridge-runtime/cloudflared.exe');
   if(!deps.spawn&&!fs.existsSync(exe))throw Error('Tunnel helper is missing. Extract the whole application ZIP.');
   const srv=relayFactory();relay=srv;
   await new Promise((resolve,reject)=>{srv.once('error',reject);srv.listen(0,'127.0.0.1',()=>{if(signal.aborted){srv.close();reject(Error('Cancelled'));}else resolve();});});check();
   child=spawnHelper(exe,['tunnel','--url','http://127.0.0.1:'+srv.address().port,'--no-autoupdate'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
   const helper=child;
   const endpoint=await new Promise((resolve,reject)=>{
    let buffer='',publicURL='',registered=false;const timeout=setTimeout(()=>finish(Error('Tunnel startup timed out. Check your internet connection and retry.')),45000);
    const aborted=()=>finish(Error('Cancelled'));
    function finish(error,url){clearTimeout(timeout);signal.removeEventListener('abort',aborted);helper.stdout.removeListener('data',output);helper.stderr.removeListener('data',output);if(error)reject(error);else resolve(url);}
    function output(chunk){buffer=(buffer+String(chunk)).slice(-16000);const match=buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);if(match&&!publicURL){publicURL=match[0]+'/';progress('connecting-edge');}if(buffer.includes('Registered tunnel connection'))registered=true;if(publicURL&&registered)finish(null,publicURL);}
    helper.stdout.on('data',output);helper.stderr.on('data',output);signal.addEventListener('abort',aborted,{once:true});
    helper.once('error',()=>{finish(Error('Tunnel helper could not start.'));if(ticket===generation)stop('Tunnel helper could not start.');});
    helper.once('exit',()=>{finish(Error('Tunnel stopped. Click Start free connection to create a new address.'));if(ticket===generation)stop('Tunnel stopped. Start again and copy the new address and code into the game.');});
   });check();
   // Drain output but do not persist addresses or credentials in logs.
   helper.stdout.resume();helper.stderr.resume();
   state={...state,status:'pairing',endpoint,publicReachability:'checking'};progress('creating-code');
   remote=remoteFactory(s=>{
    if(ticket!==generation)return;
    if(['off','expired','authentication-failed','security-lockout','unsupported','interrupted','error'].includes(s.status)){if(!starting||s.status!=='off')stop(s.error||'Pairing expired. Start again and copy the new code into the game.');return;}
    state={...s,mode:'free',endpoint,error:'',publicReachability:s.received>0?'verified-by-game':state.publicReachability||'checking',connectionWarning:s.received>0?'':state.connectionWarning||'',...(s.status==='starting'?{startup:{phase:'creating-code',elapsedMs:Date.now()-startedAt}}:{})};publish();
   });
   // The planner and relay share this PC. Keep reads and pairing local;
   // only the game needs the public tunnel. Never expose this loopback URL in UI.
   await remote.start('http://127.0.0.1:'+srv.address().port+'/',options);
   check();starting=false;
   // Local credentials do not depend on this PC resolving a newly issued public hostname.
   // Registration is required above; public reachability remains explicit, never assumed.
   void (async()=>{try{
    await (deps.probe||require('./public-relay-health').waitForPublicRelay)(endpoint,signal,{onProgress:info=>{if(ticket===generation&&!signal.aborted){state={...state,publicCheck:{...info,elapsedMs:Date.now()-startedAt}};publish();}}});
    if(ticket===generation&&!signal.aborted){state={...state,publicReachability:'verified',connectionWarning:''};publish();}
   }catch(error){if(ticket===generation&&!signal.aborted&&!state.received){state={...state,publicReachability:'unconfirmed',connectionWarning:'Public reachability could not be confirmed from this PC. The address and code remain available; check whether the game can connect.'};publish();}}})();
   return {...state};
  }catch(e){if(ticket===generation)stop(e.message);return {...state};}
 }
 return {start,stop,gm:(action,payload)=>{if(!remote)throw Error('Connect first');return remote.gm(action,payload);},status:()=>({...state})};
}
module.exports={createFreeBridge};



