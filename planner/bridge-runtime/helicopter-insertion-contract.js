/* Original experimental COMMAND contract. Not registered in the shipped relay. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CommandHelicopterContract=api;})(globalThis,function(){
'use strict';
const CAPABILITY = 'helicopter-insert-experimental-v1';
const KIND = 'helicopter-insert';
const fields = Object.freeze(['version', 'requestId', 'kind', 'targetRequestId', 'unitId', 'vehicleRequestId', 'vehicleUnitId', 'worldX', 'worldZ', 'timeoutSeconds']);
function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || ![Object.prototype, null].includes(Object.getPrototypeOf(input)) || Reflect.ownKeys(input).length !== fields.length) throw Error('Unsupported helicopter request fields');
  const request = {};
  for (const key of fields) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (!field || !('value' in field) || !field.enumerable) throw Error('Unsupported helicopter request fields');
    request[key] = field.value;
  }
  if (request.version !== 2 || request.kind !== KIND) throw Error('Unsupported experimental helicopter request');
  const key = (value, length) => typeof value === 'string' && new RegExp('^[A-Za-z0-9_-]{1,' + length + '}$').test(value);
  if (!['requestId', 'targetRequestId', 'vehicleRequestId'].every(name => key(request[name], 40)) || !['unitId', 'vehicleUnitId'].every(name => key(request[name], 64)) || [request.targetRequestId, request.vehicleRequestId].includes(request.requestId) || request.targetRequestId === request.vehicleRequestId && request.unitId === request.vehicleUnitId) throw Error('Choose exact separate passenger and aircraft identities');
  if (![request.worldX, request.worldZ].every(value => Number.isFinite(value) && value >= 0 && value <= 13500)) throw Error('Choose an Everon landing zone');
  if (request.timeoutSeconds !== 300) throw Error('Experimental flight uses the fixed five-minute request window');
  return request;
}
function requireBindings(input, { capabilities = [], passengerGroup, aircraft, approvalMode } = {}) {
  const request = validate(input);
  if (!capabilities.includes(CAPABILITY)) throw Error('Connected bridge has not advertised the experimental flight adapter');
  if (approvalMode !== 'manual') throw Error('Experimental helicopter insertion requires manual host approval');
  for (const [binding, requestId, unitId] of [[passengerGroup, request.targetRequestId, request.unitId], [aircraft, request.vehicleRequestId, request.vehicleUnitId]]) {
    if (!binding || binding.requestId !== requestId || binding.unitId !== unitId || binding.phase !== 'executed' || binding.revoked || !['spawn', 'scenario-restore'].includes(binding.kind)) throw Error('Flight targets require current executed COMMAND-owned deployment identities');
  }
  return request;
}
function review(input) {
  const request = validate(input);
  return {
    title: 'Experimental helicopter insertion',
    passengerTarget: request.targetRequestId + ' / ' + request.unitId,
    aircraftTarget: request.vehicleRequestId + ' / ' + request.vehicleUnitId,
    landingZone: { worldX: request.worldX, worldZ: request.worldZ },
    notice: 'Vanilla UH-1H only. Four seated cargo passengers and an AI pilot. Operator must verify a clear, flat 20–100 m route and landing zone. No obstacle avoidance. Success requires observed landing and completed passenger exits. Airborne cancellation lands at this approved zone and retains passengers.'
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
function validateProgress(raw) {
 const names=['phase','elapsed','landed','grounded','unloaded','pilotAboard','passengersAboard','worldX','worldY','worldZ'];
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Reflect.ownKeys(raw).length!==names.length)throw Error('Invalid helicopter progress');
 const p={};for(const name of names){const d=Object.getOwnPropertyDescriptor(raw,name);if(!d||!('value'in d)||!d.enumerable)throw Error('Invalid helicopter progress');p[name]=d.value;}
 if(typeof p.phase!=='string'||p.phase.length>160||!(['initializing','seating','spooling','hover-controller','flying','approaching','descending','unloading'].includes(p.phase)||/^(complete|cancelled|failed|handoff):[ A-Za-z0-9;.,_-]+$/.test(p.phase)))throw Error('Invalid flight phase');
 if(!Number.isFinite(p.elapsed)||p.elapsed<0||p.elapsed>600||!['landed','grounded','pilotAboard'].every(n=>typeof p[n]==='boolean')||!['unloaded','passengersAboard'].every(n=>Number.isInteger(p[n])&&p[n]>=0&&p[n]<=4)||p.unloaded+p.passengersAboard>4||![p.worldX,p.worldY,p.worldZ].every(Number.isFinite)||p.worldX<0||p.worldX>13500||p.worldZ<0||p.worldZ>13500||p.worldY< -1000||p.worldY>20000)throw Error('Invalid measured flight progress');
 if(p.phase.startsWith('complete:')&&(!p.landed||!p.grounded||!p.pilotAboard||p.unloaded!==4||p.passengersAboard!==0))throw Error('Flight completion requires observed landing, four exits and retained pilot');
 if(p.phase.startsWith('cancelled:')&&!p.grounded)throw Error('Airborne cancellation is not complete until grounded');
 return p;
}
return { CAPABILITY, KIND, validate, requireBindings, review, progressLabel, validateProgress };
});
