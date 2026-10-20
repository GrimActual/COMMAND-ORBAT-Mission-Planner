'use strict';
const Resources=require('../../planner/resource-index');
const crypto=require('node:crypto');
const clone=x=>JSON.parse(JSON.stringify(x));
const capabilities=['inspect','crewSeating','passengerSeating','controlledLift','hover','pointFlight','landing','unload'];
function check(ok,message){if(!ok)throw new Error('Aircraft profile: '+message);}
function jsonData(value){let count=0;function visit(x,depth){check(++count<=20000&&depth<=16,'JSON structure bounds');if(x===null||typeof x==='boolean')return;if(typeof x==='number'){check(Number.isFinite(x),'finite JSON number required');return;}if(typeof x==='string'){check(x.length<=10000,'JSON text bounds');return;}check(x&&typeof x==='object','JSON data required');const array=Array.isArray(x);check(Object.getPrototypeOf(x)===(array?Array.prototype:Object.prototype),'plain JSON data required');const keys=Reflect.ownKeys(x).filter(k=>!(array&&k==='length'));check(keys.length<=1024,'JSON object bounds');if(array)check(keys.length===x.length,'dense JSON array required');for(const k of keys){const d=Object.getOwnPropertyDescriptor(x,k);check(typeof k==='string'&&d.enumerable&&Object.hasOwn(d,'value'),'accessors are unsupported');visit(d.value,depth+1);}}visit(value,0);}
function fields(x,keys){check(x&&Object.getPrototypeOf(x)===Object.prototype,'expected plain object');check(Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k)&&Object.hasOwn(Object.getOwnPropertyDescriptor(x,k),'value')),'unsupported or missing fields');}
function text(x,n=500){check(typeof x==='string'&&x.length>0&&x.length<=n&&!/[\x00-\x1f\x7f]/.test(x),'invalid text');return x;}
function validate(raw){
 jsonData(raw);
 check(Buffer.byteLength(JSON.stringify(raw))<=262144,'registry exceeds 256 KiB');
 fields(raw,['schema','version','targets','profiles']);check(raw.schema==='command-aircraft-profiles'&&raw.version===1,'unsupported schema');
 check(Array.isArray(raw.targets)&&raw.targets.length<=32&&Array.isArray(raw.profiles)&&raw.profiles.length<=128,'registry bounds');
 const ids=new Set(),identities=new Set(),targetIds=new Set();
 for(const t of raw.targets){fields(t,['id','variant','expectedAddonId','realWorldReference']);text(t.id,64);text(t.variant,120);check(!targetIds.has(t.id),'duplicate target');targetIds.add(t.id);check(t.expectedAddonId===null||/^[A-F0-9]{16}$/.test(t.expectedAddonId),'addon GUID');
  const r=t.realWorldReference;fields(r,['units','emptyMassEstimate','maximumTakeoffMassEstimate','provenance','note']);check(r.units==='kg','reference units');check(Number.isFinite(r.emptyMassEstimate)&&r.emptyMassEstimate>0,'reference empty mass');check(Array.isArray(r.maximumTakeoffMassEstimate)&&r.maximumTakeoffMassEstimate.length===2&&r.maximumTakeoffMassEstimate.every(x=>Number.isFinite(x)&&x>=r.emptyMassEstimate)&&r.maximumTakeoffMassEstimate[0]<=r.maximumTakeoffMassEstimate[1],'reference maximum mass');fields(r.provenance,['source','verification']);text(r.provenance.source);check(r.provenance.verification==='unverified-user-estimate','reference provenance');text(r.note);
 }
 for(const p of raw.profiles){fields(p,['id','version','targetId','variant','identity','identityEvidence','classification','targetMatch','rotorConfiguration','requiredComponents','controlBindings','seatRoleHints','calibration','validatedEnvironment','declaredDependencies','validation']);text(p.id,80);check(!ids.has(p.id),'duplicate profile');ids.add(p.id);check(p.version===1&&targetIds.has(p.targetId),'profile version/target');text(p.variant,120);fields(p.identity,['addonId','guid','path']);
  check(/^[A-F0-9]{16}$/.test(p.identity.guid)&&!/^0{16}$/.test(p.identity.guid),'exact prefab GUID required');
  // Reuse the established resource identity and safe-path validator.
  const index={schema:'companion-resource-index',version:1,addons:[{id:p.identity.addonId,name:'Profile dependency',version:null,dependencies:[]}],resources:[{id:'selected',...p.identity,kind:'prefab',observation:'metadata-only',provenance:{method:'manual',source:'COMMAND profile identity',license:null},dependencies:[]}]};Resources.validate(index);
 const key=[p.identity.addonId,p.identity.guid,p.identity.path.toLowerCase()].join('|');check(!identities.has(key),'duplicate exact identity');identities.add(key);text(p.identityEvidence);
  check(p.classification==='aircraft-candidate'&&p.rotorConfiguration==='unknown','unverified implementation classification');check(p.validation==='metadata-only','native certification requires a separate observation');
  check(['exact-variant-reference','unverified-variant'].includes(p.targetMatch),'target variant match');
  check(Array.isArray(p.requiredComponents)&&p.requiredComponents.length<=8&&p.requiredComponents.every(x=>typeof x==='string'&&/^[A-Za-z][A-Za-z0-9_]{0,80}$/.test(x)),'required components');
  check(Array.isArray(p.declaredDependencies)&&p.declaredDependencies.length<=32&&p.declaredDependencies.every(x=>/^[A-F0-9]{16}$/.test(x))&&p.declaredDependencies.includes(p.identity.addonId),'dependency identities');
  check(Array.isArray(p.controlBindings)&&!p.controlBindings.length&&Array.isArray(p.seatRoleHints)&&!p.seatRoleHints.length&&p.calibration===null&&p.validatedEnvironment===null,'this milestone cannot certify control, seats or calibration');
 }
 return clone(raw);
}
function create(raw,indexRaw){
 const registry=validate(raw),index=Resources.validate(indexRaw),resources=Resources.create(index),addons=new Map(index.addons.map(a=>[a.id,a]));
 // Includes versions, identity/resource changes, and declared resource/addon dependencies.
 // This is a metadata fingerprint, not a hash of the aircraft's actual assets.
 const environment=crypto.createHash('sha256').update(JSON.stringify({addons:[...index.addons].sort((a,b)=>a.id.localeCompare(b.id)),resources:[...index.resources].sort((a,b)=>a.id.localeCompare(b.id))})).digest('hex');
 function resolve(identity){
  fields(identity,['addonId','guid','path']);const found=resources.resolve(identity);
  const p=registry.profiles.find(p=>p.identity.addonId===identity.addonId&&p.identity.guid===identity.guid&&p.identity.path===identity.path);
  if(found.status!=='resolved')return {status:found.status,profile:null,environment,executable:false};
  if(!p)return {status:'unknown-implementation',profile:null,environment,executable:false};
  const missing=[],unknownVersions=[],walked=new Set();
  function visit(id){if(walked.has(id))return;walked.add(id);const a=addons.get(id);if(!a){missing.push(id);return;}if(a.version===null)unknownVersions.push(id);a.dependencies.forEach(visit);}
  p.declaredDependencies.forEach(visit);
  const resource=resources.resource(found.resourceId);const unresolvedResourceDependencies=resource.dependencies.map(ref=>resources.resolve(ref)).filter(r=>r.status!=='resolved');
  return {status:missing.length||unresolvedResourceDependencies.length?'missing-dependencies':'requires-native-inspection',profile:clone(p),missingDependencies:missing,unresolvedResourceDependencies,unknownVersions,environment,executable:false};
 }
 function inventory(){return registry.targets.map(t=>{const ps=registry.profiles.filter(p=>p.targetId===t.id),resolved=ps.map(p=>({id:p.id,...resolve(p.identity)})),present=resolved.some(r=>r.profile);return {targetId:t.id,variant:t.variant,expectedAddonId:t.expectedAddonId,status:present?(ps.some(p=>p.targetMatch==='exact-variant-reference')?'metadata-only':'variant-unverified'):t.expectedAddonId&&addons.has(t.expectedAddonId)?'addon-present-prefab-unresolved':t.expectedAddonId?'not-installed-in-supplied-index':'unindexed-gap',profiles:resolved,capabilities:Object.fromEntries(capabilities.map(k=>[k,'unverified'])),nextPrerequisite:present?'Inspect exact native entity with dependency versions and current resource evidence; resolve any variant mismatch.':'Supply installed exact-variant prefab index and addon dependencies.'};});}
 return {resolve,inventory,environment,snapshot:()=>clone(registry),serialize:()=>JSON.stringify(registry,null,2)+'\n'};
}
function diagnose(registry,identity,raw){
 jsonData(raw);
 const resolution=registry.resolve(identity),unavailable=reason=>({status:'unavailable',reason,resolution,executable:false});
 if(!resolution.profile)return unavailable('Exact implementation has no profile.');
 fields(raw,['schema','version','environment','identity','components','compartments','readings','unavailable','truncated']);
 check(raw.schema==='command-aircraft-observation'&&[1,2].includes(raw.version),'observation schema');
 if(raw.environment!==registry.environment)return unavailable('Dependency/resource metadata changed; revalidation required.');
 if(!raw.identity||['addonId','guid','path'].some(k=>raw.identity[k]!==identity[k])||Object.keys(raw.identity).length!==3)return unavailable('Observation belongs to another exact aircraft identity.');
 check(Array.isArray(raw.components)&&raw.components.length<=256&&raw.components.every(s=>typeof s==='string'&&s.length<=120),'component bounds');
 check(Array.isArray(raw.unavailable)&&raw.unavailable.length<=32&&raw.unavailable.every(s=>typeof s==='string'&&s.length<=300),'unavailable bounds');check(typeof raw.truncated==='boolean','truncation flag');
 check(Array.isArray(raw.compartments)&&raw.compartments.length<=128,'compartment bounds');const seats=new Set();let crew=0,cargo=0,occupied=0;
 let controllerPilots=0;
 for(const s of raw.compartments){const pilotFlag=raw.version===2&&Object.hasOwn(s,'controllerPilot');fields(s,['managerId','slotId','role','occupied','reserved','belongsToSelected',...(pilotFlag?['controllerPilot']:[])]);check([s.managerId,s.slotId].every(x=>Number.isInteger(x)&&x>=-2147483648&&x<=2147483647),'seat identity');check(['pilot','gunner','cargo','other'].includes(s.role),'seat role');check(['occupied','reserved','belongsToSelected'].every(k=>typeof s[k]==='boolean'),'seat flags');if(pilotFlag){check(typeof s.controllerPilot==='boolean','controller pilot flag');if(s.controllerPilot){check(s.role==='pilot'&&s.belongsToSelected&&++controllerPilots===1,'unique controlling pilot compartment required');}}const key=s.managerId+':'+s.slotId;check(!seats.has(key),'duplicate compartment');seats.add(key);if(!s.belongsToSelected)continue;if(s.role==='cargo')cargo++;else if(s.role==='pilot'||s.role==='gunner')crew++;if(s.occupied)occupied++;}
 fields(raw.readings,['positionM','attitudeDeg','velocityMps','angularVelocityRadps','engineOn','rotorRpm','groundContact','physicsBodyMassKg','massSemantics',...(raw.version===2?['bodyDynamic','bodyActive','centerOfMassLocalM','worldTimeMs','originAboveTerrainM']:[])]);
 if(raw.version===2){check(['bodyDynamic','bodyActive'].every(k=>raw.readings[k]===null||typeof raw.readings[k]==='boolean'),'physics body flags');const com=raw.readings.centerOfMassLocalM;check(com===null||Array.isArray(com)&&com.length===3&&com.every(Number.isFinite),'local COM');check(Number.isFinite(raw.readings.worldTimeMs)&&raw.readings.worldTimeMs>=0&&Number.isFinite(raw.readings.originAboveTerrainM),'sample time/terrain-origin observation');}
 for(const k of ['positionM','attitudeDeg','velocityMps','angularVelocityRadps'])check(raw.readings[k]===null||Array.isArray(raw.readings[k])&&raw.readings[k].length===3&&raw.readings[k].every(Number.isFinite),'vector reading');
 for(const k of ['engineOn','groundContact'])check(raw.readings[k]===null||typeof raw.readings[k]==='boolean','boolean reading');
 check(raw.readings.rotorRpm===null||Array.isArray(raw.readings.rotorRpm)&&raw.readings.rotorRpm.length<=16&&raw.readings.rotorRpm.every(x=>Number.isFinite(x)&&x>=0),'rotor readings');
 check(raw.readings.physicsBodyMassKg===null||Number.isFinite(raw.readings.physicsBodyMassKg)&&raw.readings.physicsBodyMassKg>0,'physics body mass');
 check(raw.readings.massSemantics==='physics-body-only; fuel/occupant inclusion unknown','mass semantics');
 const missing=resolution.profile.requiredComponents.filter(c=>!raw.components.includes(c));
 return {status:missing.length||raw.truncated||resolution.status==='missing-dependencies'?'incompatible':'observed-read-only',resolution,missingComponents:missing,seatCounts:{crew,cargo,occupied},observation:clone(raw),capabilities:Object.fromEntries(capabilities.map(k=>[k,k==='inspect'?'observed-read-only':'unverified'])),calibration:null,executable:false};
}
module.exports={validate,create,diagnose,capabilities};
