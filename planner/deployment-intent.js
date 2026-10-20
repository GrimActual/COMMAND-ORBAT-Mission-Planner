/* Reviewed deployment intentions only. No native execution or mission mutation. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./planner-core'):root.PlannerCore,typeof module==='object'&&module.exports?require('./resource-index'):root.CompanionResources);if(typeof module==='object'&&module.exports)module.exports=api;else root.CompanionDeployment=api;})(globalThis,function(C,R){
'use strict';
const clone=C.clone,MAX_UNITS=16;
// Live layers display world X/Z + 50 m to match the terrain tile capture centers.
// Planned positions use that display space; invert it exactly once for native spawn/export.
const TERRAIN_DISPLAY_OFFSET=50;
function fields(v,names){if(!v||typeof v!=='object'||Array.isArray(v)||![Object.prototype,null].includes(Object.getPrototypeOf(v))||Reflect.ownKeys(v).length!==names.length||names.some(k=>{const d=Object.getOwnPropertyDescriptor(v,k);return !d||!('value' in d)||!d.enumerable;}))throw Error('Unsupported deployment fields');}
async function digest(value){const crypto=typeof module==='object'&&module.exports?require('node:crypto').webcrypto:globalThis.crypto;const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
function worldPosition(position){const p=C.point(position),worldX=p.lng-TERRAIN_DISPLAY_OFFSET,worldZ=p.lat-TERRAIN_DISPLAY_OFFSET;if(worldX<0||worldZ<0||worldX>13500||worldZ>13500)throw Error('Pilot requires supported Everon world coordinates');return {worldX,worldZ};}
function selection(plan,index,ids,heading){
 if(!Array.isArray(ids)||ids.length<1||ids.length>MAX_UNITS||new Set(ids).size!==ids.length)throw Error('Choose 1 to 16 distinct planned units');
 if(!Number.isFinite(heading)||heading<0||heading>=360)throw Error('Heading must be between 0 and 360 degrees');
 const unitMap=new Map(plan.orderOfBattle.map(u=>[u.id,u])),resources=new Map(index.resources.map(r=>[r.id,r]));
 return ids.map(id=>{const u=unitMap.get(id);if(!u)throw Error('Selected unit is missing');const name=typeof u.name==='string'&&u.name.trim()?u.name:'Unit '+u.id;if(name.length>160||/[\x00-\x1f\x7f]/.test(name))throw Error('Selected unit name must be 1–160 characters without control characters. Update it in Units and Apply changes.');if(u.assetCatalogItem?.migrationSource?.terrainContext)throw Error('This imported terrain identity requires native world verification; the current bridge cannot enforce it. Keep this as a planning review.');const asset=u.assetCatalogItem,ref=asset?.resourceReference,r=resources.get(ref?.id);if(!r||r.kind!=='prefab'||!r.guid||JSON.stringify(r)!==JSON.stringify(R.validate({schema:'companion-resource-index',version:1,addons:[{id:r.addonId,name:'Selected owner',version:null,dependencies:[]}],resources:[ref]}).resources[0]))throw Error('Selected unit requires a matching reviewed prefab with GUID provenance');if(asset.targetObservation?.warning)throw Error('Selected prefab has an unresolved or empty local target');const {worldX,worldZ}=worldPosition(u.position);return {unitId:u.id,name,resourceId:r.id,addonId:r.addonId,resourceGuid:r.guid,resourcePath:r.path,resourceReference:clone(r),resourceName:'{'+r.guid+'}'+r.path,position:{worldX,worldZ,heightMode:'terrain'},headingDegrees:u.headingDegrees??heading};});
}
async function review(mission,metadata,ids,headingDegrees){
 const plan=C.validate(clone(mission)),index=R.validate(metadata),entities=selection(plan,index,ids,headingDegrees),addons=new Map(index.addons.map(a=>[a.id,a])),needed=new Set(),missing=new Set();
 function visit(id){if(needed.has(id))return;needed.add(id);const a=addons.get(id);if(!a){missing.add(id);return;}for(const dep of a.dependencies)visit(dep);}
 for(const entity of entities){visit(entity.addonId);for(const dep of index.resources.find(r=>r.id===entity.resourceId).dependencies)if(dep.addonId)visit(dep.addonId);}
 const packageData={schema:'companion-deployment-intent',version:1,terrain:'Everon',intentOnly:true,sourceMissionSha256:await digest(plan),entities,requiredAddons:[...needed].sort().map(id=>({id,declaredVersion:addons.get(id)?.version??null,metadataPresent:addons.has(id)})),unresolvedAddonIds:[...missing].sort(),nativeValidationRequired:true};
 const frozen=validate(packageData);return {preview:()=>clone(frozen),export:async current=>{if(await digest(C.validate(clone(current)))!==frozen.sourceMissionSha256)throw Error('Plan changed. Review deployment again.');return clone(frozen);}};
}
function validate(raw){
 fields(raw,['schema','version','terrain','intentOnly','sourceMissionSha256','entities','requiredAddons','unresolvedAddonIds','nativeValidationRequired']);
 if(raw.schema!=='companion-deployment-intent'||raw.version!==1||raw.terrain!=='Everon'||raw.intentOnly!==true||raw.nativeValidationRequired!==true||!/^[a-f0-9]{64}$/.test(raw.sourceMissionSha256))throw Error('Unsupported deployment intent');
 if(!Array.isArray(raw.entities)||!raw.entities.length||raw.entities.length>MAX_UNITS||!Array.isArray(raw.requiredAddons)||raw.requiredAddons.length>500||!Array.isArray(raw.unresolvedAddonIds))throw Error('Deployment limit exceeded');
 const guid=v=>typeof v==='string'&&/^[A-F0-9]{16}$/.test(v)&&!/^0{16}$/.test(v),ids=new Set(),addonIds=new Set();
 for(const a of raw.requiredAddons){fields(a,['id','declaredVersion','metadataPresent']);if(!guid(a.id)||addonIds.has(a.id)||typeof a.metadataPresent!=='boolean'||!(a.declaredVersion===null||typeof a.declaredVersion==='string'&&/^[0-9A-Za-z][0-9A-Za-z._+-]{0,39}$/.test(a.declaredVersion)))throw Error('Invalid required addon');addonIds.add(a.id);}
 const unresolved=raw.requiredAddons.filter(a=>!a.metadataPresent).map(a=>a.id).sort();if(JSON.stringify(unresolved)!==JSON.stringify(raw.unresolvedAddonIds))throw Error('Unresolved addons differ from requirements');
 for(const e of raw.entities){fields(e,['unitId','name','resourceId','addonId','resourceGuid','resourcePath','resourceReference','resourceName','position','headingDegrees']);if(!(typeof e.unitId==='string'||Number.isSafeInteger(e.unitId))||ids.has(e.unitId)||typeof e.name!=='string'||!e.name.trim()||e.name.length>160||/[\x00-\x1f\x7f]/.test(e.name)||!/^[A-Za-z0-9_-]{1,64}$/.test(e.resourceId)||!guid(e.addonId)||!addonIds.has(e.addonId)||!guid(e.resourceGuid)||typeof e.resourcePath!=='string'||!e.resourcePath.toLowerCase().endsWith('.et')||e.resourceName!=='{'+e.resourceGuid+'}'+e.resourcePath||!Number.isFinite(e.headingDegrees)||e.headingDegrees<0||e.headingDegrees>=360)throw Error('Invalid entity intent');ids.add(e.unitId);
 const ref=R.validate({schema:'companion-resource-index',version:1,addons:[{id:e.addonId,name:'Intent owner',version:null,dependencies:[]}],resources:[e.resourceReference]}).resources[0];if(ref.id!==e.resourceId||ref.addonId!==e.addonId||ref.guid!==e.resourceGuid||ref.path!==e.resourcePath||ref.kind!=='prefab')throw Error('Deployment provenance differs from entity identity');
 R.validate({schema:'companion-resource-index',version:1,addons:[{id:e.addonId,name:'Intent owner',version:null,dependencies:[]}],resources:[{id:e.resourceId,addonId:e.addonId,guid:e.resourceGuid,path:e.resourcePath,kind:'prefab',observation:'metadata-only',provenance:{method:'manual',source:'Deployment intent identity validation',license:null},dependencies:[]}]});
 fields(e.position,['worldX','worldZ','heightMode']);if(e.position.heightMode!=='terrain'||![e.position.worldX,e.position.worldZ].every(v=>Number.isFinite(v)&&v>=0&&v<=13500))throw Error('Invalid world position');
 }
 if(new TextEncoder().encode(JSON.stringify(raw)).length>262144)throw Error('Deployment exceeds 256 KiB');return clone(raw);
}
return {review,validate,worldPosition,MAX_UNITS};
});
