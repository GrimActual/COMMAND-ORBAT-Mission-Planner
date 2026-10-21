/* Original COMMAND fleet mission chooser. Planning imports only; no game commands. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.CommandAircraftProfileMissions=api;api.mount(root);}})(globalThis,function(){
'use strict';
const templates={UH1H:'missions/COMMAND-Huey-Test.command-mission.json',Mi8MT:'missions/COMMAND-Mi8MT-Test.command-mission.json'};
const H60_RESOURCES=new Set(["{48F288F5BFF10D8B}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_armed.et", "{847A4C8E73A7C186}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_Medical.et", "{1529FD2C6A8162A1}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_Pylon_Quad_Hydra.et", "{47F2921E0DACA300}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_Supply.et"]);
const H60_ADDONS=['60ED3CC6E7E40221','64EE818E08AFCF94','6276E6E3CC97A22B','629B2BA37EFFD577'];
function templateKey(entry){
 if(entry?.runtimeAvailable!==true||typeof entry.resource!=='string'||Object.hasOwn(entry,'crewOnly')&&typeof entry.crewOnly!=='boolean')return null;
 const h60=entry.addonId==='60ED3CC6E7E40221'&&H60_RESOURCES.has(entry.resource);
 const match=entry.addonId==='58D0FB3206B6F859'&&/^\{([A-F0-9]{16})\}(Prefabs\/Vehicles\/Helicopters\/(UH1H|Mi8MT)\/[^/]+\.et)$/.exec(entry.resource);
 if(!h60&&!match)return null;
 if(h60&&(entry.testCrewFaction!=='US'||entry.resource.includes('_Supply.et')&&entry.crewOnly!==true))return null;
 const civilian=!!match&&/_civ(?:_|\.)/i.test(match[2]);
 const faction=entry.testCrewFaction||(civilian?null:match?.[3]==='Mi8MT'?'USSR':'US');
 if(!['US','USSR','CIV'].includes(faction)||faction==='CIV'&&entry.crewOnly!==true||civilian&&entry.testCrewFaction!=='CIV')return null;
 return faction==='USSR'?'Mi8MT':'UH1H';
}
function available(catalog){if(catalog?.schema!=='command-aircraft-support-catalog'||!Array.isArray(catalog.entries))throw Error('Aircraft catalog unavailable');const ids=new Set();return catalog.entries.filter(entry=>{if(!entry||typeof entry.id!=='string'||ids.has(entry.id))throw Error('Invalid aircraft catalog identity');ids.add(entry.id);return !!templateKey(entry);});}
async function build(entry,raw,validate){
 const key=templateKey(entry);if(!key)throw Error('This aircraft needs a separate crew or passenger template');
 if(typeof validate!=='function')throw Error('Mission validator unavailable');
 const doc=structuredClone(raw),vehicleId=key==='UH1H'?'HUEY':'MI8',unit=doc.plan?.orderOfBattle?.find(u=>u.id===vehicleId);
 if(!unit||unit.assetCatalogItem?.assetKind!=='helicopter')throw Error('Aircraft mission template unavailable');
 const oldAssetId=unit.asset,oldRef=unit.assetCatalogItem.resourceReference;
 const match=/^\{([A-F0-9]{16})\}(.+)$/.exec(entry.resource),guid=match[1],resourcePath=match[2];
 const item=structuredClone(unit.assetCatalogItem),name=String(entry.label||guid),assetId='prefab-'+entry.addonId+'-'+guid;
 item.id=assetId;item.name=name;item.resourceReference={...item.resourceReference,id:'aircraft_'+guid,addonId:entry.addonId,path:resourcePath,guid,observation:'metadata-only',provenance:{method:'manual',source:'Exact aircraft interoperability reference for reviewed COMMAND test mission; no asset content supplied.',license:null},dependencies:[]};
 doc.plan.operation.name='COMMAND '+name+' FLIGHT CHECK';
 unit.asset=assetId;unit.assetName=name;unit.name=vehicleId+' - '+name;unit.assetCatalogItem=structuredClone(item);
 const catalogIndex=doc.catalog.assets.findIndex(a=>a.id===oldAssetId);if(catalogIndex<0)throw Error('Aircraft catalog template entry unavailable');doc.catalog.assets[catalogIndex]=item;
 const resourceIndex=doc.resourceIndex.resources.findIndex(r=>r.id===oldRef.id);if(resourceIndex<0)throw Error('Aircraft resource template entry unavailable');doc.resourceIndex.resources[resourceIndex]=structuredClone(item.resourceReference);
 if(H60_RESOURCES.has(entry.resource)){
  const existing=new Set(doc.resourceIndex.addons.map(a=>a.id));for(const addonId of H60_ADDONS)if(!existing.has(addonId))doc.resourceIndex.addons.push({id:addonId,name:addonId==='60ED3CC6E7E40221'?'Sikorsky H60 Project':'Required aircraft dependency',version:null,dependencies:addonId==='60ED3CC6E7E40221'?H60_ADDONS.slice(1):[]});
 }
 if(entry.testCrewFaction==='CIV'){
  const pilot=doc.plan.orderOfBattle.find(u=>u.id==='PILOT');if(!pilot)throw Error('Pilot mission template unavailable');
  const oldPilotAsset=pilot.asset,oldPilotRef=pilot.assetCatalogItem.resourceReference.id,newPilot=structuredClone(pilot.assetCatalogItem);
  newPilot.id='prefab-58D0FB3206B6F859-E024A74F8A4BC644';newPilot.name='Civilian pilot test character';newPilot.resourceReference={...newPilot.resourceReference,id:'vanilla_E024A74F8A4BC644',guid:'E024A74F8A4BC644',path:'Prefabs/Characters/Factions/CIV/Businessman/Character_CIV_Businessman_1.et',provenance:{method:'manual',source:'Exact civilian character interoperability reference. Pilot compatibility requires the matching native profile test.',license:null}};
  pilot.asset=newPilot.id;pilot.assetName=newPilot.name;pilot.assetCatalogItem=structuredClone(newPilot);pilot.side='neutral';unit.side='neutral';
  doc.catalog.assets[doc.catalog.assets.findIndex(a=>a.id===oldPilotAsset)]=newPilot;doc.resourceIndex.resources[doc.resourceIndex.resources.findIndex(r=>r.id===oldPilotRef)]=structuredClone(newPilot.resourceReference);
 }
 if(entry.crewOnly===true){
  doc.plan.orderOfBattle=doc.plan.orderOfBattle.filter(u=>u.id!=='TEAM');
  for(const stage of doc.deployments){stage.unitIds=stage.unitIds.filter(id=>id!=='TEAM');if(stage.occupied)stage.occupied.assignments=stage.occupied.assignments.filter(a=>a.unitId!=='TEAM');stage.name=String(entry.label||'Aircraft')+' + pilot';}
  const usedAssets=new Set(doc.plan.orderOfBattle.map(u=>u.asset));doc.catalog.assets=doc.catalog.assets.filter(a=>usedAssets.has(a.id));
  const usedResources=new Set(doc.catalog.assets.map(a=>a.resourceReference?.id));doc.resourceIndex.resources=doc.resourceIndex.resources.filter(r=>usedResources.has(r.id));
  doc.plan.operation.briefing='Pilot-only test mission. Importing changes the plan only. Inspect the departure and LZ; review and approve the occupied aircraft plus pilot deployment. Confirm exactly one AI pilot and no other occupants are seated. Open helicopter flight controls, refresh targets and explicitly enable “Pilot only — no passengers”. Choose the aircraft, route and final LZ, then review and approve flight separately. No flight or game order runs on import. The current exact profile must be verified; armed appearance does not establish weapon control. Clearance, human takeover and multiplayer need separate acceptance.';
 }
 return validate(doc);
}
function mount(win){
 const document=win.document,container=document?.getElementById('missionPackage');
 if(!container||!win.CommandMissionPackages||!win.CommandMissionPackage)return;
 const t=s=>win.PlannerI18n?.t(s)||s,box=document.createElement('div'),label=document.createElement('label'),select=document.createElement('select'),button=document.createElement('button'),notice=document.createElement('p');
 box.id='aircraftProfileMissions';select.id='aircraftProfileMission';label.append(document.createTextNode(t('Helicopter test mission')),select);button.type='button';button.textContent=t('Open helicopter test mission');button.disabled=true;notice.setAttribute('role','status');box.append(label,button,notice);(container.querySelector('#missionUtilities .actions')||container.querySelector('.actions'))?.after(box);
 let entries=[];
 const load=async()=>{try{const response=await win.fetch('aircraft-support-catalog.json');if(!response.ok)throw Error('Aircraft catalog unavailable');entries=available(await response.json());for(const entry of entries)select.add(new Option(entry.label,entry.id));button.disabled=!entries.length;if(!entries.length)notice.textContent=t('No additional verified aircraft test missions are available.');}catch(error){notice.textContent=t(error.message);}};
 const workspaceBinding=()=>win.EveronPlanner?.workspaceRevision?.()??JSON.stringify(win.EveronPlanner?.snapshot?.()||null);
 button.onclick=async()=>{const binding=workspaceBinding();button.disabled=true;try{const entry=entries.find(e=>e.id===select.value);if(!entry)throw Error('Choose a verified aircraft');const response=await win.fetch(templates[templateKey(entry)]);if(!response.ok)throw Error('Aircraft mission template unavailable');const mission=await build(entry,await response.json(),win.CommandMissionPackage.validate);if(binding!==workspaceBinding()||select.value!==entry.id){notice.textContent=t('Mission changed while loading. Open the mission again if needed.');return;}if(await win.CommandMissionPackages.previewImport(mission)===false)return;notice.textContent=t('Review this mission import. Nothing has spawned in game.');}catch(error){notice.textContent=t(error.message);}finally{button.disabled=!entries.length;}};
 load();
}
return{available,templateKey,build,mount};
});
