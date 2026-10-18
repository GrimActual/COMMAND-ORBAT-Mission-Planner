'use strict';
// Development-only exchange review. No native import, file writes or plan mutation.
const {createHash}=require('node:crypto');
const C=require('../../planner/planner-core');
const R=require('../../planner/resource-index');
const LIMIT=1000, BYTES=2*1024*1024;
const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const hash=v=>createHash('sha256').update(stable(v)).digest('hex');
function parse(text,max=BYTES){
 if(typeof text!=='string'||Buffer.byteLength(text)>max)fail('LIMIT','Expected bounded JSON text');let result;try{result=JSON.parse(text);}catch{fail('JSON','Invalid JSON');}
 // JSON.parse overwrites duplicate keys. Reject ambiguous identities before review.
 const stack=[];
 for(let i=0;i<text.length;i++){
  const c=text[i];if(c==='"'){const start=i++;for(;i<text.length;i++){if(text[i]==='\\'){i++;continue;}if(text[i]==='"')break;}const top=stack.at(-1);if(top?.keys&&top.expectKey){const key=JSON.parse(text.slice(start,i+1));if(top.keys.has(key))fail('DUPLICATE','Repeated JSON field');top.keys.add(key);top.expectKey=false;}}
  else if(c==='{'||c==='['){stack.push(c==='{'?{keys:new Set(),expectKey:true}:{});if(stack.length>64)fail('LIMIT','JSON nesting exceeds 64 levels');}
  else if(c==='}'||c===']')stack.pop();else if(c===','&&stack.at(-1)?.keys)stack.at(-1).expectKey=true;
 }
 return result;
}
function fields(v,keys){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('FIELDS','Missing or unsupported exchange fields');}
function token(v){if(typeof v!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v))fail('IDENTITY','Invalid exchange identity');return v;}
function array(v){if(!Array.isArray(v)||v.length>LIMIT)fail('LIMIT','Exchange exceeds 1000 rows');return v;}
function number(v,min=-10000000,max=10000000){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail('BOUNDS','Invalid coordinate or angle');return v;}
function triple(v,min,max){if(!Array.isArray(v)||v.length!==3)fail('TRANSFORM','Expected three coordinates');return v.map(n=>number(n,min,max));}
function reference(v,extension){fields(v,['addonId','guid','path']);const resource=R.validate({schema:'companion-resource-index',version:1,addons:[{id:v.addonId,name:'Declared exchange owner',version:null,dependencies:[]}],resources:[{id:'ref',...v,kind:extension==='.ent'?'world':'prefab',observation:'metadata-only',provenance:{method:'manual',source:'Exchange declaration; native verification pending',license:null},dependencies:[]}]}).resources[0],checked={addonId:resource.addonId,guid:resource.guid,path:resource.path};if(!checked.addonId||!checked.guid||!checked.path||!checked.path.endsWith(extension)||stable(checked)!==stable(v))fail('RESOURCE','Expected exact canonical addon, GUID and resource path');return checked;}
function unitId(v){if(typeof v==='number'&&Number.isSafeInteger(v)&&v>0)return v;if(typeof v==='string'&&v.length>0&&v.length<=100&&!/[\x00-\x1f\x7f]/.test(v))return v;fail('IDENTITY','Invalid planner unit identity');}
function transform(v,bounds){fields(v,['position','angles']);const position=triple(v.position),angles=triple(v.angles,-180,360);if(angles[1]>180||angles[2]>180)fail('TRANSFORM','Pitch and roll must be within -180..180 degrees');if(position.some((n,i)=>n<bounds.min[i]||n>bounds.max[i]))fail('BOUNDS','Placement is outside the selected world bounds');return {position,angles};}
function envelope(v){
 fields(v,['schema','version','planId','exchangeId','planSha256','world','layerId','space','mapOffset','bounds','resources','entities']);
 if(v.schema!=='command-workbench-baseline'||v.version!==1||v.space!=='world-metres-yaw-pitch-roll-degrees'||!(/^[a-f0-9]{64}$/.test(v.planSha256)))fail('SCHEMA','Unsupported exchange baseline');
 token(v.planId);token(v.exchangeId);if(v.layerId!=='COMMAND_'+v.exchangeId)fail('SCOPE','A dedicated exchange layer is required');reference(v.world,'.ent');
 fields(v.mapOffset,['east','north']);number(v.mapOffset.east);number(v.mapOffset.north);
 fields(v.bounds,['min','max']);triple(v.bounds.min);triple(v.bounds.max);if(v.bounds.min.some((n,i)=>n>=v.bounds.max[i]))fail('BOUNDS','Invalid world bounds');
 const resources=new Set(),guids=new Set([v.world.guid]),paths=new Set();for(const resource of array(v.resources)){reference(resource,'.et');const key=stable(resource),pathKey=resource.addonId+'|'+resource.path.toLowerCase();if(resources.has(key))fail('DUPLICATE','Duplicate approved prefab');if(guids.has(resource.guid)||paths.has(pathKey))fail('RESOURCE_CONFLICT','Conflicting GUID/path resource identity');guids.add(resource.guid);paths.add(pathKey);resources.add(key);}
 const managed=new Set(),units=new Set();
 for(const entity of array(v.entities)){fields(entity,['managedId','unitId','prefab','transform']);token(entity.managedId);unitId(entity.unitId);reference(entity.prefab,'.et');transform(entity.transform,v.bounds);if(!resources.has(stable(entity.prefab)))fail('PREFAB','Baseline prefab is outside the approved resource set');if(managed.has(entity.managedId)||units.has(String(entity.unitId)))fail('DUPLICATE','Duplicate managed or unit identity');managed.add(entity.managedId);units.add(String(entity.unitId));}
 if(!v.entities.length)fail('LIMIT','Select at least one managed placement');return v;
}
function mission(text){const raw=parse(text,5*1024*1024),clean=C.validate(raw);if(stable(raw)!==stable(clean))fail('PLAN','Normalize the mission through the planner before exchange');return clean;}
function verifyPlan(plan,base){
 if(hash(plan)!==base.planSha256)fail('STALE','The plan changed after the exchange baseline');const units=new Map(plan.orderOfBattle.map(u=>[String(u.id),u]));
 for(const entity of base.entities){const u=units.get(String(entity.unitId));if(!u||u.id!==entity.unitId)fail('IDENTITY','Baseline unit is absent or has a conflicting identity type');if(entity.transform.position[0]!==u.position.lng-base.mapOffset.east||entity.transform.position[2]!==u.position.lat-base.mapOffset.north)fail('ALIGNMENT','Baseline placement does not match its planner unit');const ref=u.assetCatalogItem?.resourceReference;if(!ref||ref.addonId!==entity.prefab.addonId||ref.guid!==entity.prefab.guid||ref.path!==entity.prefab.path)fail('PREFAB','Baseline prefab differs from the planner resource');}
 return units;
}
function createBaseline(missionText,configurationText){
 const plan=mission(missionText),config=parse(configurationText);fields(config,['planId','exchangeId','world','mapOffset','bounds','resources','entities']);
 const base=envelope({schema:'command-workbench-baseline',version:1,...config,planSha256:hash(plan),layerId:'COMMAND_'+config.exchangeId,space:'world-metres-yaw-pitch-roll-degrees'});verifyPlan(plan,base);return {baseline:base,baselineSha256:hash(base),nativeValidationRequired:true};
}
function review(missionText,baselineText,snapshotText){
 const plan=mission(missionText),base=envelope(parse(baselineText)),units=verifyPlan(plan,base),snapshot=parse(snapshotText);
 fields(snapshot,['schema','version','planId','exchangeId','baselineSha256','world','layerId','space','scanComplete','scanErrors','unmanagedEntityCount','entities']);
 if(snapshot.schema!=='command-workbench-snapshot'||snapshot.version!==1)fail('SCHEMA','Unsupported editor snapshot');
 if(snapshot.planId!==base.planId||snapshot.exchangeId!==base.exchangeId||snapshot.baselineSha256!==hash(base))fail('IDENTITY','Snapshot does not match the reviewed exchange');
 if(stable(snapshot.world)!==stable(base.world)||snapshot.layerId!==base.layerId||snapshot.space!==base.space)fail('SCOPE','World, layer or transform space mismatch');
 if(snapshot.scanComplete!==true||!Array.isArray(snapshot.scanErrors)||snapshot.scanErrors.length)fail('INCOMPLETE','Partial or failed scans cannot imply removals');
 if(!Number.isSafeInteger(snapshot.unmanagedEntityCount)||snapshot.unmanagedEntityCount<0)fail('SCOPE','Invalid unmanaged-entity count');
 const approved=new Set(base.resources.map(stable)),before=new Map(base.entities.map(e=>[e.managedId,e])),seen=new Set(),added=[],moved=[],removed=[],unchanged=[],issues=[];
 for(const row of array(snapshot.entities)){
  fields(row,['managedId','unitId','prefab','transform']);token(row.managedId);reference(row.prefab,'.et');transform(row.transform,base.bounds);if(seen.has(row.managedId))fail('DUPLICATE','Repeated managed identity');seen.add(row.managedId);
  const previous=before.get(row.managedId);
  if(!approved.has(stable(row.prefab)))issues.push({managedId:row.managedId,code:'PREFAB_NOT_APPROVED'});
  if(!previous){if(row.unitId!==null)fail('IDENTITY','New managed placements cannot claim existing planner identities');added.push(row);continue;}
  if(row.unitId!==previous.unitId)fail('IDENTITY','Managed identity was rebound to another planner unit');
  if(stable(row.prefab)!==stable(previous.prefab))issues.push({managedId:row.managedId,code:'PREFAB_CHANGED'});
  const translated=stable(row.transform.position)!==stable(previous.transform.position),rotated=stable(row.transform.angles)!==stable(previous.transform.angles);
  if(translated||rotated){if(units.get(String(previous.unitId)).locked)issues.push({managedId:row.managedId,code:'LOCKED'});moved.push({managedId:row.managedId,unitId:row.unitId,before:previous.transform,after:row.transform,translated,rotated});}else unchanged.push(row.managedId);
 }
 for(const previous of base.entities){if(seen.has(previous.managedId))continue;removed.push(previous);if(units.get(String(previous.unitId)).locked)issues.push({managedId:previous.managedId,code:'LOCKED'});}
 const removedIds=new Set(removed.map(e=>String(e.unitId)));
 const retainedChildren=new Map();for(const unit of plan.orderOfBattle){if(unit.parentId==null||removedIds.has(String(unit.id)))continue;const key=String(unit.parentId);if(!retainedChildren.has(key))retainedChildren.set(key,[]);retainedChildren.get(key).push(unit.id);}
 for(const previous of removed){const children=retainedChildren.get(String(previous.unitId));if(children?.length)issues.push({managedId:previous.managedId,code:'REMAINING_CHILDREN',unitIds:children});}
 return {schema:'command-workbench-change-review',version:1,status:'development-review-only',canApply:false,nativeValidationRequired:true,planId:base.planId,exchangeId:base.exchangeId,baselineSha256:hash(base),ignoredUnmanagedCount:snapshot.unmanagedEntityCount,added,moved,removed,unchanged,issues};
}
module.exports={LIMIT,BYTES,createBaseline,review};
