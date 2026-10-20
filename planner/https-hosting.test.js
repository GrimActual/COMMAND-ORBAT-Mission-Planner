'use strict';
const test=require('node:test'),a=require('node:assert/strict'),{createRelay}=require('./bridge-runtime/relay'),{createTrackedRemote}=require('./tracked-remote');
async function fixture(t){const server=createRelay();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.close();server.closeAllConnections();});const base='http://127.0.0.1:'+server.address().port+'/',post=(path,body)=>fetch(base+path,{method:'POST',body:JSON.stringify(body)});return {base,post};}
const spawn={version:1,requestId:'spawn1',kind:'spawn',sourceMissionSha256:'a'.repeat(64),entities:[{unitId:'u',name:'Test',resourceName:'{26A9756790131354}Prefabs/Characters/Factions/BLUFOR/US_Army/Character_US_Rifleman.et',worldX:4700,worldZ:11950,headingDegrees:90}]};
test('server-managed dashboard disconnect, fresh reattachment and explicit end retain then revoke the same session',async t=>{
 const {base,post}=await fixture(t),remote=createTrackedRemote(()=>{},{allowHttp:true});t.after(()=>remote.stop({endSession:true}));
 const first=await remote.start(base,{entityIds:['fixture'],gmCommands:true,serverManaged:true}),key=remote.dashboardKey();a.equal(key.length,64);a.equal(first.serverManaged,true);remote.stop();
 a.equal((await post('gm-status',{reader:key})).status,200);
 const second=await remote.start(base,{readerCredential:key,serverManaged:true});a.equal(second.sessionId,first.sessionId);a.equal(second.token,first.token);
 await post('gm-request',{reader:key,request:spawn});a.equal((await remote.gm('status')).records[0].request.requestId,'spawn1');
 remote.stop({endSession:true});await new Promise(r=>setTimeout(r,30));a.equal((await post('dashboard-attach',{reader:key})).status,401);
});
test('dashboard reattachment rejects a URL alone, writer keys and invalid envelopes without changing existing session',async t=>{
 const {post}=await fixture(t),s=await(await post('sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['fixture'],gmCommands:true})).json();
 a.equal((await post('dashboard-attach',{})).status,400);a.equal((await post('dashboard-attach',{reader:s.token})).status,401);a.equal((await post('dashboard-attach',{reader:s.reader,autoApprove:true})).status,400);a.equal((await post('dashboard-attach',{reader:s.reader})).status,200);
});
test('automatic approval is writer-scoped, individually permitted, recorded and idempotent; snapshots stay manual',async t=>{
 const {post}=await fixture(t),s=await(await post('sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['fixture'],gmCommands:true})).json(),policy={aiOrders:true,spawning:false,removal:false};
 a.equal((await post('gm-poll',{token:s.reader,approvalPolicy:policy})).status,401);
 a.equal((await post('gm-status',{reader:s.reader,approvalPolicy:policy})).status,409);
 a.equal((await post('gm-poll',{token:s.token,approvalPolicy:policy})).status,200);
 a.equal((await post('gm-request',{reader:s.reader,request:spawn})).status,202);
 a.equal((await post('gm-approve',{token:s.token,requestId:'spawn1',approvalMode:'automatic'})).status,409);
 a.equal((await post('gm-poll',{token:s.token,approvalPolicy:{...policy,spawning:true}})).status,200);
 const approved=await(await post('gm-approve',{token:s.token,requestId:'spawn1',approvalMode:'automatic'})).json();a.equal(approved.record.phase,'approved');a.equal(approved.record.approvalMode,'automatic');
 const again=await(await post('gm-approve',{token:s.token,requestId:'spawn1'})).json();a.equal(again.record.expiresAt,approved.record.expiresAt);a.equal(again.record.approvalMode,'automatic');
 a.equal((await post('gm-result',{token:s.token,result:{requestId:'spawn1',status:'executed',message:'Done',createdIds:['one']}})).status,200);
 await new Promise(r=>setTimeout(r,1050));a.equal((await post('gm-request',{reader:s.reader,request:{version:1,requestId:'remove1',kind:'remove',targetRequestId:'spawn1'}})).status,202);a.equal((await post('gm-approve',{token:s.token,requestId:'remove1',approvalMode:'automatic'})).status,409);
 const manual=await(await post('gm-approve',{token:s.token,requestId:'remove1'})).json();a.equal(manual.record.approvalMode,'manual');
 const status=await(await post('gm-status',{reader:s.reader})).json();a.equal(status.approval.confirmed,true);a.equal(status.approval.spawning,true);
 const Policy=require('./bridge-runtime/approval-policy');for(const kind of ['scenario-restore','scenario-review','scenario-save-current','scenario-save-plan'])a.equal(Policy.eligible(kind,{aiOrders:true,spawning:true,removal:true}),false);
});
test('invalid policy does not confer permission and stale bridge contact is not shown as confirmed',async t=>{
 let now=10000;const server=createRelay({clock:()=>now});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.close();server.closeAllConnections();});const base='http://127.0.0.1:'+server.address().port+'/',post=(p,b)=>fetch(base+p,{method:'POST',body:JSON.stringify(b)}),s=await(await post('sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['fixture'],gmCommands:true})).json();
 a.equal((await post('gm-poll',{token:s.token,approvalPolicy:{aiOrders:true,spawning:'true',removal:false}})).status,409);
 a.equal((await(await post('gm-status',{reader:s.reader})).json()).approval.confirmed,false);
 await post('gm-poll',{token:s.token,approvalPolicy:{aiOrders:false,spawning:false,removal:false}});now+=7000;a.equal((await(await post('gm-status',{reader:s.reader})).json()).approval.confirmed,false);
});

test('End session waits for acknowledgement; failed revocation retains a retryable dashboard',async t=>{
 const {base}=await fixture(t);let fail=true;const remote=createTrackedRemote(()=>{},{allowHttp:true,fetchImpl:async(url,options)=>{if(options?.method==='DELETE'&&fail)return new Response('{}',{status:503});return fetch(url,options);}});t.after(()=>remote.stop({endSession:true}));
 await remote.start(base,{entityIds:['fixture'],serverManaged:true});const key=remote.dashboardKey();await a.rejects(remote.endSession(),/not acknowledged/);a.equal(remote.dashboardKey(),key);fail=false;await remote.endSession();a.equal(remote.status().status,'off');a.equal((await fetch(base+'dashboard-attach',{method:'POST',body:JSON.stringify({reader:key})})).status,401);
});
test('approval status rides the tracking response without extra requests or mutable exposed policy state',async t=>{
 const {base,post}=await fixture(t);let polls=0,gmStatuses=0;const remote=createTrackedRemote(()=>{},{allowHttp:true,fetchImpl:(url,options)=>{if(url.endsWith('/session'))polls++;if(url.endsWith('/gm-status'))gmStatuses++;return fetch(url,options);}});t.after(()=>remote.stop({endSession:true}));
 const s=await remote.start(base,{entityIds:['fixture'],gmCommands:true});await post('gm-poll',{token:s.token,approvalPolicy:{aiOrders:true,spawning:false,removal:false}});for(let n=0;n<150&&!remote.status().approval?.confirmed;n++)await new Promise(r=>setTimeout(r,20));a.equal(remote.status().approval.confirmed,true);a.ok(polls>0);a.equal(gmStatuses,0);const exposed=remote.status();exposed.approval.aiOrders=false;a.equal(remote.status().approval.aiOrders,true);
});
test('server relay startup configuration is loopback-oriented and lifetime is bounded independently of mission data',()=>{
 const {options}=require('../relay/dedicated-server');a.deepEqual(options({}),{port:8080,lifetime:3600000});a.deepEqual(options({COMMAND_RELAY_PORT:'9000',COMMAND_RELAY_HOURS:'12'}),{port:9000,lifetime:43200000});for(const hours of ['0','25','Infinity','1.5'])a.throws(()=>options({COMMAND_RELAY_HOURS:hours}));for(const port of ['0','65536','bad'])a.throws(()=>options({COMMAND_RELAY_PORT:port}));
});

test('container distribution contains the complete relay dependency closure',async t=>{
 const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),root=path.join(__dirname,'../relay'),dir=await fs.mkdtemp(path.join(os.tmpdir(),'command-relay-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const docker=await fs.readFile(root+'/Dockerfile','utf8'),line=docker.split(/\r?\n/).find(l=>l.startsWith('COPY ')),files=line.split(/\s+/).slice(2,-1);for(const file of files)await fs.copyFile(path.join(root,file),path.join(dir,file));const server=require(path.join(dir,'server.js')).createRelay();server.close();a.equal(typeof require(path.join(dir,'dedicated-server.js')).options,'function');
});
