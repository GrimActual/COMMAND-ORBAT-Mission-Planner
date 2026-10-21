'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=require('./aircraft-profile-missions'),root=__dirname,P=require(root+'/mission-package');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'aircraft-support-catalog.json'),'utf8'));
for(const entry of catalog.entries){entry.runtimeAvailable=false;delete entry.testCrewFaction;delete entry.crewOnly;}
const load=key=>JSON.parse(fs.readFileSync(root+'/missions/COMMAND-'+(key==='UH1H'?'Huey':'Mi8MT')+'-Test.command-mission.json','utf8'));
test('only runtime-available four-cargo vanilla templates appear; civil and H60 wait for separate templates',()=>{
 assert.equal(A.available(catalog).length,0);
 const ready=structuredClone(catalog);ready.entries.forEach(e=>e.runtimeAvailable=true);
 const entries=A.available(ready);assert.equal(entries.length,15);assert.ok(entries.every(e=>e.family!=='H60'&&!e.resource.includes('_civ')));
 const duplicate=structuredClone(ready);duplicate.entries.push(duplicate.entries[0]);assert.throws(()=>A.available(duplicate),/identity/);
});
test('all15 eligible exact variants build as full validated reviewed mission imports without altering source or crew',async()=>{
 const ready=structuredClone(catalog);ready.entries.forEach(e=>e.runtimeAvailable=true);
 for(const entry of A.available(ready)){
  const key=A.templateKey(entry),source=load(key),before=structuredClone(source),vehicleId=key==='UH1H'?'HUEY':'MI8';
  const mission=await A.build(entry,source,P.validate);
  assert.deepEqual(source,before);assert.deepEqual(mission.deployments,source.deployments);
  const vehicle=mission.plan.orderOfBattle.find(u=>u.id===vehicleId),ref=vehicle.assetCatalogItem.resourceReference;
  assert.equal('{'+ref.guid+'}'+ref.path,entry.resource);assert.equal(ref.addonId,entry.addonId);
  assert.ok(mission.catalog.assets.some(x=>x.id===vehicle.asset));assert.ok(mission.resourceIndex.resources.some(x=>x.id===ref.id&&x.guid===ref.guid));
  for(const id of ['PILOT','TEAM'])assert.deepEqual(mission.plan.orderOfBattle.find(u=>u.id===id),source.plan.orderOfBattle.find(u=>u.id===id));
 }
});
test('unavailable, malformed and separate-template entries cannot produce a mission',async()=>{
 const e=catalog.entries[0];await assert.rejects(()=>A.build(e,load('Mi8MT'),P.validate),/separate/);
 await assert.rejects(()=>A.build({...e,runtimeAvailable:true,resource:'wrong'},load('Mi8MT'),P.validate),/separate/);
 const h=catalog.entries.find(e=>e.family==='H60');await assert.rejects(()=>A.build({...h,runtimeAvailable:true},load('UH1H'),P.validate),/separate/);
 const candidate={...e,runtimeAvailable:true};await assert.rejects(()=>A.build(candidate,{plan:{orderOfBattle:[]}},P.validate),/unavailable/);
});
test('pilot-only US and USSR templates remove only passenger team references and explain checkbox',async()=>{
 for(const faction of ['US','USSR']){
  const entry={...catalog.entries.find(e=>e.family===(faction==='US'?'UH-1H':'Mi-8MT')),runtimeAvailable:true,testCrewFaction:faction,crewOnly:true},key=A.templateKey(entry),source=load(key),mission=await A.build(entry,source,P.validate);
  assert.deepEqual(mission.plan.orderOfBattle.map(u=>u.id),[key==='UH1H'?'HUEY':'MI8','PILOT']);assert.equal(mission.catalog.assets.length,2);assert.equal(mission.resourceIndex.resources.length,2);assert.equal(mission.deployments[0].occupied.assignments.length,1);assert.equal(mission.deployments[0].occupied.assignments[0].role,'pilot');assert.match(mission.plan.operation.briefing,/explicitly enable “Pilot only — no passengers”/);
 }
});
test('civilian template uses exact designated pilot only with explicit verified CIV flag',async()=>{
 const civil=catalog.entries.find(e=>e.resource.includes('_civ_'));
 assert.equal(A.templateKey({...civil,runtimeAvailable:true}),null);assert.equal(A.templateKey({...civil,runtimeAvailable:true,testCrewFaction:'CIV',crewOnly:false}),null);
 const entry={...civil,runtimeAvailable:true,testCrewFaction:'CIV',crewOnly:true},mission=await A.build(entry,load('UH1H'),P.validate),pilot=mission.plan.orderOfBattle.find(u=>u.id==='PILOT');
 assert.equal(pilot.assetCatalogItem.resourceReference.guid,'E024A74F8A4BC644');assert.equal(pilot.side,'neutral');assert.equal(mission.plan.orderOfBattle.length,2);assert.ok(mission.resourceIndex.resources.some(r=>r.guid==='E024A74F8A4BC644'));
});
test('four exact H60 references declare dependencies and supply rejects four cargo',async()=>{
 for(const original of catalog.entries.filter(e=>e.family==='H60')){
  const supply=original.resource.includes('_Supply.et'),entry={...original,runtimeAvailable:true,testCrewFaction:'US',crewOnly:supply};
  const mission=await A.build(entry,load('UH1H'),P.validate),vehicle=mission.plan.orderOfBattle.find(u=>u.id==='HUEY');assert.equal(vehicle.assetCatalogItem.resourceReference.addonId,'60ED3CC6E7E40221');
  for(const id of ['60ED3CC6E7E40221','64EE818E08AFCF94','6276E6E3CC97A22B','629B2BA37EFFD577'])assert.ok(mission.resourceIndex.addons.some(a=>a.id===id));
  assert.equal(mission.plan.orderOfBattle.length,supply?2:3);
  if(supply)assert.equal(A.templateKey({...entry,crewOnly:false}),null);
  assert.equal(A.templateKey({...entry,resource:entry.resource.replace('.et','_unknown.et')}),null);
  assert.equal(A.templateKey({...entry,testCrewFaction:'USSR'}),null);
 }
});
test('all22 exact catalog entries validate under explicit hypothetical native-ready configurations',async()=>{
 let count=0;for(const original of catalog.entries){const civil=original.resource.includes('_civ'),h60=original.family==='H60',entry={...original,runtimeAvailable:true,testCrewFaction:civil?'CIV':h60||original.family==='UH-1H'?'US':'USSR',crewOnly:civil||original.resource.endsWith('_Supply.et')},key=A.templateKey(entry);assert.ok(key,entry.resource);const mission=await A.build(entry,load(key),P.validate);assert.ok(mission.deployments.length);count++;}assert.equal(count,22);assert.ok(catalog.entries.every(e=>e.runtimeAvailable===false),'Tests do not grant runtime availability');
});
