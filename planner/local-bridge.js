"use strict";
const http=require('node:http'),crypto=require('node:crypto');
function createReceiver(onState=()=>{},port=8791){
 let server=null,timer=null,epoch=0,last=0,windowAt=0,requests=0;
 let state={status:'off',token:'',point:null,received:0};
 const publish=()=>onState({...state});
 function stop(){epoch++;clearInterval(timer);timer=null;const old=server;server=null;if(old){old.close();old.closeAllConnections();}state={status:'off',token:'',point:null,received:0};publish();return {...state};}
 async function start(){if(server)return {...state};const generation=++epoch;state={status:'starting',token:crypto.randomBytes(16).toString('hex'),point:null,received:0};last=0;windowAt=0;requests=0;
 const srv=http.createServer((req,res)=>{
  const reply=(code,body)=>{if(!res.writableEnded){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','Connection':'close'});res.end(JSON.stringify(body));}};
  if(generation!==epoch)return reply(503,{error:'stopped'});
  if(req.headers.origin || req.headers.host!==`127.0.0.1:${srv.address().port}`)return reply(403,{error:'forbidden'});
  if(req.method!=='POST'||req.url!=='/marker')return reply(404,{error:'unknown endpoint'});
  const now=Date.now();if(now-windowAt>1000){windowAt=now;requests=0;}if(++requests>10)return reply(429,{error:'rate limit'});
  let bytes=0,parts=[];req.setTimeout(3000,()=>req.destroy());
  req.on('data',b=>{bytes+=b.length;if(bytes>2048){reply(413,{error:'too large'});req.destroy();}else parts.push(b);});req.on('error',()=>{});
  req.on('end',()=>{if(res.writableEnded||generation!==epoch)return;let m;try{m=JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{return reply(400,{error:'invalid JSON'});}
   if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).sort().join(',')!=='token,x,z'||!Number.isFinite(m.x)||!Number.isFinite(m.z)||Math.abs(m.x)>13500||Math.abs(m.z)>13500)return reply(400,{error:'invalid marker'});
   if(typeof m.token!=='string'||!/^[a-f0-9]{32}$/.test(m.token)||!crypto.timingSafeEqual(Buffer.from(m.token),Buffer.from(state.token)))return reply(401,{error:'pairing failed'});
   last=Date.now();state={...state,status:'connected',point:{x:m.x,z:m.z},received:state.received+1};publish();reply(200,{ok:true});
  });
 });server=srv;srv.requestTimeout=4000;srv.headersTimeout=4000;srv.maxHeadersCount=16;srv.maxConnections=8;
 try{await new Promise((resolve,reject)=>{srv.once('error',reject);srv.listen(port,'127.0.0.1',resolve);});}catch(e){if(generation===epoch){stop();}throw Error(e.code==='EADDRINUSE'?'Port 8791 is already in use. Close the other local test receiver.':'Local receiver could not start.');}
 if(generation!==epoch){srv.close();return {...state};}
 srv.on('error',()=>{if(generation===epoch)stop();});state.status='waiting';publish();timer=setInterval(()=>{if(last&&Date.now()-last>7000&&state.status==='connected'){state.status='stale';state.point=null;publish();}},1000);timer.unref();return {...state};
 }
 return {start,stop,status:()=>({...state}),port:()=>server?.address()?.port};
}
function install({app,ipcMain,getWindow,indexURL,clipboard}){
 const publish=state=>{const w=getWindow();if(w&&!w.isDestroyed())w.webContents.send('local-bridge-state',state);};
 const local=createReceiver(publish);
 const remote=require('./remote-bridge').createRemote(publish);
 const free=require('./free-bridge').createFreeBridge(publish);

 let active=local;
 function stop(){local.stop();remote.stop();free.stop();active=local;return local.status();}
 ipcMain.handle('local-bridge-command',async(event,action,options)=>{
  const w=getWindow();if(!w||event.sender!==w.webContents||event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==indexURL)throw Error('Unexpected sender');
  if(action==='gm-request'){return active.gm('request',require('./bridge-runtime/gm-commands').fromIntent(require('./deployment-intent').validate(options.intent),options.requestId));}
  if(action==='gm-occupied'){const G=require('./bridge-runtime/gm-commands'),request=G.fromIntent(require('./deployment-intent').validate(options.intent),options.requestId);request.occupied=options.occupied;return active.gm('request',G.validate(request));}
  if(action==='gm-refuel')return active.gm('request',require('./bridge-runtime/refuel-contract').validate(options?.request));
  if(action==='gm-helicopter')return active.gm('request',require('./bridge-runtime/helicopter-insertion-contract').validate(options?.request));
  if(action==='gm-vehicle'){return active.gm('request',require('./bridge-runtime/vehicle-control-contract').validate(options?.request));}
  if(action==='gm-scenario'){return active.gm('request',require('./bridge-runtime/scenario-contract').validate(options?.request));}
  if(action==='gm-order'){const request=require('./bridge-runtime/ai-orders-contract').validate(options?.request);return active.gm('request',request);}
  if(action==='gm-cancel')return active.gm('cancel',options.requestId);
  if(action==='gm-status')return active.gm('status');
  if(action==='gm-remove'){return active.gm('request',{version:1,requestId:options.requestId,kind:'remove',targetRequestId:options.targetRequestId});}
  if(action==='profile-start'){const profile=require('./server-profiles').validate(options);stop();active=profile.method==='free'?free:remote;const config={intervalMs:profile.intervalMs,timeoutMs:profile.timeoutMs,autoReconnect:profile.autoReconnect,dedicated:profile.deployment==='dedicated',gmCommands:profile.gmCommands===true,serverManaged:profile.method==='relay',...(profile.entityIds?{entityIds:profile.entityIds}: {})};return profile.method==='free'?free.start(config):remote.start(profile.endpoint,config);}
  if(action==='dedicated-attach'){if(!/^[a-f0-9]{64}$/.test(options?.readerCredential||''))throw Error('Enter the private 64-character dashboard key');stop();active=remote;return remote.start(options?.endpoint,{readerCredential:options?.readerCredential,serverManaged:true});}
  if(action==='end-session'){if(active.endSession)await active.endSession();else active.stop();return stop();}
  if(action==='copy-dashboard-key'){const key=active.dashboardKey?.();if(!key)throw Error('No remote dashboard key is available');clipboard.writeText(key);return active.status();}
  if(action==='free-start'){if(active===free&&!['off','error'].includes(free.status().status))return free.status();stop();active=free;return free.start();}
  if(action==='copy-address'||action==='copy-code'){const s=active.status();const value=action==='copy-address'?(s.endpoint||(s.status!=='off'?'http://127.0.0.1:8791/':'')):s.token;if(!value)throw Error('Start a connection first.');clipboard.writeText(value);return s;}
  if(action==='start'){stop();active=local;return local.start();}
  if(action==='remote-start'){if(typeof options?.endpoint!=='string'||options.endpoint.length>240)throw Error('Enter a relay address');stop();active=remote;return remote.start(options.endpoint,{serverManaged:true});}
  if(action==='stop')return stop();
  if(action==='status')return active.status();
  throw Error('Unknown command');
 });
 app.on('before-quit',stop);return {stop,status:()=>active.status()};
}
module.exports={createReceiver,install};

