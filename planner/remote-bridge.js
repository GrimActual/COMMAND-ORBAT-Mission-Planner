"use strict";
// Read-only, single-feed client. Every await is guarded by a connection generation.
function createRemote(onState=()=>{}, {fetchImpl=fetch,allowHttp=false,pollMs=2000,clock=Date.now,retryBaseMs=1000}={}) {
 let tracked=null;
 let epoch=0,timer,staleTimer,controller,base='',reader='',sessionId='',entityId='',sequence=0,expires=0,lastAdvance=0,failures=0,violations=0,settings={},acceptedPoint=null;
 let state=empty();
 function empty(){return {status:'off',mode:'remote',token:'',point:null,received:0,lastReceived:null,diagnostics:[],traffic:{requests:0,bytes:0},retries:0};}
 const publish=()=>onState({...state,traffic:{...state.traffic},diagnostics:state.diagnostics.map(x=>({...x}))});
 function event(severity,message){const a=state.diagnostics,last=a[a.length-1];if(last?.message===message){last.count++;last.at=clock();}else{a.push({severity,message,at:clock(),count:1});if(a.length>30)a.shift();}}
 function halt(status,message){clearTimeout(timer);clearInterval(staleTimer);state={...state,status,token:'',point:null,error:message};controller?.abort();if(!settings.serverManaged)revoke(base,reader);event(status==='security-lockout'?'Security Lockout':'Critical',message);publish();}
 async function request(url,options={},signal){state.traffic.requests++;const res=await fetchImpl(url,{...options,redirect:'error',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(settings.timeoutMs||5000)]):AbortSignal.timeout(settings.timeoutMs||5000)});return res;}
 async function json(res){if(Number(res.headers.get('content-length'))>4096)throw Object.assign(Error('Relay response exceeds 4 KB'),{invalid:true});let size=0,parts=[];const stream=res.body.getReader();try{while(true){const {done,value}=await stream.read();if(done)break;size+=value.length;if(size>4096)throw Object.assign(Error('Relay response exceeds 4 KB'),{invalid:true});parts.push(value);}}finally{await stream.cancel().catch(()=>{});}state.traffic.bytes+=size;try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw Object.assign(Error('Malformed relay response'),{invalid:true});}}
 function revoke(b,r){if(r)fetchImpl(b+'session',{method:'DELETE',headers:{Authorization:'Bearer '+r},redirect:'error',signal:AbortSignal.timeout(3000)}).catch(()=>{});}
 function stop(options={}){if(tracked){const old=tracked;tracked=null;old.stop(options);}epoch++;clearTimeout(timer);clearInterval(staleTimer);controller?.abort();controller=null;const b=base,r=reader;base='';reader='';sessionId='';entityId='';sequence=0;expires=0;lastAdvance=0;failures=0;violations=0;acceptedPoint=null;state=empty();publish();if(options.endSession||!settings.serverManaged)revoke(b,r);return {...state};}
 async function start(endpoint,options={}) {
  stop();if(options.entityIds||options.readerCredential){tracked=require('./tracked-remote').createTrackedRemote(onState,{fetchImpl,allowHttp,clock,retryBaseMs});return tracked.start(endpoint,options);}let url;try{url=new URL(endpoint);}catch{throw Error('Enter the relay HTTPS address.');}
  if(typeof endpoint!=='string'||endpoint.length>240||(url.protocol!=='https:'&&!(allowHttp&&url.protocol==='http:'&&url.hostname==='127.0.0.1'))||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('Use an HTTPS relay root address without a path or credentials.');
  settings={serverManaged:options.serverManaged===true,intervalMs:options.intervalMs??pollMs,timeoutMs:options.timeoutMs??5000,autoReconnect:options.autoReconnect??true,dedicated:options.dedicated===true};
  if(!Number.isFinite(settings.intervalMs)||settings.intervalMs<10||settings.intervalMs>5000||!Number.isInteger(settings.timeoutMs)||settings.timeoutMs<100||settings.timeoutMs>15000||typeof settings.autoReconnect!=='boolean')throw Error('Unsupported connection settings');
  const generation=epoch;base=url.href;controller=new AbortController();const signal=controller.signal;
  state={...state,status:'starting',endpoint:base};event('Information','Connection started');publish();
  let session;
  try{const res=await request(base+'sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:settings.dedicated?JSON.stringify({protocol:2,scope:'single-entity'}):'{}'},signal);
   if(generation!==epoch&&!res.ok)return {...state};
   if(!res.ok){const status=res.status===401||res.status===403?'authentication-failed':res.status===400||res.status===404||res.status===426?'unsupported':'error';halt(status,status==='unsupported'?'Relay does not support dedicated protocol v2. Update the relay.':'Could not create session (HTTP '+res.status+').');return {...state};}
   session=await json(res);
   if(!/^[a-f0-9]{32}$/.test(session.token)||!/^[a-f0-9]{64}$/.test(session.reader)||!Number.isFinite(session.expires)||session.expires<=clock()||(settings.dedicated&&(session.protocol!==2||!/^[a-f0-9]{32}$/.test(session.sessionId))))throw Object.assign(Error('Invalid or unsupported relay session'),{invalid:true});
  }catch(e){if(generation===epoch)halt(e.invalid?'unsupported':'error',e.invalid?e.message:'Relay unreachable or timed out. Check the HTTPS endpoint.');return {...state};}
  if(generation!==epoch){revoke(url.href,session.reader);return {...state};}
  reader=session.reader;sessionId=session.sessionId||'';expires=session.expires;state={...state,status:'waiting',token:session.token};event('Information','Pairing completed; waiting for permitted position');publish();
  async function poll(){if(generation!==epoch)return;if(clock()>=expires){halt('expired','Session expired. Connect again and configure the new pairing code.');return;}
   let delay=settings.intervalMs;
   try{const res=await request(base+'session',{headers:{Authorization:'Bearer '+reader}},signal);if(generation!==epoch)return;
    if(res.status===401){halt(clock()>=expires?'expired':'authentication-failed','Session expired or revoked. Connect again and configure the new pairing code.');return;}
    if(res.status===423){halt('security-lockout','Relay locked this session after repeated invalid messages. Start a new session after checking the sender.');return;}
    if(!res.ok)throw Error('Relay unavailable');
    const data=await json(res);if(generation!==epoch)return;
    if(data.protocol!==undefined&&data.protocol!==1&&data.protocol!==2){halt('unsupported','Unsupported bridge protocol');return;}
    if((settings.dedicated&&(data.protocol!==2||data.sessionId!==sessionId||(data.point!==null&&(typeof data.entityId!=='string'||!/^[-a-zA-Z0-9_]{1,64}$/.test(data.entityId)||(entityId&&data.entityId!==entityId)))))||!Number.isSafeInteger(data.sequence)||data.sequence<sequence||data.sequence<0||(data.point!==null&&(!data.point||!Number.isFinite(data.point.x)||!Number.isFinite(data.point.z)||Math.abs(data.point.x)>13500||Math.abs(data.point.z)>13500))||(data.point!==null&&data.sequence===0))throw Object.assign(Error('Invalid or out-of-order relay marker'),{invalid:true});
    if(data.sequence===sequence&&data.point&&acceptedPoint&&(data.point.x!==acceptedPoint.x||data.point.z!==acceptedPoint.z))throw Object.assign(Error('Position changed without a revision'),{invalid:true});
    if(settings.dedicated&&data.point)entityId=data.entityId;
    if(data.sequence>sequence){lastAdvance=clock();state.lastReceived=lastAdvance;event('Information','Position received');}
    sequence=data.sequence;if(data.point)acceptedPoint={...data.point};failures=0;
    const point=data.point&&clock()-lastAdvance<7000?data.point:null;
    state={...state,status:point?'connected':sequence?'stale':'waiting',point,received:sequence,error:'',retries:0};publish();
   }catch(e){if(generation!==epoch)return;state.point=null;
    if(e.invalid){violations++;event('Critical',e.message);if(violations>=3){halt('security-lockout','Repeated invalid relay responses. Session disabled; offline planner remains available.');return;}}
    if(!settings.autoReconnect||++failures>5){halt('interrupted','Connection interrupted. Retry limit reached or automatic reconnect is disabled. Connect manually.');return;}
    delay=Math.min(30000,retryBaseMs*2**(failures-1));state={...state,status:'reconnecting',point:null,retries:failures,error:''};event('Warning','Connection interrupted; bounded retry');publish();
   }
   if(generation===epoch)timer=setTimeout(poll,delay);
  }
  staleTimer=setInterval(()=>{if(generation===epoch&&state.point&&clock()-lastAdvance>=7000){state={...state,status:'stale',point:null};event('Warning','Position became stale');publish();}},500);staleTimer.unref?.();
  timer=setTimeout(poll,0);return {...state};
 }
 async function endSession(){if(tracked)return tracked.endSession();if(!reader)throw Error('No active session');const at=epoch,res=await request(base+'session',{method:'DELETE',headers:{Authorization:'Bearer '+reader}},controller?.signal);if(at!==epoch)throw Error('Session changed');if(!res.ok&&res.status!==401)throw Error('Session end was not acknowledged; try again');reader='';return stop();}
 return {start,stop,endSession,gm:(action,payload)=>{if(!tracked)throw Error('A mixed GM-enabled session is required');return tracked.gm(action,payload);},dashboardKey:()=>tracked?tracked.dashboardKey():'',status:()=>tracked?tracked.status():({...state,serverManaged:settings.serverManaged===true})};
}
module.exports={createRemote};
