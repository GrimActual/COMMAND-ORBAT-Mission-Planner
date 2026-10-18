'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),AI=require('./bridge-runtime/ai-orders-contract'),GM=require('./bridge-runtime/gm-commands'),{createRelay}=require('./bridge-runtime/relay');
const caps=['ai-orders-v1','ai-squad-control-v1','ai-control-status-v1'];
const recruit={version:2,requestId:'lease',kind:'ai-recruit',sourceEntityId:'host_1'};
const release={version:2,requestId:'release',kind:'ai-release',targetRequestId:'lease',unitId:'host_1'};
const hold={version:2,requestId:'hold',kind:'ai-hold',targetRequestId:'lease',unitId:'host_1',holdSeconds:5};
test('explicit revocation is monotonic, atomic and pairing-bound; release and fresh recruitment remain possible',()=>{
 let now=0;const q=GM.createQueue(()=>now,{trackingIds:['host_1']});q.registerCapabilities(caps);q.submit(recruit);q.approve('lease');q.result({requestId:'lease',status:'executed',message:'Recruited',createdIds:[]});
 a.throws(()=>q.registerControlStatus(['lease','foreign']),/Invalid/);a.equal(q.groups()[0].controlState,undefined);
 q.registerControlStatus(['lease']);a.equal(q.groups()[0].controlState,'revoked');q.registerControlStatus([]);a.equal(q.groups()[0].controlState,'revoked');now=1000;a.throws(()=>q.submit(hold),/revoked/);
 q.submit(release);q.approve('release');q.result({requestId:'release',status:'executed',message:'Released; retained',createdIds:[]});a.equal(q.groups().length,0);
 now=2000;q.submit({...recruit,requestId:'new_lease'});q.approve('new_lease');q.result({requestId:'new_lease',status:'executed',message:'Recruited',createdIds:[]});a.equal(q.groups()[0].controlState,undefined);now=3000;q.submit({...hold,targetRequestId:'new_lease'});a.equal(q.poll().phase,'pending');
});
test('recruited status updates require negotiated capability and valid executed identities',()=>{
 const q=GM.createQueue();a.throws(()=>q.registerControlStatus([]),/Invalid/);q.registerCapabilities(caps);for(const bad of [['foreign'],['../bad'],['lease','lease'],Array(61).fill('lease'),null])a.throws(()=>q.registerControlStatus(bad));
 const inspect={version:2,requestId:'inspect',kind:'ai-diagnose',targetRequestId:'lease',unitId:'host_1'};
 a.deepEqual(AI.validate(inspect),inspect);a.equal(AI.capability(inspect.kind),'ai-control-status-v1');
 for(const extra of [{script:'unsafe'},{worldX:5},{resourceName:'arbitrary'},{holdSeconds:10}])a.throws(()=>AI.validate({...inspect,...extra}));
 a.throws(()=>q.submit(inspect),/executed/);q.registerCapabilities(['ai-orders-v1']);a.throws(()=>q.submit(inspect),/advertised/);
});
test('HTTP revocation can only be reported by the paired game writer, never by the desktop reader',async t=>{
 const server=createRelay();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.close();server.closeAllConnections();});const base='http://127.0.0.1:'+server.address().port,post=(p,b)=>fetch(base+p,{method:'POST',body:JSON.stringify(b)}),json=async(p,b)=>(await post(p,b)).json();
 const pair=await json('/sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['host_1'],gmCommands:true});await post('/gm-poll',{token:pair.token,capabilities:caps,revokedTargets:[]});await post('/gm-request',{reader:pair.reader,request:recruit});await post('/gm-approve',{token:pair.token,requestId:'lease'});await post('/gm-result',{token:pair.token,result:{requestId:'lease',status:'executed',message:'Recruited',createdIds:[]}});
 a.equal((await post('/gm-poll',{token:pair.reader,capabilities:caps,revokedTargets:['lease']})).status,401);
 a.equal((await post('/gm-poll',{token:pair.token,capabilities:caps,revokedTargets:['lease']})).status,200);
 a.equal((await json('/gm-status',{reader:pair.reader})).groups[0].controlState,'revoked');
 a.equal((await post('/gm-request',{reader:pair.reader,request:hold})).status,409);
});
