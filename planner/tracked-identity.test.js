const {test}=require('node:test'),a=require('node:assert/strict'),{Publisher,state,apply,snapshot}=require('./bridge-runtime/tracked-protocol'),{create}=require('./tracked-entities'),{createRelay}=require('./bridge-runtime/relay');
const token='a'.repeat(32),entity={id:'player_1',x:100,z:200,label:'Grim Actual — Équipe',faction:'US',kind:'player'};
test('stationary identity changes publish deltas and survive heartbeat snapshots and desktop reads',()=>{
 const pub=new Publisher(['player_1']),relay=state(['player_1']),store=create(['player_1'],{clock:()=>1000});
 const first=pub.next([entity],token);a.equal(apply(relay,first,1000).status,200);
 a.deepEqual(snapshot(relay,1000),[entity]);store.apply({protocol:3,sequence:1,entities:snapshot(relay,1000)});
 const detached=store.snapshot();detached[0].label='tampered';a.equal(store.snapshot()[0].label,entity.label);
 const movedFaction={...entity,faction:'USSR',label:'New name'};const delta=pub.next([movedFaction],token);a.equal(delta.entities.length,1);a.equal(apply(relay,delta,2000).status,200);
 const heartbeat=pub.next([movedFaction],token);a.equal(heartbeat.entities.length,0);a.equal(apply(relay,heartbeat,3000).status,200);a.deepEqual(snapshot(relay,3000),[movedFaction]);
 a.throws(()=>store.apply({protocol:3,sequence:1,entities:[movedFaction]}));
});
test('partial, oversized, control-character and unknown tracking identities reject atomically',()=>{
 const pub=new Publisher(['player_1']);
 for(const bad of [{...entity,label:'x'.repeat(97)},{...entity,label:'bad\nname'},{...entity,faction:'US<script>'},{...entity,kind:'invented'},(({kind,...e})=>e)(entity)])a.throws(()=>pub.next([bad],token));
 const legacy={id:entity.id,x:entity.x,z:entity.z};a.equal(pub.next([legacy],token).entities[0].label,undefined);
});
test('real loopback relay advertises identity extension after accepting old packets, preserves names and expires metadata',async t=>{
 let now=1000;const server=createRelay({clock:()=>now});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.close();server.closeAllConnections();});const base='http://127.0.0.1:'+server.address().port+'/',post=(p,b)=>fetch(base+p,{method:'POST',body:JSON.stringify(b)});
 const session=await(await post('sessions',{protocol:3,scope:'allowlisted-entities',entityIds:['player_1']})).json();const pub=new Publisher(['player_1']);const ack=await(await post('batch',pub.next([{id:'player_1',x:100,z:200}],session.token))).json();a.equal(ack.identityMetadata,1);
 now+=1000;a.equal((await post('batch',pub.next([entity],session.token))).status,200);
 const read=async()=>await(await fetch(base+'session',{headers:{Authorization:'Bearer '+session.reader}})).json();a.deepEqual((await read()).entities,[entity]);now+=5000;a.deepEqual((await read()).entities,[]);
});
