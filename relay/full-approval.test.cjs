'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const prefix=fs.existsSync(path.join(__dirname,'relay','approval-policy.js'))?'./relay/':'./';
const Approval=require(prefix+'approval-policy'),GM=require(prefix+'gm-commands'),F=require(prefix+'helicopter-insertion-contract'),{createRelay}=require(prefix+'server');
const manual={aiOrders:false,spawning:false,removal:false},full={...manual,allSupported:true},caps=[F.CAPABILITY,Approval.CAPABILITY];
const spawn={version:1,requestId:'deployment',kind:'spawn',sourceMissionSha256:'a'.repeat(64),entities:['team','aircraft'].map((unitId,i)=>({unitId,name:unitId,resourceName:'{70BAEEFC2D3FEE64}Prefabs/Vehicles/Helicopters/UH1H/UH1H.et',worldX:4930+i*10,worldZ:11740,headingDegrees:0}))};
const flight=(id='flight')=>({version:2,requestId:id,kind:F.KIND,targetRequestId:'deployment',unitId:'team',vehicleRequestId:'deployment',vehicleUnitId:'aircraft',worldX:4930,worldZ:11760,timeoutSeconds:300});
const progress={phase:'complete: landed passengers unloaded',elapsed:90,landed:true,grounded:true,unloaded:4,pilotAboard:true,passengersAboard:0,worldX:4930,worldY:35,worldZ:11760};
function queue(capabilities=caps){let now=1000;const q=GM.createQueue(()=>now);q.registerCapabilities(capabilities);q.submit(spawn);q.approve('deployment');q.result({requestId:'deployment',status:'executed',message:'spawned',createdIds:['1','2']});now+=1100;return {q,advance:n=>now+=n};}
test('all-supported exact kind inventory includes all 27 current typed operations, never prefixes',()=>{
 a.equal(Approval.SUPPORTED_KINDS.length,27);for(const kind of Approval.SUPPORTED_KINDS)a.equal(Approval.eligible(kind,full),true,kind);
 for(const kind of ['spawn-admin','ai-teleport','scenario-delete','helicopter-insert-debug','logistics-refuel-any','unknown',''])a.equal(Approval.eligible(kind,full),false,kind);
 a.equal(Approval.eligible('spawn',{...manual,spawning:true}),true);a.equal(Approval.eligible('ai-heal',{...manual,aiOrders:true}),true);
 for(const kind of [F.KIND,'scenario-restore','scenario-save-plan','logistics-refuel'])a.equal(Approval.eligible(kind,{aiOrders:true,spawning:true,removal:true}),false,kind);
});
test('backward-compatible policy validation rejects malformed optional authority',()=>{
 a.deepEqual(Approval.validate(manual),manual);a.deepEqual(Approval.validate(full),full);
 for(const policy of [{...manual,allSupported:'true'},{...manual,allSupported:1},{...manual,allSupported:true,extra:true},{allSupported:true},Object.create(manual)])a.throws(()=>Approval.validate(policy));
 let invoked=false;const getter={...manual};Object.defineProperty(getter,'allSupported',{enumerable:true,get(){invoked=true;return true;}});a.throws(()=>Approval.validate(getter));a.equal(invoked,false);
});
test('queue automatic flight requires explicit validated full host policy and negotiated capability',()=>{
 const {q}=queue();q.submit(flight());a.throws(()=>q.approve('flight','automatic'));a.throws(()=>q.approve('flight','automatic',{hostApprovalPolicy:{...manual,allSupported:false}}));a.throws(()=>q.approve('flight','automatic',{hostApprovalPolicy:{...full,extra:true}}));
 a.equal(q.approve('flight','automatic',{hostApprovalPolicy:full}).approvalMode,'automatic');a.throws(()=>q.result({requestId:'flight',status:'executed',message:'accepted',createdIds:[]}));q.flightProgress('flight',progress);a.equal(q.result({requestId:'flight',status:'executed',message:'measured',createdIds:[]}).phase,'executed');a.equal(q.submit(flight()).phase,'executed');
 const old=queue([F.CAPABILITY]).q;old.submit(flight());a.throws(()=>old.approve('flight','automatic',{hostApprovalPolicy:full}));a.equal(old.approve('flight').approvalMode,'manual');
 const expired=queue();expired.q.submit(flight());expired.advance(60001);a.throws(()=>expired.q.approve('flight','automatic',{hostApprovalPolicy:full}),/expired/);
});
test('automatic binding evidence never bypasses exact ownership or revocation',()=>{
 const good={requestId:'deployment',unitId:'aircraft',kind:'spawn',phase:'executed'},team={...good,unitId:'team'};
 a.equal(F.requireBindings(flight(),{capabilities:caps,approvalMode:'automatic',hostApprovalPolicy:full,aircraft:good,passengerGroup:team}).requestId,'flight');
 for(const change of [{aircraft:{...good,revoked:true}},{passengerGroup:{...team,phase:'pending'}},{hostApprovalPolicy:manual},{capabilities:[F.CAPABILITY]}])a.throws(()=>F.requireBindings(flight(),{capabilities:caps,approvalMode:'automatic',hostApprovalPolicy:full,aircraft:good,passengerGroup:team,...change}));
});
test('authenticated policy endpoint disables automatic approval during active flight without changing the queue',async()=>{
 let now=1000;const relay=createRelay({clock:()=>now});await new Promise(r=>relay.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+relay.address().port;
 const post=async(endpoint,body)=>{const r=await fetch(base+endpoint,{method:'POST',body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
 try{
  const s=(await post('/sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['fixture'],gmCommands:true})).body;
  a.equal((await post('/gm-policy',{token:s.reader,approvalPolicy:full})).status,401);
  a.equal((await post('/gm-policy',{token:s.token,approvalPolicy:full})).status,409);
  a.equal((await post('/gm-poll',{token:s.token,capabilities:caps,approvalPolicy:full})).status,200);
  a.equal((await post('/gm-policy',{token:s.token,approvalPolicy:full,requestId:'forged'})).status,409);
  a.equal((await post('/gm-status',{reader:s.reader})).body.records.length,0);
  a.equal((await post('/gm-request',{reader:s.reader,request:spawn})).status,202);
  a.equal((await post('/gm-approve',{token:s.token,requestId:'deployment',approvalMode:'automatic'})).status,200);
  a.equal((await post('/gm-result',{token:s.token,result:{requestId:'deployment',status:'executed',message:'spawned',createdIds:['1','2']}})).status,200);now+=1100;
  a.equal((await post('/gm-request',{reader:s.reader,request:flight()})).status,202);
  a.equal((await post('/gm-approve',{token:s.token,requestId:'flight',approvalMode:'automatic'})).status,200);
  const disabled=await post('/gm-policy',{token:s.token,approvalPolicy:{...manual,allSupported:false}});a.equal(disabled.status,200);a.equal(disabled.body.approvalPolicy.allSupported,false);
  const active=(await post('/gm-status',{reader:s.reader})).body;a.equal(active.records.at(-1).phase,'approved');a.equal(active.records.at(-1).approvalMode,'automatic');a.equal(active.approval.allSupported,false);
  a.equal((await post('/gm-flight-sync',{token:s.token,requestId:'flight',progress})).status,200);
  a.equal((await post('/gm-result',{token:s.token,result:{requestId:'flight',status:'executed',message:'measured landing',createdIds:[]}})).status,200);now+=1100;
  a.equal((await post('/gm-request',{reader:s.reader,request:flight('flight2')})).status,202);
  a.equal((await post('/gm-approve',{token:s.token,requestId:'flight2',approvalMode:'automatic'})).status,409);
  a.equal((await post('/gm-approve',{token:s.token,requestId:'flight2'})).status,200);
 }finally{relay.closeAllConnections();await new Promise(r=>relay.close(r));}
});
test('capability downgrade resets full approval and legacy category policy remains accepted',async()=>{
 const relay=createRelay();await new Promise(r=>relay.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+relay.address().port;const post=async(p,b)=>{const r=await fetch(base+p,{method:'POST',body:JSON.stringify(b)});return {status:r.status,body:await r.json()};};
 try{const s=(await post('/sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['fixture'],gmCommands:true})).body;a.equal((await post('/gm-poll',{token:s.token,capabilities:caps,approvalPolicy:full})).status,200);a.equal((await post('/gm-poll',{token:s.token,capabilities:[F.CAPABILITY]})).status,200);a.equal((await post('/gm-status',{reader:s.reader})).body.approval.allSupported,false);a.equal((await post('/gm-policy',{token:s.token,approvalPolicy:full})).status,409);a.equal((await post('/gm-poll',{token:s.token,capabilities:[F.CAPABILITY],approvalPolicy:{...manual,spawning:true}})).status,200);a.equal((await post('/gm-status',{reader:s.reader})).body.approval.spawning,true);}finally{relay.closeAllConnections();await new Promise(r=>relay.close(r));}
});
