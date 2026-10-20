/* Local, paged catalog browser. Classification hints do not change asset provenance. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CompanionAssetBrowser=api;})(globalThis,function(){
'use strict';
const categories={all:'All asset types',troops:'Troops',vehicles:'Vehicles',groups:'Groups',armor:'Armoured vehicles',mechanized:'APCs / IFVs',motorized:'Light vehicles',rotary:'Helicopters',fixed:'Aircraft',logistics:'Trucks / logistics vehicles',naval:'Boats / naval vehicles',support:'Support vehicles',weapons:'Weapons',equipment:'Equipment',structures:'Structures',props:'Props',vehicleparts:'Vehicle parts / components',wrecks:'Wrecks / damaged objects',templates:'Base templates / helpers',other:'Other / unclassified'};
const fold=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const aliases={troops:'infantry infantryman soldier troops soldat infanterie fantassin',armor:'armor armour armored armoured tank panzer char',mechanized:'apc ifv mechanized mechanised transport',motorized:'light vehicle car voiture fahrzeug',rotary:'helicopter rotary helo helicoptere hubschrauber',fixed:'aircraft plane avion flugzeug',logistics:'truck logistics supply camion logistique lastwagen',naval:'boat naval ship bateau boot schiff',support:'support medical repair fuel soutien unterstuetzung',groups:'squad group team groupe gruppe',weapons:'weapon gun arme waffe',equipment:'equipment gear equipement ausruestung'};

function catalogFaction(path){
 const explicit=path.match(/\/Factions\/([^/]+)/i)?.[1];
 const known={US:'BLUFOR',US_ARMY:'BLUFOR',BLUFOR:'BLUFOR',USSR:'OPFOR',RU:'OPFOR',RUSSIA:'OPFOR',RUSSIAN:'OPFOR',OPFOR:'OPFOR',FIA:'INDFOR',INDFOR:'INDFOR',CIV:'CIVILIAN',CIVILIAN:'CIVILIAN'};
 if(explicit)return {key:known[explicit.toUpperCase()]||explicit,reason:'folder'};
 // Explicit variant affiliation takes priority over the vehicle's country of origin.
 const file=path.split('/').pop()?.replace(/\.et$/i,'')||'';
 const suffix=file.match(/(?:^|_)(FIA|CIV|CIVILIAN|USSR|US|RU|BLUFOR|OPFOR|INDFOR)(?:_|$)/i)?.[1];
 if(suffix)return {key:known[suffix.toUpperCase()],reason:'variant'};
 const model=path.match(/\/Vehicles\/[^/]+\/([^/]+)/i)?.[1]||'';
 if(/^(?:M998|M1025|M151A2?|M923A1?|M939|M113A\d*|M1A1|UH1H|UH60|LAV25|M2A2)(?:_|$)/i.test(model))return {key:'BLUFOR',reason:'model-origin'};
 if(/^(?:BTR70|BTR80|BMP\d*|BRDM2|UAZ469|UAZ452|Ural4320|Ural375|Mi8MT|Mi8|Mi24|T72|T55)(?:_|$)/i.test(model))return {key:'OPFOR',reason:'model-origin'};
 return {key:'unknown',reason:'unknown'};
}

function describe(a){
 const path=String(a.resourceReference?.path||''),category=fold(a.category),hint=fold([a.assetKind,a.vehicleType,a.type].filter(Boolean).join(' '));let kind='other';
 // Prefab folders identify the entity family more reliably than a vehicle/weapon name.
 if(/(?:^|\/)Groups\//i.test(path)||/\bgroups?\b/.test(category))kind='groups';
 else if(/(?:^|\/)Characters\//i.test(path)||/\b(characters?|infantry|soldiers?|troops?)\b/.test(category)||/\b(infantry|soldier|troop)\b/.test(hint))kind='troops';
 else if(/(?:^|\/)Vehicles\//i.test(path)||/\bvehicles?\b/.test(category)||/\b(tank|apc|truck|boat|helicopter|aircraft|lightvehicle)\b/.test(hint))kind='vehicles';
 else if(/(?:^|\/)Weapons\//i.test(path)||/\bweapons?\b/.test(category))kind='weapons';
 else if(/(?:^|\/)Items\//i.test(path)||/\b(items?|equipment)\b/.test(category))kind='equipment';
 else if(/(?:^|\/)Structures\//i.test(path)||/\bstructures?\b/.test(category))kind='structures';
 else if(/(?:^|\/)Props\//i.test(path)||/\bprops?\b/.test(category))kind='props';
 // Technical entries take precedence over broad folder and imported icon hints.
 const segments=path.replace(/\\/g,'/');
 const vehicleFolder=/(?:^|\/)Vehicles\//i.test(segments);
 const part=vehicleFolder&&(/\/(?:VehParts|Parts|Components|Lights|Wheels|Dbr)\//i.test(segments)||/(?:^|[_/])(?:DestructibleVehicleGlass|VehicleLight|VehicleEmissiveSurface|Dbr|Aircraft_hardpoint)(?:[_/.]|$)/i.test(segments)||/\/Dst\//i.test(segments));
 const wreck=/(?:^|[\/ _])(?:wreck\w*|destroyed|damaged)(?:[\/ _.]|$)/i.test(segments);
 const template=/(?:^|[\/ _])(?:base(?:body)?|bases|helper\w*|template\w*)(?:[\/ _.]|$)/i.test(segments)||/\/Vehicles\/Core\//i.test(segments);
 if(/(?:^|\/)Props\//i.test(segments))kind='props';else if(/(?:^|\/)Structures\//i.test(segments))kind='structures';else if(part)kind='vehicleparts';else if(wreck)kind='wrecks';else if(template)kind='templates';
 const basename=path.split('/').pop()?.replace(/\.et$/i,'');
 const title=basename?basename.replace(/^(?:Character|Vehicle|Group|Weapon|Item)_/i,'').replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2'):String(a.name||'');
 const affiliation=catalogFaction(path),faction=affiliation.key;
 const tags=[kind];if(kind==='vehicles'){if(/^(tank|apc)$/.test(a.assetKind)||/\/(?:Armored|Armoured)\/|\b(?:btr|bmp|m113|bradley|abrams|t72|tank)/i.test(path))tags.push('armor');if(a.assetKind==='apc'||/\b(?:btr|bmp|m113|bradley|apc|ifv)/i.test(path))tags.push('mechanized');if(a.assetKind==='lightVehicle')tags.push('motorized');if(a.assetKind==='truck')tags.push('logistics');if(a.assetKind==='helicopter'||/\/Helicopters\//i.test(path))tags.push('rotary');if(a.assetKind==='aircraft'||/\/(?:Planes|Aircraft)\//i.test(path))tags.push('fixed');}if(kind==='vehicles'&&(a.assetKind==='boat'||/\/(?:Boats|Naval|Watercraft)\//i.test(path)))tags.push('naval');if(kind==='vehicles'&&(a.assetKind==='truck'||/\/(?:Medical|Repair|Fuel|Support)\//i.test(path)))tags.push('support');const variant=['vehicleparts','wrecks','templates'].includes(kind)||/(?:^|[\/ _])(base(?:body)?|bases|damaged|destroyed|wreck|helper|template|dst|dbr|lights|wheels|components)(?:[\/ _\.]|$)/i.test(path)||/(?:^|_)base\.et$/i.test(path);
 return {asset:a,title,kind,tags,faction,factionSource:affiliation.reason,variant,search:fold([a.name,title,path,a.category,a.author,a.modId,a.resourceReference?.guid,faction,({BLUFOR:'US USA American NATO',OPFOR:'USSR Soviet Russian',INDFOR:'FIA independent',CIVILIAN:'civilian civil'}[faction]||''),...tags.map(tag=>aliases[tag]||'')].join(' '))};
}
function filter(rows,{query='',kind='all',faction='all',variants=true}={}){const tokens=fold(query).trim().split(/\s+/).filter(Boolean);return rows.filter(r=>(kind==='all'||r.tags.includes(kind))&&(faction==='all'||r.faction===faction)&&(variants||!r.variant)&&tokens.every(s=>r.search.includes(s)));}
function counts(rows,options={}){const result=Object.fromEntries(Object.keys(categories).map(k=>[k,0]));for(const row of filter(rows,{...options,kind:'all'})){result.all++;for(const tag of new Set(row.tags))if(Object.hasOwn(result,tag)&&tag!=='all')result[tag]++;}return result;}
function attach({select,host,translate,choose}){
 const t=translate,doc=host.ownerDocument;let rows=[],page=0,timer=0;const cache=new WeakMap(),size=20;
 const el=(tag,text)=>{const n=doc.createElement(tag);if(text)n.textContent=text;return n;};
 const summary=el('button');summary.type='button';summary.id='assetBrowse';summary.setAttribute('aria-expanded','false');
 const panel=el('section');panel.id='assetBrowser';panel.className='asset-browser';panel.hidden=true;summary.setAttribute('aria-controls',panel.id);
 const searchLabel=el('label');searchLabel.htmlFor='assetQuery';const query=el('input');query.type='search';query.id='assetQuery';query.maxLength=200;
 const typeLabel=el('label');typeLabel.htmlFor='assetTypeFilter';const type=el('select');type.id='assetTypeFilter';
 const factionLabel=el('label');factionLabel.htmlFor='assetFactionFilter';const faction=el('select');faction.id='assetFactionFilter';
 const variantLabel=el('label');variantLabel.className='check';const variants=el('input');variants.type='checkbox';variants.id='assetVariants';variants.checked=false;const variantText=el('span');variantLabel.append(variants,variantText);
 const count=el('p');count.id='assetResultCount';count.setAttribute('role','status');const results=el('div');results.id='assetResults';
 const nav=el('div');nav.className='actions';const prev=el('button'),next=el('button');prev.type=next.type='button';prev.id='assetPrevious';next.id='assetNext';nav.append(prev,next);
 const clear=el('button');clear.type='button';clear.id='assetUnassign';
 const note=el('p');note.className='hint';
 panel.append(searchLabel,query,typeLabel,type,factionLabel,faction,variantLabel,count,results,nav,clear,note);host.append(summary,panel);select.hidden=true;
 function option(target,value,text){const n=el('option',text);n.value=value;target.append(n);}
 function labels(){const oldType=type.value||'all',oldFaction=faction.value||'all';searchLabel.textContent=t('Search assets');query.placeholder=t('Search name, faction, path or GUID');typeLabel.textContent=t('Asset type');type.replaceChildren();for(const [k,v]of Object.entries(categories))option(type,k,t(v));type.value=oldType;factionLabel.textContent=t('Default faction / origin');faction.replaceChildren();option(faction,'all',t('All asset factions'));for(const f of [...new Set(rows.map(r=>r.faction))].sort())option(faction,f,f==='unknown'?t('Unspecified'):f);faction.value=[...faction.options].some(o=>o.value===oldFaction)?oldFaction:'all';variantText.textContent=t('Show parts, wrecks and templates');prev.textContent=t('Previous');next.textContent=t('Next');clear.textContent=t('Clear asset assignment');note.textContent=t('Faction folders and known vehicle variants organize this list; model origin is a fallback hint. All factions remain available. This filter does not assign in-game ownership. Native spawn availability still requires validation.');}
 function render(){const totals=counts(rows,{query:query.value,faction:faction.value,variants:variants.checked});for(const option of type.options)option.textContent=t(categories[option.value])+' ('+totals[option.value]+')';const matches=filter(rows,{query:query.value,kind:type.value,faction:faction.value,variants:variants.checked});page=Math.max(0,Math.min(page,Math.ceil(matches.length/size)-1));results.replaceChildren();const start=page*size;count.textContent=matches.length+' '+t('matching assets')+(matches.length?' · '+(start+1)+'–'+Math.min(start+size,matches.length):'');
 for(const r of matches.slice(start,start+size)){const b=el('button');b.type='button';b.className='asset-result';b.dataset.assetId=r.asset.id;b.setAttribute('aria-pressed',String(r.asset.id===select.value));const title=el('strong',r.title),detail=el('span',t(categories[r.kind])+' · '+(r.faction==='unknown'?t('Unspecified'):r.faction)+(r.variant?' · '+t('Template / variant'):''));const source=el('small',r.asset.resourceReference?.path||r.asset.name);b.append(title,detail,source);b.onclick=()=>{choose(r.asset);render();sync();};results.append(b);}
 if(!matches.length)results.append(el('p',t('No assets match these filters.')));prev.disabled=page===0;next.disabled=(page+1)*size>=matches.length;
 }
 function sync(){const r=rows.find(r=>r.asset.id===select.value);summary.textContent=t('Browse assets')+' · '+(r?.title||t('No asset assigned'));summary.title=r?.asset.resourceReference?.path||'';}
 function refresh(){labels();render();sync();}
 summary.onclick=()=>{panel.hidden=!panel.hidden;summary.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){render();query.focus();}};
 query.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>{page=0;render();},100);};type.onchange=()=>{clearTimeout(timer);if(['vehicleparts','wrecks','templates'].includes(type.value))variants.checked=true;page=0;render();};faction.onchange=variants.onchange=()=>{clearTimeout(timer);page=0;render();};prev.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};clear.onclick=()=>{choose({id:'none',name:'No asset assigned'});sync();render();};
 globalThis.addEventListener?.('planner-preferences-changed',()=>{if(!globalThis.PlannerPreferences?.layoutOnlyChange?.())refresh();});
 return {setUnitType(unitType){const link={infantry:'troops',armor:'armor',mechanized:'mechanized',motorized:'motorized',rotary:'rotary',fixed:'fixed',logistics:'logistics',medical:'troops',engineer:'troops',recon:'troops',special:'troops'};type.value=link[unitType]||'all';query.value='';page=0;render();},setItems(items){rows=items.filter(a=>a.id!=='none').map(a=>{if(!cache.has(a))cache.set(a,describe(a));return cache.get(a);});page=0;refresh();},sync};
}
return {describe,filter,counts,categories,catalogFaction,attach};
});

