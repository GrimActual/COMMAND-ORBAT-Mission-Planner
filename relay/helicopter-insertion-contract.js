/* Original experimental COMMAND contract. Not registered in the shipped relay. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CommandHelicopterContract=api;})(globalThis,function(){
'use strict';
const CAPABILITY = 'helicopter-insert-experimental-v1';
const PROFILE_CAPABILITY='helicopter-profile-v2';
const UNRESTRICTED_CAPABILITY='helicopter-unrestricted-routes-v1';
const ALTITUDE_CAPABILITY='helicopter-altitude-floor-v1';
const CREW_ONLY_CAPABILITY='helicopter-crew-only-v1';
const MI8_CAPABILITY='helicopter-mi8mt-experimental-v1';
const KIND = 'helicopter-insert';
const fields = Object.freeze(['version', 'requestId', 'kind', 'targetRequestId', 'unitId', 'vehicleRequestId', 'vehicleUnitId', 'worldX', 'worldZ', 'timeoutSeconds']);
function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || ![Object.prototype, null].includes(Object.getPrototypeOf(input)) || Reflect.ownKeys(input).length < fields.length || Reflect.ownKeys(input).length > fields.length+4 || Reflect.ownKeys(input).some(k=>!fields.includes(k)&&!['cruiseSpeedMps','waypoints','flightMode','crewOnly'].includes(k))) throw Error('Unsupported helicopter request fields');
  const request = {};
  for (const key of fields) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (!field || !('value' in field) || !field.enumerable) throw Error('Unsupported helicopter request fields');
    request[key] = field.value;
  }
  for(const name of ['cruiseSpeedMps','waypoints','flightMode','crewOnly'])if(Object.hasOwn(input,name)){const d=Object.getOwnPropertyDescriptor(input,name);if(!d||!('value'in d)||!d.enumerable)throw Error('Unsupported flight profile field');request[name]=d.value;}
  if(Object.hasOwn(request,'crewOnly')&&(request.version!==5||typeof request.crewOnly!=='boolean'))throw Error('Pilot-only flight requires version 5 and a boolean crewOnly flag');
  if(Object.hasOwn(request,'flightMode')&&(!['land','patrol','patrol-loop'].includes(request.flightMode)||!Object.hasOwn(request,'cruiseSpeedMps')||request.flightMode!=='land'&&!(request.waypoints?.length>=1)))throw Error('Patrol requires a reviewed profile and at least one route waypoint');
  if(Object.hasOwn(request,'cruiseSpeedMps')&&![4,8,12].includes(request.cruiseSpeedMps))throw Error('Choose cruise speed 4, 8 or 12 m/s');
  if(Object.hasOwn(request,'waypoints')){if(!Array.isArray(request.waypoints)||request.waypoints.length>16)throw Error('Up to 16 flight waypoints');request.waypoints=request.waypoints.map(p=>{if(!p||typeof p!=='object'||![Object.prototype,null].includes(Object.getPrototypeOf(p))||!['worldX|worldZ','minimumAGL|worldX|worldZ'].includes(Reflect.ownKeys(p).sort().join('|')))throw Error('Invalid flight waypoint');const x=Object.getOwnPropertyDescriptor(p,'worldX'),z=Object.getOwnPropertyDescriptor(p,'worldZ');if(!x||!z||!('value'in x)||!('value'in z)||!x.enumerable||!z.enumerable||![x.value,z.value].every(v=>Number.isFinite(v)&&v>=0&&v<=13500))throw Error('Invalid flight waypoint');const out={worldX:x.value,worldZ:z.value};if(Object.hasOwn(p,'minimumAGL')){const h=Object.getOwnPropertyDescriptor(p,'minimumAGL');if(!h||!('value'in h)||!h.enumerable||!Number.isFinite(h.value)||h.value<=0||h.value>19000||request.version!==5)throw Error('Invalid waypoint minimum clearance');out.minimumAGL=h.value;}return out;});}
  if (![2,5].includes(request.version) || request.kind !== KIND) throw Error('Unsupported experimental helicopter request');
  if(request.version===5&&!Object.hasOwn(request,'cruiseSpeedMps'))throw Error('Unrestricted routes require a reviewed flight profile');
  const key = (value, length) => typeof value === 'string' && new RegExp('^[A-Za-z0-9_-]{1,' + length + '}$').test(value);
  if (!['requestId', 'targetRequestId', 'vehicleRequestId'].every(name => key(request[name], 40)) || !['unitId', 'vehicleUnitId'].every(name => key(request[name], 64)) || [request.targetRequestId, request.vehicleRequestId].includes(request.requestId) || (request.crewOnly?request.targetRequestId!==request.vehicleRequestId||request.unitId!==request.vehicleUnitId:request.targetRequestId === request.vehicleRequestId && request.unitId === request.vehicleUnitId)) throw Error('Choose exact aircraft identity for pilot-only flight, otherwise separate passenger and aircraft identities');
  if (![request.worldX, request.worldZ].every(value => Number.isFinite(value) && value >= 0 && value <= 13500)) throw Error('Choose an Everon landing zone');
  if (request.timeoutSeconds !== (Object.hasOwn(request,'cruiseSpeedMps')?600:300)) throw Error('Flight request window must match the negotiated profile');
  return request;
}
function requireBindings(input, { capabilities = [], passengerGroup, aircraft, approvalMode } = {}) {
  const request = validate(input);
  if (!capabilities.includes(CAPABILITY)) throw Error('Connected bridge has not advertised the experimental flight adapter');
  if((Object.hasOwn(request,'cruiseSpeedMps')||Object.hasOwn(request,'waypoints'))&&!capabilities.includes(PROFILE_CAPABILITY))throw Error('Connected bridge does not support flight speed and routes');
  if(request.version===5&&!capabilities.includes(UNRESTRICTED_CAPABILITY))throw Error('Connected bridge does not support unrestricted routes');
  if(request.waypoints?.some(p=>Object.hasOwn(p,'minimumAGL'))&&!capabilities.includes(ALTITUDE_CAPABILITY))throw Error('Update bridge for optional waypoint heights');
  if(request.crewOnly&&!capabilities.includes(CREW_ONLY_CAPABILITY))throw Error('Connected bridge does not support pilot-only flight');
  if (approvalMode !== 'manual') throw Error('Experimental helicopter insertion requires manual host approval');
  for (const [binding, requestId, unitId] of (request.crewOnly?[[aircraft, request.vehicleRequestId, request.vehicleUnitId]]:[[passengerGroup, request.targetRequestId, request.unitId], [aircraft, request.vehicleRequestId, request.vehicleUnitId]])) {
    if (!binding || binding.requestId !== requestId || binding.unitId !== unitId || binding.phase !== 'executed' || binding.revoked || !['spawn', 'scenario-restore'].includes(binding.kind)) throw Error('Flight targets require current executed COMMAND-owned deployment identities');
  }
  return request;
}
function review(input) {
  const request = validate(input);
  return {
    title: 'Experimental helicopter insertion',
    passengerTarget: request.crewOnly?'Pilot only — no passengers':request.targetRequestId + ' / ' + request.unitId,
    aircraftTarget: request.vehicleRequestId + ' / ' + request.vehicleUnitId,
    landingZone: { worldX: request.worldX, worldZ: request.worldZ },
    notice: request.crewOnly?'Pilot only: exactly one seated AI pilot and no other occupants. Success requires observed grounded landing and the pilot retained. Human entry releases assistance.': 'Matching locally validated aircraft profile required. Four seated cargo passengers and an AI pilot. Operator must verify a clear, flat route and landing zone. Preflight clearance checks are not dynamic obstacle avoidance. Success requires observed landing and completed passenger exits. Airborne cancellation lands at this approved zone and retains passengers.'
  };
}
function progressLabel(phase) {
  const labels = { initializing: 'Preparing', seating: 'Checking occupants', spooling: 'Starting engine', 'hover-controller': 'Taking off', flying: 'Flying to landing zone', approaching: 'Approaching', descending: 'Landing', unloading: 'Unloading passengers' };
  if (typeof phase !== 'string') return 'Status unavailable';
  if (phase.startsWith('complete:')) return 'Landed; passengers unloaded';
  if (phase.startsWith('cancelled:')) return 'Cancelled; grounded with remaining passengers retained';
  if (phase.startsWith('handoff:')) return 'Human control; assistance released';
  if (phase.startsWith('failed:')) return 'Flight failed; inspect the reported reason';
  return Object.hasOwn(labels, phase) ? labels[phase] : 'Status unavailable';
}
function validateProgress(raw, expectedPassengers=4) {
 if(![0,4].includes(expectedPassengers))throw Error('Unsupported expected passenger count');
 const names=['phase','elapsed','landed','grounded','unloaded','pilotAboard','passengersAboard','worldX','worldY','worldZ'];
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Reflect.ownKeys(raw).length!==names.length)throw Error('Invalid helicopter progress');
 const p={};for(const name of names){const d=Object.getOwnPropertyDescriptor(raw,name);if(!d||!('value'in d)||!d.enumerable)throw Error('Invalid helicopter progress');p[name]=d.value;}
 if(typeof p.phase!=='string'||p.phase.length>160||!(['initializing','seating','spooling','hover-controller','flying','approaching','descending','unloading'].includes(p.phase)||/^(complete|cancelled|failed|handoff):[ A-Za-z0-9;.,_-]+$/.test(p.phase)))throw Error('Invalid flight phase');
 if(!Number.isFinite(p.elapsed)||p.elapsed<0||p.elapsed>Number.MAX_SAFE_INTEGER||!['landed','grounded','pilotAboard'].every(n=>typeof p[n]==='boolean')||!['unloaded','passengersAboard'].every(n=>Number.isInteger(p[n])&&p[n]>=0&&p[n]<=expectedPassengers)||p.unloaded+p.passengersAboard>expectedPassengers||![p.worldX,p.worldY,p.worldZ].every(Number.isFinite)||p.worldX<0||p.worldX>13500||p.worldZ<0||p.worldZ>13500||p.worldY< -1000||p.worldY>20000)throw Error('Invalid measured flight progress');
 if(p.phase.startsWith('complete:')&&(!p.landed||!p.grounded||!p.pilotAboard||p.unloaded!==expectedPassengers||p.passengersAboard!==0))throw Error('Flight completion requires observed landing, the expected passenger exits and retained pilot');
 if(p.phase.startsWith('cancelled:')&&!p.grounded)throw Error('Airborne cancellation is not complete until grounded');
 return p;
}
return { CAPABILITY, CREW_ONLY_CAPABILITY, ALTITUDE_CAPABILITY, PROFILE_CAPABILITY, MI8_CAPABILITY, UNRESTRICTED_CAPABILITY, KIND, validate, requireBindings, review, progressLabel, validateProgress };
});
