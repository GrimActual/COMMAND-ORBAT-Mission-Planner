'use strict';
// Convert a trusted local native capture. No transport, save-plan or actuator integration.
const {diagnose}=require('./contract.cjs');
function normalize(registry,identity,native){
 if(native.schema!=='command-aircraft-native-observation'||![1,2].includes(native.version)||!native.selectedEntityPresent)throw Error('No selected native aircraft observation');
 if(native.resourceName!==`{${identity.guid}}${identity.path}`)throw Error('Native prefab identity mismatch');
 const mass=native.physicsAvailable&&Number.isFinite(native.physicsBodyMassKg)&&native.physicsBodyMassKg>0?native.physicsBodyMassKg:null;
 const result={schema:'command-aircraft-observation',version:native.version,environment:native.environment,identity,
  components:native.components,compartments:native.compartments,unavailable:[...native.unavailable,...(native.physicsAvailable&&mass===null?['Positive physics-body mass unavailable; no reference mass substituted']:[])],truncated:native.truncated,
  readings:{positionM:native.positionM,attitudeDeg:native.attitudeDeg,
   velocityMps:native.simulationAvailable?native.velocityMps:null,angularVelocityRadps:native.simulationAvailable?native.angularVelocityRadps:null,
   engineOn:native.simulationAvailable?native.engineOn:null,rotorRpm:native.simulationAvailable?native.rotorRpm:null,
   groundContact:native.simulationAvailable?native.groundContact:null,physicsBodyMassKg:mass,massSemantics:native.massSemantics}};
 if(native.version===2)Object.assign(result.readings,{bodyDynamic:native.physicsAvailable?native.bodyDynamic:null,bodyActive:native.physicsAvailable?native.bodyActive:null,centerOfMassLocalM:native.physicsAvailable?native.centerOfMassLocalM:null,worldTimeMs:native.worldTimeMs,originAboveTerrainM:native.originAboveTerrainM});
 return diagnose(registry,identity,result);
}
function normalizeSeries(registry,identity,frames){
 if(!Array.isArray(frames)||!frames.length||frames.length>16)throw Error('Bounded native sample series required');
 const reports=frames.map(frame=>normalize(registry,identity,frame));let since=null,previous=null,groundedStableSeconds=0;
 for(const report of reports){const r=report.observation?.readings;if(!r||report.status!=='observed-read-only'||report.observation.version!==2)throw Error('Series needs complete version2 read-only observations');const time=r.worldTimeMs;if(previous!==null&&(time<=previous||time-previous>500))throw Error('Non-monotonic or gapped native sample series');previous=time;
  const norm=v=>v&&Math.hypot(...v),stable=r.bodyDynamic===true&&r.groundContact===true&&r.velocityMps!==null&&r.angularVelocityRadps!==null&&norm(r.velocityMps)<0.15&&norm(r.angularVelocityRadps)<0.1;
  if(!stable){since=null;groundedStableSeconds=0;}else{if(since===null)since=time;groundedStableSeconds=(time-since)/1000;}
 }
 const last=reports.at(-1),resting=groundedStableSeconds>=2;
 return {schema:'command-aircraft-read-only-series',version:1,profileId:last.resolution.profile.id,sampleCount:reports.length,elapsedSeconds:(previous-reports[0].observation.readings.worldTimeMs)/1000,groundedStableSeconds,restingStateObserved:resting,restingOriginAboveTerrainM:resting?last.observation.readings.originAboveTerrainM:null,lastObservation:last,executable:false,calibration:null};
}
module.exports={normalize,normalizeSeries};
