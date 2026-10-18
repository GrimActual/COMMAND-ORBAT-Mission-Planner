/* Original COMMAND server snapshot requests. Paths never cross the protocol. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CommandScenarioContract=api;})(globalThis,function(){
'use strict';
const CAPABILITY='scenario-snapshots-v1',kinds=Object.freeze(['scenario-save-plan','scenario-save-current','scenario-review','scenario-restore']);
const key=(v,max=64)=>typeof v==='string'&&new RegExp('^[A-Za-z0-9_-]{1,'+max+'}$').test(v);
function exact(o,keys){if(!o||typeof o!=='object'||Array.isArray(o)||![Object.prototype,null].includes(Object.getPrototypeOf(o))||Reflect.ownKeys(o).length!==keys.length||keys.some(k=>{const d=Object.getOwnPropertyDescriptor(o,k);return !d||!('value'in d)||!d.enumerable;}))throw Error('Unsupported scenario fields');}
function validate(raw){
 if(!raw||!kinds.includes(raw.kind)||raw.version!==3||!key(raw.requestId,40))throw Error('Invalid scenario request');
 const fields=raw.kind==='scenario-save-plan'?['sourceMissionSha256','entities']:raw.kind==='scenario-save-current'?['targets']:raw.kind==='scenario-review'?['snapshotName']:['reviewRequestId'];
 exact(raw,['version','requestId','kind',...fields]);
 if(raw.kind==='scenario-save-plan'){
  if(!/^[a-f0-9]{64}$/.test(raw.sourceMissionSha256)||!Array.isArray(raw.entities)||raw.entities.length<1||raw.entities.length>16)throw Error('Choose 1–16 reviewed planned entities');
  const ids=new Set();for(const e of raw.entities){exact(e,['unitId','name','resourceName','worldX','worldZ','headingDegrees']);
   const m=typeof e.resourceName==='string'&&e.resourceName.match(/^\{([A-F0-9]{16})\}(.+\.et)$/i);
   if(!m||/^0{16}$/.test(m[1])||m[2].length>512||m[2].startsWith('/')||/[\\:%{}<>"|?*]/.test(m[2])||m[2].split('/').some(p=>!p||p==='.'||p==='..'||p.trim()!==p||p.endsWith('.')))throw Error('Exact safe prefab reference required');
   if(!key(e.unitId)||ids.has(e.unitId)||typeof e.name!=='string'||!e.name.trim()||e.name.length>160||/[\x00-\x1f\x7f]/.test(e.name)||![e.worldX,e.worldZ].every(v=>Number.isFinite(v)&&v>=0&&v<=13500)||!Number.isFinite(e.headingDegrees)||e.headingDegrees<0||e.headingDegrees>=360)throw Error('Invalid planned entity');ids.add(e.unitId);
  }
 }
 if(raw.kind==='scenario-save-current'){
  if(!Array.isArray(raw.targets)||raw.targets.length<1||raw.targets.length>16)throw Error('Choose 1–16 owned entities');
  const ids=new Set();for(const target of raw.targets){exact(target,['targetRequestId','unitId']);const id=target.targetRequestId+'/'+target.unitId;if(!key(target.targetRequestId,40)||!key(target.unitId)||target.targetRequestId===raw.requestId||ids.has(id))throw Error('Invalid or duplicate owned identity');ids.add(id);}
 }
 if(raw.kind==='scenario-review'&&!key(raw.snapshotName,40))throw Error('Choose a server snapshot ID, without a path or extension');
 if(raw.kind==='scenario-restore'&&(!key(raw.reviewRequestId,40)||raw.reviewRequestId===raw.requestId))throw Error('A separate completed review is required');
 if(JSON.stringify(raw).length>24576)throw Error('Scenario request too large');return JSON.parse(JSON.stringify(raw));
}
function validateReceipt(raw){
 if(JSON.stringify(raw).length>24576)throw Error('Snapshot review exceeds the detail budget');
 exact(raw,['snapshotName','mode','entityCount','world','requiredAddons','entities']);
 if(!key(raw.snapshotName,40)||!['planned','current'].includes(raw.mode)||!Number.isInteger(raw.entityCount)||raw.entityCount<1||raw.entityCount>16||typeof raw.world!=='string'||!raw.world||raw.world.length>530||/[\x00-\x1f]/.test(raw.world)||!Array.isArray(raw.entities)||raw.entities.length!==raw.entityCount)throw Error('Invalid server snapshot receipt');
 if(!Array.isArray(raw.requiredAddons)||raw.requiredAddons.length<1||raw.requiredAddons.length>128||new Set(raw.requiredAddons).size!==raw.requiredAddons.length||raw.requiredAddons.some(a=>typeof a!=='string'||!/^[A-Fa-f0-9]{16}$/.test(a)))throw Error('Invalid addon manifest');
 const ids=new Set();for(const e of raw.entities){exact(e,['unitId','resourceName','factionKey','worldX','worldY','worldZ','headingDegrees','memberCount','orderCount','ordersText']);
  if(typeof e.ordersText!=='string'||e.ordersText.length>2000||/[\x00-\x1f]/.test(e.ordersText)||!key(e.unitId)||ids.has(e.unitId)||typeof e.resourceName!=='string'||e.resourceName.length>530||!/^\{[a-f0-9]{16}\}.+\.et$/i.test(e.resourceName)||typeof e.factionKey!=='string'||e.factionKey.length>64||/[\x00-\x1f]/.test(e.factionKey)||![e.worldX,e.worldZ].every(v=>Number.isFinite(v)&&v>=0&&v<=13500)||!Number.isFinite(e.worldY)||Math.abs(e.worldY)>2000||!Number.isFinite(e.headingDegrees)||e.headingDegrees<0||e.headingDegrees>=360||!Number.isInteger(e.memberCount)||e.memberCount<0||e.memberCount>16||!Number.isInteger(e.orderCount)||e.orderCount<0||e.orderCount>4)throw Error('Invalid snapshot entity receipt');ids.add(e.unitId);
 }return JSON.parse(JSON.stringify(raw));
}
return {CAPABILITY,kinds,key,validate,validateReceipt};
});
