'use strict';
// Source-only candidate preparation. Never applies edits, sends orders or enables Import.
const C=require('../../planner/planner-core'),R=require('../../planner/resource-index'),A=require('../../planner/resource-asset'),X=require('./contract.cjs');
const {isDeepStrictEqual}=require('node:util');
const copy=value=>JSON.parse(JSON.stringify(value));
const fail=(code,message)=>{const error=new Error(message);error.code=code;throw error;};
function fields(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))fail('CHOICES','Missing or unsupported review choices');}
function exactIds(value,wanted){if(!Array.isArray(value)||value.length!==wanted.length||value.some(id=>typeof id!=='string')||new Set(value).size!==value.length||value.some(id=>!wanted.includes(id)))fail('CONFIRMATION','Confirm exactly the reviewed managed IDs');}
function prepare(missionText,baselineText,nativeText,indexText,choicesText){
 const review=X.reviewNative(missionText,baselineText,nativeText);if(review.issues.length)fail('REVIEW_BLOCKED','Resolve all review issues before preparing a candidate');
 if(indexText===null&&review.added.length)fail('RESOURCE','New placements need the current reviewed resource index');
 const before=JSON.parse(missionText),base=JSON.parse(baselineText),wire=JSON.parse(nativeText),choices=X.decodeJSON(choicesText),index=indexText===null?{addons:[],resources:[]}:R.validate(X.decodeJSON(indexText,R.LIMITS.bytes));
 fields(choices,['schema','version','confirmedMovedIds','confirmedRemovedIds','added']);if(choices.schema!=='command-workbench-candidate-choices'||choices.version!==1)fail('CHOICES','Unsupported candidate choices');
 exactIds(choices.confirmedMovedIds,review.moved.map(row=>row.managedId));exactIds(choices.confirmedRemovedIds,review.removed.map(row=>row.managedId));
 if(!Array.isArray(choices.added)||choices.added.length!==review.added.length)fail('CLASSIFICATION','Classify every reviewed addition');
 exactIds(choices.added.map(row=>row?.managedId),review.added.map(row=>row.managedId));
 const next=copy(before),removed=new Set(review.removed.map(row=>String(row.unitId))),rows=new Map(wire.entities.map(row=>[row.managedId,row])),units=new Map(next.orderOfBattle.map(unit=>[String(unit.id),unit])),resources=new Map(index.resources.map(resource=>[resource.id,resource])),assets=new Map(),assigned=[];
 const usedIds=new Set(before.orderOfBattle.map(unit=>String(unit.id)));let serial=1;
 function fresh(){while(usedIds.has('workbench-'+serial))serial++;const id='workbench-'+serial++;usedIds.add(id);return id;}
 function pose(unit,row){
  unit.position={lng:row.transform.position[0]+base.mapOffset.east,lat:row.transform.position[2]+base.mapOffset.north};
  unit.workbenchReview={schema:'command-workbench-review-pose',version:1,planId:base.planId,exchangeId:base.exchangeId,managedId:row.managedId,world:copy(base.world),space:base.space,mapOffset:copy(base.mapOffset),transform:copy(row.transform),nativeValidationRequired:true};
 }
 for(const moved of review.moved)pose(units.get(String(moved.unitId)),rows.get(moved.managedId));
 next.orderOfBattle=next.orderOfBattle.filter(unit=>!removed.has(String(unit.id)));
 for(const pick of choices.added){
  fields(pick,['managedId','name','side','unitType','phaseId','parentId','resourceId']);
  if(typeof pick.side!=='string'||!Object.hasOwn(C.SIDES,pick.side)||typeof pick.unitType!=='string'||!Object.hasOwn(C.TYPES,pick.unitType))fail('CLASSIFICATION','Choose an explicit planner side and unit type');
  if(pick.name!==null&&(typeof pick.name!=='string'||pick.name.length>160||/[\x00-\x1f\x7f]/.test(pick.name)))fail('CLASSIFICATION','Invalid optional planning name');
  if(pick.phaseId!==null&&(typeof pick.phaseId!=='string'||!before.phases.some(phase=>phase.id===pick.phaseId)))fail('CLASSIFICATION','Choose an existing phase or no phase');
  if(pick.parentId!==null&&!next.orderOfBattle.some(unit=>unit.id===pick.parentId))fail('CLASSIFICATION','Choose a retained parent with its exact planner identity');
  const row=rows.get(pick.managedId),resource=resources.get(pick.resourceId);
  if(!resource||resource.kind!=='prefab'||!resource.guid||['addonId','guid','path'].some(key=>resource[key]!==row.prefab[key]))fail('RESOURCE','Select the exact approved prefab from the current resource index');
  const key=resource.id;
  if(!assets.has(key)){
   const existing=before.orderOfBattle.filter(unit=>unit.assetCatalogItem?.resourceReference&&['addonId','guid','path'].every(field=>unit.assetCatalogItem.resourceReference[field]===resource[field])).map(unit=>({...unit.assetCatalogItem,id:unit.asset,name:unit.assetName||unit.asset}));
   if(existing.some(asset=>!isDeepStrictEqual(asset.resourceReference,resource))||existing.some(asset=>!isDeepStrictEqual(asset,existing[0])))fail('RESOURCE_CONFLICT','Existing prefab definitions differ; review their resource binding before adding placements');
   const owner=index.addons.find(addon=>addon.id===resource.addonId),subset={schema:'companion-resource-index',version:1,addons:[owner],resources:[resource]};
   assets.set(key,existing.length?copy(existing[0]):A.create(subset,resource.id,resource.path.split('/').at(-1).slice(0,160),'other'));
  }
  const asset=copy(assets.get(key)),id=fresh(),unit={id,name:pick.name?.trim()||'Unit '+id,side:pick.side,unitType:pick.unitType,phaseId:pick.phaseId,parentId:pick.parentId,asset:asset.id,assetName:asset.name,assetCatalogItem:asset,position:{lat:0,lng:0}};
  pose(unit,row);next.orderOfBattle.push(unit);assigned.push({managedId:row.managedId,unitId:id});
 }
 const candidate=C.validate(next);if(Buffer.byteLength(JSON.stringify(candidate))>5*1024*1024)fail('LIMIT','Candidate exceeds the planner mission limit');
 return {schema:'command-workbench-mission-candidate',version:1,status:'development-only',canApply:false,nativeValidationRequired:true,sourceMissionSha256:base.planSha256,review,candidate,assigned};
}
module.exports={prepare};
