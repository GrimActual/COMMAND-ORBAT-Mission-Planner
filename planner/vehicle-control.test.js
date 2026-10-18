'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),V=require('./vehicle-control-contract'),GM=require('./bridge-runtime/gm-commands');
const route={version:4,requestId:'drive',kind:'vehicle-route',targetRequestId:'crew',unitId:'crew',vehicleRequestId:'car',vehicleUnitId:'car',timeoutSeconds:90,waypoints:[{worldX:4740,worldZ:11950},{worldX:4780,worldZ:11950}]};
const attach={version:4,requestId:'attach',kind:'convoy-attach',targetRequestId:'crew',unitId:'crew',vehicleRequestId:'car',vehicleUnitId:'car',leaderRequestId:'lead',leaderUnitId:'lead',timeoutSeconds:120};
const spawn=id=>({version:1,requestId:id,kind:'spawn',sourceMissionSha256:'a'.repeat(64),entities:[{unitId:id,name:'Neutral vehicle control fixture',resourceName:'{4A71F755A4513227}Prefabs/Vehicles/Wheeled/M998/M1025.et',worldX:4700,worldZ:11950,headingDegrees:0}]});
function fixture(){let now=1000;const q=GM.createQueue(()=>now),next=()=>now+=1100;q.registerCapabilities([V.CAPABILITY,V.CONVOY_CAPABILITY]);for(const id of ['crew','car','lead']){next();q.submit(spawn(id));q.approve(id);q.result({requestId:id,status:'executed',message:'Spawned',createdIds:['root_'+id]});}next();return {q,next,advance:ms=>now+=ms};}
test('vehicle route and convoy contracts reject unsafe roles, identities, paths and bounds',()=>{
 a.deepEqual(V.validate(route),route);a.deepEqual(V.validate(attach),attach);
 for(const bad of [{...route,timeoutSeconds:301},{...route,waypoints:[{worldX:NaN,worldZ:1}]},{...route,waypoints:[{worldX:1,worldZ:1},{worldX:1,worldZ:1}]},{...attach,leaderRequestId:'car',leaderUnitId:'car'},{...route,command:'drive'},{...route,unitId:'../x'}])a.throws(()=>V.validate(bad));
 a.throws(()=>V.validate({...attach,kind:'convoy-detach'}));
});
test('each exact crew, vehicle and leader identity must be executed and paired',()=>{
 const {q}=fixture();for(const bad of [{...route,unitId:'foreign'},{...route,vehicleRequestId:'unknown'},{...attach,leaderUnitId:'foreign'}])a.throws(()=>q.submit(bad),/owned/);
 const old=GM.createQueue();a.throws(()=>old.submit(route),/capability/);q.submit(route);a.throws(()=>q.result({requestId:'drive',status:'executed',message:'Finished',createdIds:[]}),/approval/);q.approve('drive');a.throws(()=>q.result({requestId:'drive',status:'executed',message:'Finished',createdIds:['forged']}));
});
test('vehicle routes have a fixed duration deadline and may be cancelled while approved',()=>{
 const {q,advance}=fixture();q.submit(route);const first=q.approve('drive');advance(1000);a.equal(q.approve('drive').expiresAt,first.expiresAt);a.equal(q.cancel('drive').phase,'cancelled');a.throws(()=>q.result({requestId:'drive',status:'executed',message:'Late',createdIds:[]}));
 const other=fixture();other.q.submit(route);other.q.approve('drive');other.advance(95000);a.equal(other.q.history().at(-1).phase,'expired');
});
test('convoy installation and detach are separately approved without creating identities',()=>{
 const {q,next}=fixture();q.submit(attach);q.approve('attach');q.result({requestId:'attach',status:'executed',message:'Bounded follow installed',createdIds:[]});a.equal(q.history().at(-1).request.leaderRequestId,'lead');a.equal(q.groups().length,3);next();q.submit({version:4,requestId:'detach',kind:'convoy-detach',targetRequestId:'crew',unitId:'crew',vehicleRequestId:'car',vehicleUnitId:'car'});q.approve('detach');q.result({requestId:'detach',status:'executed',message:'Detached',createdIds:[]});a.equal(q.groups().length,3);
});
