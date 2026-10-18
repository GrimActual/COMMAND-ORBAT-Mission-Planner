'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('./scenario-contract'),GM=require('./bridge-runtime/gm-commands');
const resourceName='{4A71F755A4513227}Prefabs/Vehicles/Wheeled/M998/M1025.et';
const entity={unitId:'car',name:'Neutral vehicle',resourceName,worldX:4700,worldZ:11950,headingDegrees:0};
const receipt={snapshotName:'save1',mode:'current',entityCount:1,world:'Worlds/BridgeRuntime.ent',requiredAddons:['5614BBCCBB55ED1C'],entities:[{unitId:'car',resourceName,factionKey:'US',worldX:4700,worldY:8,worldZ:11950,headingDegrees:0,memberCount:0,orderCount:0,ordersText:''}]};
function queue(){let time=1000;const q=GM.createQueue(()=>time);q.registerCapabilities([S.CAPABILITY]);return {q,next:()=>time+=1100};}
test('snapshot request types distinguish planned export and owned current capture',()=>{
 assert.equal(S.validate({version:3,requestId:'plan',kind:'scenario-save-plan',sourceMissionSha256:'a'.repeat(64),entities:[entity]}).kind,'scenario-save-plan');
 for(const snapshotName of ['../secret','$profile:x','C:/file','x.json','a\\b',''])assert.throws(()=>S.validate({version:3,requestId:'review',kind:'scenario-review',snapshotName}));
 assert.throws(()=>S.validate({version:3,requestId:'save',kind:'scenario-save-current',targets:[{targetRequestId:'batch',unitId:'car'},{targetRequestId:'batch',unitId:'car'}]}));
 assert.throws(()=>S.validate({version:3,requestId:'save',kind:'scenario-save-plan',sourceMissionSha256:'a'.repeat(64),entities:[{...entity,resourceName:'{4A71F755A4513227}../private.et'}]}));
});
test('current capture requires paired ownership; save receipt requires actual approval',()=>{
 const {q,next}=queue();const current={version:3,requestId:'save1',kind:'scenario-save-current',targets:[{targetRequestId:'spawn1',unitId:'car'}]};
 assert.throws(()=>q.submit(current),/bridge-created/);q.submit({version:1,requestId:'spawn1',kind:'spawn',sourceMissionSha256:'a'.repeat(64),entities:[entity]});q.approve('spawn1');q.result({requestId:'spawn1',status:'executed',message:'Spawned',createdIds:['root1']});next();q.submit(current);
 assert.throws(()=>q.result({requestId:'save1',status:'executed',message:'Saved',createdIds:[],snapshot:receipt}),/approval/);q.approve('save1');q.result({requestId:'save1',status:'executed',message:'Saved save1.json',createdIds:[],snapshot:receipt});assert.equal(q.groups().length,1);
});
test('restore requires completed review, exact receipt and separate approval',()=>{
 const {q,next}=queue();assert.throws(()=>q.submit({version:3,requestId:'restore',kind:'scenario-restore',reviewRequestId:'review'}),/review/);
 q.submit({version:3,requestId:'review',kind:'scenario-review',snapshotName:'save1'});q.approve('review');q.result({requestId:'review',status:'executed',message:'Reviewed; no spawning',createdIds:[],snapshot:receipt});assert.equal(q.groups().length,0);next();q.submit({version:3,requestId:'restore',kind:'scenario-restore',reviewRequestId:'review'});
 assert.throws(()=>q.result({requestId:'restore',status:'executed',message:'Restored',createdIds:['root2'],snapshot:receipt}),/approval/);q.approve('restore');assert.throws(()=>q.result({requestId:'restore',status:'executed',message:'Restored',createdIds:['root2'],snapshot:{...receipt,mode:'planned'}}),/differs/);
 q.result({requestId:'restore',status:'executed',message:'Restored',createdIds:['root2'],snapshot:receipt});assert.equal(q.groups()[0].targets[0].unitId,'car');
});
test('capability gating, duplicate protection and malformed receipts fail closed',()=>{
 const q=GM.createQueue();const request={version:3,requestId:'r',kind:'scenario-review',snapshotName:'save1'};assert.throws(()=>q.submit(request),/capability/);q.registerCapabilities([S.CAPABILITY]);q.submit(request);assert.throws(()=>q.submit({...request,snapshotName:'save2'}),/Conflicting/);
 for(const patch of [{entityCount:2},{snapshotName:'../x'},{entities:[{...receipt.entities[0],memberCount:17}]}])assert.throws(()=>S.validateReceipt({...receipt,...patch}));
 q.approve('r');assert.throws(()=>q.result({requestId:'r',status:'executed',message:'Reviewed',createdIds:['unexpected'],snapshot:receipt}),/cannot spawn/);
});
