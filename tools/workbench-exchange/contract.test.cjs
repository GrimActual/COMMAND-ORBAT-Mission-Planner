'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),X=require('./contract.cjs'),C=require('../../planner/planner-core');
const json=JSON.stringify,clone=structuredClone;
const prefab={addonId:'58D0FB3206B6F859',guid:'1111111111111111',path:'Prefabs/Fixture.et'};
function fixture(){
 const plan=C.empty();for(let i=1;i<=3;i++)plan.orderOfBattle.push({id:i,name:'Unit '+i,side:'blue',unitType:'infantry',position:{lng:100*i+50,lat:200*i+50},asset:'fixture',assetCatalogItem:{resourceReference:clone(prefab)}});
 const mission=C.validate(plan),config={planId:'plan-1',exchangeId:'exchange-1',world:{addonId:'58D0FB3206B6F859',guid:'55A3176BBDD01AAE',path:'worlds/Eden/EmptyEden.ent'},mapOffset:{east:50,north:50},bounds:{min:[0,-300,0],max:[12800,500,12800]},resources:[clone(prefab)],entities:mission.orderOfBattle.map(u=>({managedId:'managed-'+u.id,unitId:u.id,prefab:clone(prefab),transform:{position:[u.position.lng-50,10,u.position.lat-50],angles:[90,0,0]}}))};
 const {baseline,baselineSha256}=X.createBaseline(json(mission),json(config));
 const snapshot={schema:'command-workbench-snapshot',version:1,planId:baseline.planId,exchangeId:baseline.exchangeId,baselineSha256,world:clone(baseline.world),layerId:baseline.layerId,space:baseline.space,scanComplete:true,scanErrors:[],unmanagedEntityCount:7,entities:clone(baseline.entities)};
 return {mission,config,baseline,snapshot};
}
const review=f=>X.review(json(f.mission),json(f.baseline),json(f.snapshot));
test('read-only baseline and distinct added/moved/removed review preserve inputs and include full transforms',()=>{
 const f=fixture();f.snapshot.entities[0].transform={position:[120,12,220],angles:[180,5,-5]};f.snapshot.entities.pop();f.snapshot.entities.push({managedId:'new-1',unitId:null,prefab:clone(prefab),transform:{position:[500,20,600],angles:[0,0,0]}});const before=json(f),r=review(f);
 a.equal(json(f),before);a.deepEqual(r.added.map(e=>e.managedId),['new-1']);a.deepEqual(r.moved.map(e=>e.unitId),[1]);a.deepEqual(r.removed.map(e=>e.unitId),[3]);a.deepEqual(r.unchanged,['managed-2']);a.equal(r.moved[0].rotated,true);a.equal(r.moved[0].translated,true);a.equal(r.ignoredUnmanagedCount,7);a.equal(r.canApply,false);a.equal(r.nativeValidationRequired,true);a.equal(r.apply,undefined);a.deepEqual(r.issues,[]);
});
test('unit IDs retain exact types and cannot be rebound or claimed by added objects',()=>{
 for(const mutate of [f=>f.snapshot.entities[0].unitId='1',f=>f.snapshot.entities[0].unitId=2,f=>{f.snapshot.entities[0].managedId='new';}]){const f=fixture();mutate(f);a.throws(()=>review(f),e=>e.code==='IDENTITY');}
});
test('world resource, exchange, layer, baseline and transform space must match exactly',()=>{
 for(const mutate of [f=>f.snapshot.world.path='worlds/Eden/Eden.ent',f=>f.snapshot.planId='plan-2',f=>f.snapshot.exchangeId='exchange-2',f=>f.snapshot.layerId='default',f=>f.snapshot.baselineSha256='0'.repeat(64),f=>f.snapshot.space='local']){const f=fixture();mutate(f);a.throws(()=>review(f));}
});
test('any plan change makes the baseline stale, including unrelated metadata',()=>{const f=fixture();f.mission.orderOfBattle[2].name='Changed after export';a.throws(()=>review(f),e=>e.code==='STALE');});
test('partial or failed scans cannot turn absent rows into removals',()=>{
 for(const mutate of [f=>f.snapshot.scanComplete=false,f=>f.snapshot.scanErrors.push('layer unavailable')]){const f=fixture();f.snapshot.entities=[];mutate(f);a.throws(()=>review(f),e=>e.code==='INCOMPLETE');}
 const f=fixture();f.snapshot.entities=[];a.equal(review(f).removed.length,3);a.equal(review(f).canApply,false);
});
test('changed existing prefabs and unapproved additions remain blocked review issues',()=>{
 const f=fixture(),other={...prefab,guid:'2222222222222222',path:'Prefabs/Other.et'};f.snapshot.entities[0].prefab=other;f.snapshot.entities.push({managedId:'new',unitId:null,prefab:other,transform:clone(f.snapshot.entities[0].transform)});a.deepEqual(review(f).issues.map(i=>i.code),['PREFAB_NOT_APPROVED','PREFAB_CHANGED','PREFAB_NOT_APPROVED']);
});
test('locked changes and removals are identified without changing the plan',()=>{
 const f=fixture();f.mission.orderOfBattle[0].locked=true;f.mission.orderOfBattle[2].locked=true;const created=X.createBaseline(json(f.mission),json(f.config));f.baseline=created.baseline;f.snapshot.baselineSha256=created.baselineSha256;f.snapshot.entities[0].transform.position[0]++;f.snapshot.entities.pop();a.deepEqual(review(f).issues.map(i=>i.code),['LOCKED','LOCKED']);
});
test('duplicate managed IDs, aliases of unit IDs and approved resources are rejected',()=>{
 const f=fixture();f.snapshot.entities.push(clone(f.snapshot.entities[0]));a.throws(()=>review(f),e=>e.code==='DUPLICATE');
 for(const mutate of [c=>c.entities[1].unitId='1',c=>c.resources.push(clone(prefab))]){const g=fixture();mutate(g.config);a.throws(()=>X.createBaseline(json(g.mission),json(g.config)),e=>e.code==='DUPLICATE');}
});
test('bounds cover all three coordinates, finite angles, pitch/roll and nonzero extents',()=>{
 for(const transform of [{position:[-1,10,200],angles:[0,0,0]},{position:[100,501,200],angles:[0,0,0]},{position:[100,10,12801],angles:[0,0,0]},{position:[100,10,200],angles:[0,181,0]},{position:[100,10,200],angles:[0,0,Infinity]}]){const f=fixture();f.snapshot.entities[0].transform=transform;a.throws(()=>review(f));}
 const f=fixture();f.config.bounds.max[0]=0;a.throws(()=>X.createBaseline(json(f.mission),json(f.config)));
});
test('resource traversal, forged fields, local transforms, parents and executable payloads are rejected',()=>{
 for(const mutate of [f=>f.snapshot.entities[0].prefab.path='../Other.et',f=>f.snapshot.entities[0].transform.scale=[1,1,1],f=>f.snapshot.entities[0].parent='foreign',f=>f.snapshot.command='spawn']){const f=fixture();mutate(f);a.throws(()=>review(f));}
});
test('ambiguous duplicate JSON keys, escaped key aliases, excessive depth and oversized inputs are rejected',()=>{
 const f=fixture(),base=json(f.baseline);for(const snapshot of [json(f.snapshot).replace('"version":1','"version":1,"version":1'),json(f.snapshot).replace('"version":1','"version":1,"\\u0076ersion":1')])a.throws(()=>X.review(json(f.mission),base,snapshot),e=>e.code==='DUPLICATE');
 a.throws(()=>X.review(json(f.mission),base,' '.repeat(X.BYTES+1)),e=>e.code==='LIMIT');a.throws(()=>X.review(json(f.mission),base,'['.repeat(65)+'0'+']'.repeat(65)),e=>e.code==='LIMIT');
});
test('baseline export rejects planner/prefab/coordinate mismatch and cannot silently normalize a plan',()=>{
 for(const mutate of [f=>f.config.entities[0].transform.position[0]++,f=>f.config.entities[0].prefab.guid='2222222222222222',f=>f.mission.unrecognized='lost']){const f=fixture();mutate(f);a.throws(()=>X.createBaseline(json(f.mission),json(f.config)));}
});
test('pitch, roll, altitude-only changes and orientation-only changes are retained in review',()=>{
 const f=fixture();f.snapshot.entities[0].transform.position[1]++;f.snapshot.entities[1].transform.angles=[90,10,20];const r=review(f);a.equal(r.moved.length,2);a.equal(r.moved[0].translated,true);a.equal(r.moved[0].rotated,false);a.equal(r.moved[1].translated,false);a.equal(r.moved[1].rotated,true);
});
test('all-unchanged snapshot remains a non-applying development review',()=>{const r=review(fixture());a.deepEqual([r.added.length,r.moved.length,r.removed.length,r.unchanged.length],[0,0,0,3]);a.equal(r.canApply,false);});
test('one GUID cannot name different prefabs or the world and one path cannot name different GUIDs',()=>{
 for(const resource of [{...prefab,path:'Prefabs/Other.et'},{...prefab,guid:'2222222222222222'},{...prefab,guid:'55A3176BBDD01AAE',path:'Prefabs/WorldAlias.et'},{...prefab,guid:'2222222222222222',path:'prefabs/fixture.et'}]){const f=fixture();f.config.resources.push(resource);a.throws(()=>X.createBaseline(json(f.mission),json(f.config)),e=>e.code==='RESOURCE_CONFLICT');}
});
test('quoted JSON-looking text remains ordinary mission text',()=>{
 const f=fixture();f.mission.orderOfBattle[0].name='Literal {"version":1,"version":2} \\ quote " [ ]';const prepared=X.createBaseline(json(f.mission),json(f.config));f.baseline=prepared.baseline;f.snapshot.baselineSha256=prepared.baselineSha256;a.equal(review(f).unchanged.length,3);
});
test('record count bounds apply before treating missing records as deletions',()=>{const f=fixture();f.snapshot.entities=Array.from({length:X.LIMIT+1},(_,i)=>({...clone(f.snapshot.entities[0]),managedId:'managed-'+i,unitId:null}));a.throws(()=>review(f),e=>e.code==='LIMIT');});
test('removing a parent identifies retained children without silently reparenting them',()=>{
 const f=fixture();f.mission.orderOfBattle[1].parentId=1;const prepared=X.createBaseline(json(f.mission),json(f.config));f.baseline=prepared.baseline;f.snapshot.baselineSha256=prepared.baselineSha256;f.snapshot.entities.shift();a.deepEqual(review(f).issues,[{managedId:'managed-1',code:'REMAINING_CHILDREN',unitIds:[2]}]);a.equal(f.mission.orderOfBattle[1].parentId,1);
 f.snapshot.entities.shift();a.deepEqual(review(f).issues,[]);
});
function nativeSnapshot(f){return {...clone(f.snapshot),schema:'command-workbench-native-snapshot',entities:f.snapshot.entities.map(({unitId,...row})=>clone(row))};}
test('native snapshots bind planner identity only through the baseline, preserving large numeric and text IDs',()=>{
 const f=fixture();f.mission.orderOfBattle[0].id=Number.MAX_SAFE_INTEGER;f.config.entities[0].unitId=Number.MAX_SAFE_INTEGER;f.mission.orderOfBattle[1].id='unit-2';f.config.entities[1].unitId='unit-2';const prepared=X.createBaseline(json(f.mission),json(f.config));f.baseline=prepared.baseline;f.snapshot.baselineSha256=prepared.baselineSha256;const wire=nativeSnapshot(f);wire.entities[0].transform.position[0]++;wire.entities[1].transform.angles[0]++;const r=X.reviewNative(json(f.mission),json(f.baseline),json(wire));a.deepEqual(r.moved.map(e=>e.unitId),[Number.MAX_SAFE_INTEGER,'unit-2']);a.equal(r.canApply,false);
});
test('native snapshot cannot inject planner IDs or use null, empty, numeric or duplicate managed IDs',()=>{
 for(const mutate of [w=>w.entities[0].unitId=2,w=>w.entities[0].managedId=null,w=>w.entities[0].managedId='',w=>w.entities[0].managedId=1,w=>w.entities.push(clone(w.entities[0]))]){const f=fixture(),wire=nativeSnapshot(f);mutate(wire);a.throws(()=>X.reviewNative(json(f.mission),json(f.baseline),json(wire)));}
});
test('native unknown managed IDs are reviewed as additions and retain all normal scope gates',()=>{
 const f=fixture(),wire=nativeSnapshot(f);wire.entities.push({...clone(wire.entities[0]),managedId:'new-native'});const r=X.reviewNative(json(f.mission),json(f.baseline),json(wire));a.equal(r.added[0].unitId,null);wire.world.guid='1111111111111111';a.throws(()=>X.reviewNative(json(f.mission),json(f.baseline),json(wire)),e=>e.code==='SCOPE');
});
