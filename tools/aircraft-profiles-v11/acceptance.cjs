'use strict';
// Original local evidence validation. Does not deserialize HTTP/plans or authorize a lease.
const ID={addonId:'58D0FB3206B6F859',guid:'DF5CCB7C0FF049F4',path:'Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_unarmed_transport.et'};
const REQUIRED_CHECKS=Object.freeze({
 inspect:['exactNativeIdentity','validDynamicSimulation','currentMassAndCom'],
 crewSeating:['ownedMembers','exactControllingPilot','noHumanOccupant'],
 passengerSeating:['ownedMembers','fourCargoOccupants','noReservations'],
 poweredGroundStartup:['soleForceWriter','groundContact','stationaryBeforeRelease','boundedStartupDrift','bothRotorsSettled'],
 controlledLift:['soleForceWriter','boundedLift','occupantsRetained'],
 hover:['sustainedStableHover','heightAndMotionWithinTestedLimits'],
 pointFlight:['reviewedRouteCompleted','headingGateRespected','arrivalErrorAndSpeedWithinTestedLimits'],
 landing:['sustainedContact','motionWithinTestedLimits','restingGeometryObserved'],
 unload:['fourDesignatedPassengersExited','pilotRetained','stableDuringExit'],
 cancellation:['airborneCancellationRequested','approvedLandingReached','passengersRetained','assistanceReleased'],
 humanHandoff:['humanTakeoverObserved','assistanceReleased','noFurtherForceWrites'],
 multiplayer:['actualMultiplayerSession','remoteObservationVerified']
});
const FLIGHT=Object.freeze(Object.keys(REQUIRED_CHECKS).filter(k=>k!=='multiplayer'));
const NATIVE_CALIBRATION=Object.freeze(FLIGHT.filter(k=>k!=='humanHandoff'));
for(const checks of Object.values(REQUIRED_CHECKS))Object.freeze(checks);
const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
function json(value,depth=0,budget={n:0}){
 if(++budget.n>20000||depth>16)throw Error('Evidence exceeds bounds');
 if(value===null||typeof value==='boolean')return value;
 if(typeof value==='string'){if(value.length>4096)throw Error('String exceeds bounds');return value;}
 if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Non-finite evidence');return value;}
 if(typeof value!=='object')throw Error('JSON evidence only');
 const proto=Object.getPrototypeOf(value);if(!Array.isArray(value)&&proto!==Object.prototype&&proto!==null)throw Error('Plain JSON evidence required');
 const out=Array.isArray(value)?[]:Object.create(null);
 if(Array.isArray(value)&&value.length>512)throw Error('Array exceeds bounds');
 for(const [key,d]of Object.entries(Object.getOwnPropertyDescriptors(value))){
  if(key==='length'&&Array.isArray(value))continue;
  if(!('value'in d))throw Error('Evidence accessors forbidden');
  if(['__proto__','prototype','constructor'].includes(key))throw Error('Unsafe evidence key');
  out[key]=json(d.value,depth+1,budget);
 }
 return out;
}
const exactIdentity=x=>x&&Object.keys(ID).every(k=>x[k]===ID[k]);
function environment(e){
 if(!e||e.kind!=='installed-metadata'||typeof e.gameBuild!=='string'||!e.gameBuild.trim()||!hash(e.controllerSourceSha256)||!hash(e.installedSnapshotSha256)||!Array.isArray(e.addons)||e.addons.length<2)throw Error('Complete installed environment required');
 const ids=new Set();
 const addons=e.addons.map(a=>{
  if(!a||!/^[0-9A-F]{16}$/.test(a.id)||typeof a.version!=='string'||!a.version.trim()||!hash(a.metadataSha256)||ids.has(a.id))throw Error('Exact dependency versions/fingerprints required');ids.add(a.id);
  return {id:a.id,version:a.version,metadataSha256:a.metadataSha256};
 }).sort((a,b)=>a.id.localeCompare(b.id));
 for(const id of ['58D0FB3206B6F859','5614BBCCBB55ED1C'])if(!ids.has(id))throw Error('Base/core dependency missing');
 return JSON.stringify({kind:e.kind,gameBuild:e.gameBuild,controllerSourceSha256:e.controllerSourceSha256,installedSnapshotSha256:e.installedSnapshotSha256,addons});
}
function evaluate(candidateInput,currentInput,receiptInputs){
 const candidate=json(candidateInput),current=json(currentInput),receipts=json(receiptInputs);
 const result={schema:'command-mi8-acceptance-result',version:2,profileId:'command-mi8mt-transport',capabilities:{},nativeCalibrationAccepted:false,humanHandoffAccepted:false,acceptedForReviewedFlight:false,multiplayerAccepted:false,fullOperationalAccepted:false,executable:false,reasons:[]};
 if(candidate.schema!=='command-mi8-acceptance-candidate'||candidate.version!==1||candidate.profileId!==result.profileId||!exactIdentity(candidate.identity)){result.reasons.push('Exact supported Mi-8MT transport candidate required');return result;}
 if(!candidate.testedLoad||candidate.testedLoad.pilots!==1||candidate.testedLoad.cargo!==4){result.reasons.push('Only the exact one-pilot/four-cargo tested load is supported');return result;}
 let expected;
 try{expected=environment(current);if(environment(candidate.environment)!==expected)throw Error('Candidate environment changed');}catch(e){result.reasons.push(e.message);return result;}
 if(current.installedSnapshotVerified!==true){result.reasons.push('Current installed snapshot must be independently verified by owning harness');return result;}
 if(!candidate.calibration||candidate.calibration.status!=='native-measured'||!hash(candidate.calibration.parametersSha256)||!hash(current.calibrationParametersSha256)||candidate.calibration.parametersSha256!==current.calibrationParametersSha256){result.reasons.push('Exact native-measured calibration parameters required');return result;}
 if(!Array.isArray(receipts)||receipts.length>64)throw Error('Bounded capability receipts required');
 const seen=new Set();
 for(const receipt of receipts){
  if(typeof receipt.evidenceId!=='string'||!receipt.evidenceId||seen.has(receipt.evidenceId))throw Error('Unique evidence IDs required');seen.add(receipt.evidenceId);
 }
 for(const [capability,checks]of Object.entries(REQUIRED_CHECKS)){
  const matching=receipts.filter(r=>r.capability===capability);let accepted=false;
  for(const r of matching){
   let same=false;try{same=environment(r.environment)===expected;}catch{}
   if(r.schema!=='command-aircraft-capability-evidence'||r.version!==1||r.profileId!==result.profileId||!exactIdentity(r.identity)||!same||r.outcome!=='passed'||r.evidenceKind!==(capability==='multiplayer'?'native-multiplayer':'native-dedicated')||!hash(r.artifactSha256)||r.artifactVerifiedByHarness!==true||r.calibrationParametersSha256!==candidate.calibration.parametersSha256||r.testedLoad?.pilots!==1||r.testedLoad?.cargo!==4)continue;
   if(checks.every(k=>r.checks?.[k]===true)){accepted=true;break;}
  }
  result.capabilities[capability]=accepted?'accepted-native-evidence':'unverified';
 }
 result.acceptedForReviewedFlight=FLIGHT.every(k=>result.capabilities[k]==='accepted-native-evidence');
 result.nativeCalibrationAccepted=NATIVE_CALIBRATION.every(k=>result.capabilities[k]==='accepted-native-evidence');
 result.humanHandoffAccepted=result.capabilities.humanHandoff==='accepted-native-evidence';
 result.multiplayerAccepted=result.capabilities.multiplayer==='accepted-native-evidence';
 result.fullOperationalAccepted=result.acceptedForReviewedFlight&&result.multiplayerAccepted;
 if(!result.acceptedForReviewedFlight)result.reasons.push('Missing native evidence: '+FLIGHT.filter(k=>result.capabilities[k]!=='accepted-native-evidence').join(', '));
 result.scope='Evidence decision only. Owning HostGM/dispatcher must independently authorize each lease and enforce tested envelope. Hash declarations are not authenticated proof.';
 return result;
}
module.exports={evaluate,REQUIRED_CHECKS,FLIGHT,NATIVE_CALIBRATION,IDENTITY:Object.freeze(ID)};
