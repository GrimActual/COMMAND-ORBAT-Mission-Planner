/* Typed native orders. Capabilities distinguish existing movement from the tactical extension. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CompanionAIOrderContract=api;})(globalThis,function(){
'use strict';
const CAPABILITY='ai-orders-v1',TACTICAL_CAPABILITY='ai-tactical-v1',MAX_HOLD_SECONDS=300,ROUTE_CAPABILITY='ai-routes-v1',MAX_ROUTE_POINTS=16,SQUAD_CAPABILITY='ai-squad-control-v1',FOLLOW_CAPABILITY='ai-follow-v1',FORMATION_CAPABILITY='ai-formation-v1',STANCE_CAPABILITY='ai-stance-v1',FIRE_CAPABILITY='ai-fire-policy-v1';
const kinds=Object.freeze(['ai-move','ai-hold','ai-defend','ai-halt','ai-route','ai-recruit','ai-release','ai-follow','ai-formation','ai-stance','ai-combat-mode']);
const pointKind=kind=>kind==='ai-move'||kind==='ai-defend';
const preferences=Object.freeze({'ai-formation':Object.freeze(['column','staggered-column','wedge','line','restore']),'ai-stance':Object.freeze(['stand','crouch','prone','auto']),'ai-combat-mode':Object.freeze(['open-fire','hold-fire','return-fire','auto'])});
const preferenceField=kind=>({'ai-formation':'formation','ai-stance':'stance','ai-combat-mode':'combatMode'})[kind];
const capability=kind=>kind==='ai-formation'?FORMATION_CAPABILITY:kind==='ai-stance'?STANCE_CAPABILITY:kind==='ai-combat-mode'?FIRE_CAPABILITY:['ai-recruit','ai-release'].includes(kind)?SQUAD_CAPABILITY:kind==='ai-follow'?FOLLOW_CAPABILITY:kind==='ai-route'?ROUTE_CAPABILITY:kind==='ai-defend'||kind==='ai-halt'?TACTICAL_CAPABILITY:CAPABILITY;
function validate(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||![Object.prototype,null].includes(Object.getPrototypeOf(raw)))throw Error('Invalid AI order');
 for(const k of Reflect.ownKeys(raw)){const d=Object.getOwnPropertyDescriptor(raw,k);if(typeof k!=='string'||!d||!('value' in d)||!d.enumerable)throw Error('Unsupported AI order fields');}
 if(!kinds.includes(raw.kind)||raw.version!==2)throw Error('Unsupported AI order');
 const key=(v,max=64)=>typeof v==='string'&&new RegExp('^[A-Za-z0-9_-]{1,'+max+'}$').test(v);
 if(raw.kind==='ai-recruit'){
  const keys=['version','requestId','kind','sourceEntityId'];
  if(Object.keys(raw).length!==keys.length||keys.some(k=>!Object.hasOwn(raw,k))||!key(raw.requestId,40)||!key(raw.sourceEntityId))throw Error('Recruitment requires one selected live AI identity');
  return JSON.parse(JSON.stringify(raw));
 }
 const keys=['version','requestId','kind','targetRequestId','unitId',...(preferenceField(raw.kind)?[preferenceField(raw.kind)]:[]),...(pointKind(raw.kind)?['worldX','worldZ']:[]),...(['ai-hold','ai-defend','ai-follow'].includes(raw.kind)?['holdSeconds']:[]),...(raw.kind==='ai-route'?['waypoints']:[]),...(raw.kind==='ai-follow'?['followEntityId']:[])];
 if(Object.keys(raw).length!==keys.length||keys.some(k=>!Object.hasOwn(raw,k)))throw Error('Unsupported AI order fields');

 if(!key(raw.requestId,40)||!key(raw.targetRequestId,40)||raw.requestId===raw.targetRequestId||!key(raw.unitId))throw Error('Invalid AI order target');
 if(preferences[raw.kind]&&!preferences[raw.kind].includes(raw[preferenceField(raw.kind)]))throw Error('Unsupported native squad setting');
 if(raw.kind==='ai-follow'&&!key(raw.followEntityId))throw Error('Choose a selected live player to follow');
 if(pointKind(raw.kind)&&![raw.worldX,raw.worldZ].every(v=>Number.isFinite(v)&&v>=0&&v<=13500))throw Error('AI order requires supported Everon world coordinates');
 if(['ai-hold','ai-defend','ai-follow'].includes(raw.kind)&&(!Number.isSafeInteger(raw.holdSeconds)||raw.holdSeconds<5||raw.holdSeconds>MAX_HOLD_SECONDS))throw Error('Hold duration must be 5–300 seconds');
 if(raw.kind==='ai-route'){
  if(!Array.isArray(raw.waypoints)||raw.waypoints.length<1||raw.waypoints.length>MAX_ROUTE_POINTS)throw Error('Choose 1–16 route waypoints');
  for(let i=0;i<raw.waypoints.length;i++){const descriptor=Object.getOwnPropertyDescriptor(raw.waypoints,String(i));if(!descriptor||!('value' in descriptor))throw Error('Unsupported route point');const p=descriptor.value;
   if(!p||typeof p!=='object'||Array.isArray(p)||![Object.prototype,null].includes(Object.getPrototypeOf(p))||Reflect.ownKeys(p).length!==2)throw Error('Unsupported route point');
   for(const k of ['worldX','worldZ']){const d=Object.getOwnPropertyDescriptor(p,k);if(!d||!('value' in d)||!d.enumerable||!Number.isFinite(d.value)||d.value<0||d.value>13500)throw Error('Route requires supported Everon coordinates');}
   if(i&&p.worldX===raw.waypoints[i-1].worldX&&p.worldZ===raw.waypoints[i-1].worldZ)throw Error('Consecutive route points must differ');
  }
 }
 return JSON.parse(JSON.stringify(raw));
}
function capabilities(values){if(!Array.isArray(values)||values.length>8||new Set(values).size!==values.length||values.some(v=>![CAPABILITY,TACTICAL_CAPABILITY,ROUTE_CAPABILITY,SQUAD_CAPABILITY,FOLLOW_CAPABILITY,FORMATION_CAPABILITY,STANCE_CAPABILITY,FIRE_CAPABILITY].includes(v)))throw Error('Unsupported GM capabilities');return [...values];}
return {preferences,preferenceField,FORMATION_CAPABILITY,STANCE_CAPABILITY,FIRE_CAPABILITY,validate,capabilities,CAPABILITY,TACTICAL_CAPABILITY,MAX_HOLD_SECONDS,ROUTE_CAPABILITY,MAX_ROUTE_POINTS,SQUAD_CAPABILITY,FOLLOW_CAPABILITY,kinds,pointKind,capability};
});
