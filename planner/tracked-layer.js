"use strict";
window.PlannerTrackedLayer={name(p){return p.kind==='ai'?'AI':p.label||p.id;},attach(map){
 const layer=L.layerGroup().addTo(map),markers=new Map();let pending=[],frame=null;
 const t=s=>window.PlannerI18n?.t(s)||s;
 function side(f){const key=String(f||'').toUpperCase();return ({US:'BLUFOR',US_ARMY:'BLUFOR',BLUFOR:'BLUFOR',USSR:'OPFOR',RU:'OPFOR',RUSSIA:'OPFOR',OPFOR:'OPFOR',FIA:'INDFOR',INDFOR:'INDFOR',CIV:'CIVILIAN',CIVILIAN:'CIVILIAN'})[key]||'UNKNOWN';}
 function icon(p){const s=side(p.faction),color=({BLUFOR:'#62b8ff',OPFOR:'#ff6868',INDFOR:'#64cf87',CIVILIAN:'#c69aff',UNKNOWN:'#ffd166'})[s];
  const shapes={BLUFOR:'M2 6H28V24H2Z',OPFOR:'M15 1L29 15L15 29L1 15Z',INDFOR:'M4 4H26V26H4Z',CIVILIAN:'M15 2A13 13 0 1 0 15 28A13 13 0 1 0 15 2',UNKNOWN:'M15 2L28 9V21L15 28L2 21V9Z'};
  const glyph=p.kind==='vehicle'?'<path d="M8 12H22V19H8Z M10 19V22 M20 19V22"/>':p.kind==='player'?'<circle cx="15" cy="10" r="2.5"/><path d="M15 13V22 M10 16H20"/>':p.kind==='ai'?'<path d="M8 9L22 21 M22 9L8 21"/>':'<path d="M11 11L15 8L19 11L15 16V19 M15 22V23"/>';
  return L.divIcon({className:'tracked-side-icon',iconSize:[30,30],iconAnchor:[15,15],html:'<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="'+shapes[s]+'" fill="'+color+'" stroke="#101b20" stroke-width="2"/><g fill="none" stroke="#101b20" stroke-width="2">'+glyph+'</g></svg>'});
 }
 function content(text){if(typeof document==='undefined')return text;const el=document.createElement('span');el.textContent=text;el.style.whiteSpace='pre-line';return el;}
 function draw(){frame=null;const present=new Set();for(const p of pending){present.add(p.id);const grid=[p.x,p.z].map(v=>String(Math.floor(v/100)).padStart(3,'0')).join('-');const identity=window.PlannerTrackedLayer.name(p);const kind=t(({player:'Player',ai:'AI infantry',vehicle:'Vehicle',object:'Object'})[p.kind]||'Unidentified');const label=identity+'\n'+kind+' · '+(p.faction||t('Unknown faction'))+' · '+grid;const style=side(p.faction)+'/'+(p.kind||'unknown');let old=markers.get(p.id);
  if(!old){const marker=(L.marker&&L.divIcon?L.marker([p.z+50,p.x+50],{icon:icon(p),interactive:true}):L.circleMarker([p.z+50,p.x+50],{radius:7,color:'#ffd166',weight:2,fillOpacity:.65,interactive:false})).addTo(layer).bindTooltip(content(identity),{permanent:true,direction:'top',offset:[0,-12],className:'live-bridge-label'});if(marker.bindPopup)marker.bindPopup(content(label));if(marker.on)marker.on('click',()=>window.dispatchEvent(new CustomEvent('live-entity-selected',{detail:{id:p.id}})));old={marker,x:p.x,z:p.z,label,style};markers.set(p.id,old);}
  else{if(old.x!==p.x||old.z!==p.z)old.marker.setLatLng([p.z+50,p.x+50]);if(old.label!==label){old.marker.setTooltipContent(content(identity));if(old.marker.setPopupContent)old.marker.setPopupContent(content(label));}if(old.style!==style&&old.marker.setIcon)old.marker.setIcon(icon(p));old.x=p.x;old.z=p.z;old.label=label;old.style=style;}
 }for(const [id,old]of markers)if(!present.has(id)){layer.removeLayer(old.marker);markers.delete(id);}}
 const schedule=()=>{if(frame===null)frame=requestAnimationFrame(draw);};
 window.addEventListener('local-bridge-state',e=>{if(!Object.hasOwn(e.detail||{},'entities')&&!Object.hasOwn(e.detail||{},'point'))return;pending=Array.isArray(e.detail.entities)?e.detail.entities.map(p=>({...p})):[];schedule();});
 window.addEventListener('planner-preferences-changed',schedule);
 window.addEventListener('local-bridge-fit',()=>{if(pending.length)map.fitBounds(pending.map(p=>[p.z+50,p.x+50]),{padding:[30,30],maxZoom:3,animate:false});});
 window.PlannerTrackedView={count:()=>markers.size};
}};
