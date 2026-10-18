/* Original typed COMMAND wheeled-vehicle requests, separate from infantry routes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CommandVehicleControlContract=api;})(globalThis,function(){
'use strict';
const CAPABILITY='vehicle-control-v1',CONVOY_CAPABILITY='convoy-v1',kinds=Object.freeze(['vehicle-route','convoy-attach','convoy-detach']);
const key=(v,max=64)=>typeof v==='string'&&new RegExp('^[A-Za-z0-9_-]{1,'+max+'}$').test(v);
function exact(o,keys){if(!o||typeof o!=='object'||Array.isArray(o)||![Object.prototype,null].includes(Object.getPrototypeOf(o))||Reflect.ownKeys(o).length!==keys.length||keys.some(k=>{const d=Object.getOwnPropertyDescriptor(o,k);return !d||!('value'in d)||!d.enumerable;}))throw Error('Unsupported vehicle control fields');}
function validate(raw){
 if(!raw||raw.version!==4||!kinds.includes(raw.kind))throw Error('Invalid vehicle control request');
 exact(raw,['version','requestId','kind','targetRequestId','unitId','vehicleRequestId','vehicleUnitId',...(raw.kind==='vehicle-route'?['waypoints','timeoutSeconds']:raw.kind==='convoy-attach'?['leaderRequestId','leaderUnitId','timeoutSeconds']:[])]);
 if(!key(raw.requestId,40)||!key(raw.targetRequestId,40)||!key(raw.unitId)||!key(raw.vehicleRequestId,40)||!key(raw.vehicleUnitId)||[raw.targetRequestId,raw.vehicleRequestId].includes(raw.requestId)||raw.targetRequestId===raw.vehicleRequestId&&raw.unitId===raw.vehicleUnitId)throw Error('Choose exact separate crew and vehicle identities');
 if(raw.kind!=='convoy-detach'&&(!Number.isSafeInteger(raw.timeoutSeconds)||raw.timeoutSeconds<15||raw.timeoutSeconds>300))throw Error('Vehicle timeout must be 15–300 seconds');
 if(raw.kind==='vehicle-route'){
  if(!Array.isArray(raw.waypoints)||raw.waypoints.length<1||raw.waypoints.length>16)throw Error('Choose 1–16 vehicle route points');
  for(let i=0;i<raw.waypoints.length;i++){const p=raw.waypoints[i];exact(p,['worldX','worldZ']);if(![p.worldX,p.worldZ].every(v=>Number.isFinite(v)&&v>=0&&v<=13500)||i&&p.worldX===raw.waypoints[i-1].worldX&&p.worldZ===raw.waypoints[i-1].worldZ)throw Error('Invalid or repeated vehicle route point');}
 }
 if(raw.kind==='convoy-attach'&&(!key(raw.leaderRequestId,40)||!key(raw.leaderUnitId)||raw.leaderRequestId===raw.requestId||raw.leaderRequestId===raw.vehicleRequestId&&raw.leaderUnitId===raw.vehicleUnitId||raw.leaderRequestId===raw.targetRequestId&&raw.leaderUnitId===raw.unitId))throw Error('Choose a separate owned lead vehicle');
 return JSON.parse(JSON.stringify(raw));
}
return {CAPABILITY,CONVOY_CAPABILITY,capability:kind=>kind==='vehicle-route'?CAPABILITY:CONVOY_CAPABILITY,kinds,validate};
});
