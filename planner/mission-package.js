/* Portable planning data only. No credentials, runtime handles, game assets or approval authority. */
(function(root,factory){const node=typeof module==='object'&&module.exports;const api=factory(...(node?[require('./planner-core'),require('./asset-catalog'),require('./resource-index'),require('./deployment-intent'),require('./occupied-spawn-contract')]:[root.PlannerCore,root.CompanionAssetCatalog,root.CompanionResources,root.CompanionDeployment,root.CommandOccupiedSpawn]));if(node)module.exports=api;else root.CommandMissionPackage=api;})(globalThis,function(C,A,R,D,O){
'use strict';
const SCHEMA='command-mission-package',MAX_BYTES=12000000;
const bytes=v=>new TextEncoder().encode(JSON.stringify(v)).length;
function exact(v,keys){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).sort().join('|')!==[...keys].sort().join('|'))throw Error('Unsupported mission package fields');}
function text(v){if(typeof v!=='string'||!v.trim()||v.length>160||/[\x00-\x1f\x7f]/.test(v))throw Error('Invalid deployment name');return v;}
function portable(v,depth=0){if(depth>40)throw Error('Mission package nesting exceeds limit');if(!v||typeof v!=='object')return;for(const [key,value]of Object.entries(v)){if(/^(?:__proto__|prototype|constructor|token|.*token|password|secret|credentials|authorization|requestId|targetRequestId|vehicleRequestId|rplId|entityId|sessionId|serverEndpoint|relayUrl)$/i.test(key))throw Error('Mission packages cannot contain credentials or live identities: '+key);portable(value,depth+1);}}
function structure(raw){
 if(bytes(raw)>MAX_BYTES)throw Error('Mission package exceeds 12 MB');portable(raw);
 exact(raw,['schema','version','plan','catalog','resourceIndex','deployments']);
 if(raw.schema!==SCHEMA||raw.version!==1)throw Error('Unsupported mission package version');
 const plan=C.validate(raw.plan);if(bytes(plan)>5000000)throw Error('Plan exceeds 5 MB');
 const catalog=A.combine(raw.catalog,plan.orderOfBattle.filter(u=>u.asset!=='none').map(u=>({...u.assetCatalogItem,id:u.asset,name:u.assetName||u.asset})));
 const resourceIndex=raw.resourceIndex===null?null:R.validate(raw.resourceIndex);
 if(!Array.isArray(raw.deployments)||raw.deployments.length>64)throw Error('Up to 64 explicit deployment stages are supported');
 const ids=new Set(),used=new Set(),units=new Map(plan.orderOfBattle.map(u=>[u.id,u]));
 const deployments=raw.deployments.map(stage=>{
  exact(stage,['id','name','unitIds','headingDegrees','occupied']);text(stage.id);text(stage.name);
  if(ids.has(stage.id))throw Error('Duplicate deployment stage');ids.add(stage.id);
  if(!resourceIndex||!Array.isArray(stage.unitIds)||!stage.unitIds.length||stage.unitIds.length>16||!Number.isFinite(stage.headingDegrees)||stage.headingDegrees<0||stage.headingDegrees>=360)throw Error('Each deployment needs an index, 1–16 roots and a valid heading');
  for(const id of stage.unitIds){if(!units.has(id)||used.has(String(id)))throw Error('Missing or repeated deployment unit: '+id);if(!/^[A-Za-z0-9_-]{1,64}$/.test(String(id)))throw Error('Deployment unit needs a portable ID: '+id);used.add(String(id));}
  const occupied=stage.occupied===null?null:O.validate(stage.occupied,stage.unitIds.map(unitId=>({unitId})));
  if(occupied?.assignments.some(a=>a.managerId!==-1||a.slotId!==-1))throw Error('Portable missions use automatic seats within explicit roles; runtime seat identities cannot be shared');
  return {...C.clone(stage),occupied};
 });
 return {schema:SCHEMA,version:1,plan,catalog,resourceIndex,deployments};
}
async function validate(raw){const doc=structure(raw);for(const stage of doc.deployments)await D.review(doc.plan,doc.resourceIndex,stage.unitIds,stage.headingDegrees);return doc;}
function defaults(plan){const units=C.validate(plan).orderOfBattle.filter(u=>u.asset!=='none'&&u.assetCatalogItem?.resourceReference);const result=[];for(let i=0;i<units.length;i+=16)result.push({id:'deployment-'+(result.length+1),name:'Deployment '+(result.length+1),unitIds:units.slice(i,i+16).map(u=>u.id),headingDegrees:0,occupied:null});return result;}
async function withOccupant(raw,asset,point,vehicleId,role){
 if(!['pilot','cargo'].includes(role))throw Error('Choose pilot or passengers');
 const doc=structure(raw),vehicle=doc.plan.orderOfBattle.find(u=>u.id===vehicleId);
 if(!vehicle||!/(?:^|\/)Vehicles\//i.test(vehicle.assetCatalogItem?.resourceReference?.path||''))throw Error('Select a planned vehicle first');
 const path=asset?.resourceReference?.path||'';
 if(role==='pilot'?!/(?:^|\/)Characters\/.+(?:Pilot|Crewman)[^/]*\.et$/i.test(path):!/(?:^|\/)(?:Characters|Groups)\//i.test(path))throw Error('Choose a verified character pilot or passenger character/group');
 const prior=doc.deployments.find(s=>s.occupied?.vehicleUnitId===vehicleId);
 if(role==='pilot'&&prior?.occupied.assignments.some(a=>a.role==='pilot'))throw Error('This vehicle already has a planned pilot. Review its seating before adding another.');
 const id=C.freshId(doc.plan.orderOfBattle,'unit-'),name=(role==='pilot'?'Pilot':'Passengers')+' '+id;
 doc.plan.orderOfBattle.push({id,name,side:vehicle.side,unitType:'infantry',type:'Infantry',symbolMode:'nato',icon:'auto',symbol:'I',position:C.point(point),parentId:null,phaseId:vehicle.phaseId,asset:asset.id,assetName:asset.name,assetCatalogItem:C.clone(asset),strength:'',color:null});
 doc.plan=C.validate(doc.plan);doc.catalog=A.combine(doc.catalog,[asset]);
 const stage=prior?C.clone(prior):{id:'occupied-'+String(vehicleId),name:vehicle.name||String(vehicleId),unitIds:[vehicleId],headingDegrees:vehicle.headingDegrees||0,occupied:{vehicleUnitId:vehicleId,timeoutSeconds:30,assignments:[]}};
 stage.unitIds.push(id);stage.occupied.assignments.push({unitId:id,role,managerId:-1,slotId:-1});
 doc.deployments=doc.deployments.filter(s=>s!==prior).map(s=>({...s,unitIds:s.unitIds.filter(id=>id!==vehicleId)})).filter(s=>s.unitIds.length);
 doc.deployments.push(stage);return validate(doc);
}
return {SCHEMA,MAX_BYTES,structure,validate,defaults,withOccupant};
});
