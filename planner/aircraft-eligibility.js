/* Catalog/setup hints only. Native approval and aircraft validation remain authoritative. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./aircraft-profile-missions'));else root.CommandAircraftEligibility=factory(null);})(globalThis,function(nodeMissions){
 'use strict';let entries=[],pending=null,loaded=false;
 function knownProfile(unit,catalog=entries){const source=unit?.commandSubmission;if(source?.source!=='this-desktop-submission'||typeof source.resourceName!=='string')return null;return catalog.find(e=>e.runtimeAvailable===true&&e.resource.toLowerCase()===source.resourceName.toLowerCase())||null;}
 function seatRole(group,id){const roles=new Set((group?.occupied?.assignments||[]).filter(a=>String(a.unitId)===String(id)).map(a=>a.role));return roles.size===1?[...roles][0]:null;}
 function cargoFor(aircraft,candidates){return candidates.filter(u=>u.requestId===aircraft.requestId&&String(u.occupiedVehicleId)===String(aircraft.unitId)&&u.seatRole==='cargo');}
 function install(raw){entries=(nodeMissions||globalThis.CommandAircraftProfileMissions).available(raw);loaded=true;return entries.slice();}
 async function load(){if(pending)return pending;pending=fetch('aircraft-support-catalog.json').then(r=>{if(!r.ok)throw Error('Aircraft catalog unavailable');return r.json();}).then(install).catch(e=>{pending=null;throw e;});return pending;}
 return{knownProfile,seatRole,cargoFor,install,load,get ready(){return loaded;}};
});
