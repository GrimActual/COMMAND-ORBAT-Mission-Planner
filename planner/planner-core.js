/* Pure plan validation, local-grid geometry and military-symbol mapping. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PlannerCore=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const Clock=typeof module==='object'&&module.exports?require('./mission-clock'):globalThis.PlannerClock;
const VERSION=5;
const SIDES={blue:'Bluefor / Friendly',red:'Opfor / Hostile',green:'Independent / Guerrilla / FIA',neutral:'Civilian / Neutral'};
const COLORS={blue:'#62B8FF',red:'#FF7777',green:'#59C76E',neutral:'#EBC66F'};
const TYPES={headquarters:'Headquarters',infantry:'Infantry',motorized:'Motorized',mechanized:'Mechanized',armor:'Armor',rotary:'Rotary Wing',fixed:'Fixed Wing',airDefense:'Air Defense',mortar:'Mortar',artillery:'Artillery',logistics:'Logistics / Supply',medical:'Medical',engineer:'Engineer',recon:'Recon',special:'Special Force',other:'Other / Objective'};
// Function identifiers are taken from milsymbol 3.0.4's letter SIDC tables.
const SYMBOLS={headquarters:['G','U-----'],infantry:['G','UCI---'],motorized:['G','UCIM--'],mechanized:['G','UCIZ--'],armor:['G','UCA---'],rotary:['A','MH----'],fixed:['A','MF----'],airDefense:['G','UCD---'],mortar:['G','UCFM--'],artillery:['G','UCF---'],logistics:['G','USS---'],medical:['G','USM---'],engineer:['G','UCE---'],recon:['G','UCR---'],special:['F','GS----'],other:['G','U-----']};
const ICONS=['auto','symbol','helicopter','infantry','lightVehicle','apc','tank','truck','aircraft','boat','mixed','other'];
const DEFAULT_PHASES=[{id:'phase-1',name:'Phase I: Infiltration'},{id:'phase-2',name:'Phase II: Assault'},{id:'phase-3',name:'Phase III: Exfiltration'}];
const clone=v=>JSON.parse(JSON.stringify(v));
const has=(o,k)=>Object.hasOwn(o,k);
function fail(message){throw new Error(message)}
function text(v,fallback='',limit=10000){if(v==null)return fallback;if(typeof v!=='string')fail('Expected text');if(v.length>limit)fail('Text exceeds '+limit+' characters');return v}
function number(v,min,max,label){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail('Invalid '+label);return v}
function color(v,fallback=null){if(v==null||v==='')return fallback;if(typeof v!=='string'||!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v))fail('Use a HEX color such as #FF9933');return (v.length===4?'#'+[...v.slice(1)].map(c=>c+c).join(''):v).toUpperCase()}
function point(p){if(!p||typeof p!=='object')fail('Missing map coordinate');return {lat:number(p.lat,-500,13500,'northing'),lng:number(p.lng,-500,13500,'easting')}}
function id(v,fallback){v=v??fallback;if(!((typeof v==='string'&&v.length>0&&v.length<=100)||(Number.isSafeInteger(v)&&v>0)))fail('Invalid ID');return v}
function entries(v,label,max=10000){if(!Array.isArray(v)||v.length>max)fail('Invalid '+label+' list');return v}
function distinct(items,label){const ids=new Set();for(const o of items){if(ids.has(String(o.id)))fail('Duplicate '+label+' ID');ids.add(String(o.id))}return items}
function unitType(value){if(has(TYPES,value))return value;const key=String(value||'').toLowerCase();const aliases={headquarters:'headquarters',infantry:'infantry',recon:'recon',mechanised:'mechanized',mechanized:'mechanized',motorized:'motorized',motorised:'motorized',armour:'armor',armor:'armor',logistics:'logistics','sniper team':'recon',objective:'other',other:'other','rotary wing':'rotary','fixed wing':'fixed','air defense':'airDefense',medical:'medical',engineer:'engineer','special force':'special',mortar:'mortar',artillery:'artillery'};return has(aliases,key)?aliases[key]:'other'}
function sidc(type,side){const [dimension,func]=SYMBOLS[unitType(type)];const affiliation=side==='blue'?'F':side==='red'?'H':'N';return 'S'+affiliation+dimension+'P'+func+(type==='headquarters'?'A----':'-----')}
function markerColor(u){return color(u.color,COLORS[u.side]||COLORS.blue)}
function style(v={}){if(!v||typeof v!=='object')fail('Invalid drawing style');const dash=v.pattern??v.style??'solid';if(!['solid','dashed','dotted','arrow'].includes(dash))fail('Unknown line style');return {color:color(v.color,'#EBC66F'),width:number(v.width??4,1,16,'line width'),pattern:dash,opacity:number(v.opacity??0.18,0,0.8,'area opacity')}}
function distance(a,b){return Math.hypot(b.lng-a.lng,b.lat-a.lat)}
function bearing(a,b){return distance(a,b)<0.000001?null:(Math.atan2(b.lng-a.lng,b.lat-a.lat)*180/Math.PI+360)%360}
function length(points){return points.slice(1).reduce((n,p,i)=>n+distance(points[i],p),0)}
function formatDistance(m){return m>=1000?(m/1000).toFixed(2)+' km':Math.round(m)+' m'}
function grid(p,digits=6){if(!p||!Number.isFinite(p.lng)||!Number.isFinite(p.lat)||p.lng<0||p.lat<0)return 'Outside grid';const n=digits===8?4:3,scale=digits===8?10:100;return Math.floor(p.lng/scale).toString().padStart(n,'0')+'-'+Math.floor(p.lat/scale).toString().padStart(n,'0')}
function rectangle(a,b){return [{lat:a.lat,lng:a.lng},{lat:a.lat,lng:b.lng},{lat:b.lat,lng:b.lng},{lat:b.lat,lng:a.lng}]}
function signedArea(points){return points.reduce((n,p,i)=>{const q=points[(i+1)%points.length];return n+p.lng*q.lat-q.lng*p.lat},0)/2}
function simplePolygon(points){
 const orient=(a,b,c)=>(b.lng-a.lng)*(c.lat-a.lat)-(b.lat-a.lat)*(c.lng-a.lng);
 const on=(a,b,p)=>Math.abs(orient(a,b,p))<1e-8&&p.lng>=Math.min(a.lng,b.lng)&&p.lng<=Math.max(a.lng,b.lng)&&p.lat>=Math.min(a.lat,b.lat)&&p.lat<=Math.max(a.lat,b.lat);
 const cross=(a,b,c,d)=>{const x=orient(a,b,c),y=orient(a,b,d),z=orient(c,d,a),w=orient(c,d,b);return x*y<0&&z*w<0||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b)};
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){if(j===i+1||i===0&&j===points.length-1)continue;if(cross(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length]))return false}
 return Math.abs(signedArea(points))>0.01;
}
function treeValid(units){
 const byId=new Map(units.map(u=>[String(u.id),u]));
 for(const u of units){if(u.parentId!=null&&!byId.has(String(u.parentId)))fail('Command parent does not exist');const seen=new Set([String(u.id)]);let p=u.parentId;while(p!=null){const key=String(p);if(seen.has(key))fail('Command hierarchy cannot contain a cycle');seen.add(key);if(seen.size>64)fail('Command hierarchy exceeds 64 levels');p=byId.get(key)?.parentId}}
 return true;
}
function canParent(units,child,parent){try{treeValid(units.map(u=>String(u.id)===String(child)?{...u,parentId:parent}:u));return true}catch{return false}}
function workbenchReview(v){
 const exact=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value))||Reflect.ownKeys(value).length!==keys.length||keys.some(key=>{const d=Object.getOwnPropertyDescriptor(value,key);return !d||!('value'in d)||!d.enumerable;}))fail('Invalid Workbench review fields');};
 exact(v,['schema','version','planId','exchangeId','managedId','world','space','mapOffset','transform','nativeValidationRequired']);
 if(v.schema!=='command-workbench-review-pose'||v.version!==1||v.space!=='world-metres-yaw-pitch-roll-degrees'||v.nativeValidationRequired!==true)fail('Invalid Workbench review contract');
 for(const key of ['planId','exchangeId','managedId'])if(typeof v[key]!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v[key]))fail('Invalid Workbench review identity');
 exact(v.world,['addonId','guid','path']);for(const key of ['addonId','guid'])if(typeof v.world[key]!=='string'||!/^[A-F0-9]{16}$/.test(v.world[key])||/^0{16}$/.test(v.world[key]))fail('Invalid Workbench review world');
 const path=text(v.world.path,'',512);if(!path.endsWith('.ent')||path.startsWith('/')||/[\\<>:"|?*{}%\x00-\x1f\x7f]/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..'||part!==part.trim()||part.endsWith('.')||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)))fail('Invalid Workbench review world path');
 exact(v.mapOffset,['east','north']);number(v.mapOffset.east,-10000000,10000000,'Workbench map offset');number(v.mapOffset.north,-10000000,10000000,'Workbench map offset');exact(v.transform,['position','angles']);
 const triple=(value,min,max)=>{if(!Array.isArray(value)||value.length!==3||![0,1,2].every(i=>Object.hasOwn(value,i)))fail('Invalid Workbench review vector');return value.map(n=>number(n,min,max,'Workbench review vector'));};
 triple(v.transform.position,-10000000,10000000);const angles=triple(v.transform.angles,-180,360);if(angles[1]>180||angles[2]>180)fail('Invalid Workbench review pitch or roll');
 return clone(v);
}
function validate(d){
 if(!d||typeof d!=='object'||Array.isArray(d))fail('Expected a plan object');
 if(d.schema&&d.schema!=='everon-orbat-plan')fail('Unsupported plan schema');
 if(d.schemaVersion!=null&&(!Number.isInteger(d.schemaVersion)||d.schemaVersion<1||d.schemaVersion>VERSION))fail('Unsupported plan version');
 const phases=distinct(entries(d.phases??clone(DEFAULT_PHASES),'phases',30).map((p,i)=>({id:String(id(p.id,'phase-'+(i+1))),name:text(p.name,'Phase '+(i+1),120)})),'phase');
 if(phases.some(p=>p.id==='shared'))fail('The shared phase ID is reserved');
 const phaseIds=new Set(phases.map(p=>p.id));
 const phase=v=>{if(v==null||v==='')return null;if(!phaseIds.has(String(v)))fail('Unknown mission phase');return String(v)};
 const raw=d.orderOfBattle??d.units;if(!Array.isArray(raw))fail('Missing orderOfBattle or units');
 const units=distinct(entries(raw,'markers').map((u,i)=>{
  if(!u||typeof u!=='object')fail('Invalid marker');
  const side=u.side??'blue';if(!has(SIDES,side))fail('Invalid affiliation');
  const icon=u.icon??'auto';if(!ICONS.includes(icon))fail('Invalid asset icon');
  const symbolMode=u.symbolMode??(d.schemaVersion>=4?'nato':'asset');if(!['nato','asset','text'].includes(symbolMode))fail('Invalid symbol mode');
  const asset=u.assetCatalogItem??{};if(!asset||typeof asset!=='object'||Array.isArray(asset))fail('Invalid embedded asset');
  const pos=point(u.position??{lat:u.lat,lng:u.lng});
  return {...(Object.hasOwn(u,'headingDegrees')?{headingDegrees:number(u.headingDegrees,0,359.999999,'unit heading')}:{}),...(Object.hasOwn(u,'workbenchReview')?{workbenchReview:workbenchReview(u.workbenchReview)}:{}),...(u.locked===true?{locked:true}:{}),id:id(u.id,i+1),name:text(u.name,''),symbol:text(u.symbol,'I',100),side,type:text(u.type,'Infantry',100),unitType:unitType(u.unitType??u.type),symbolMode,icon,color:color(u.color),phaseId:phase(u.phaseId),parentId:u.parentId==null?null:id(u.parentId),asset:text(u.asset??asset.id,'none',200),assetName:text(u.assetName??asset.name??u.asset,'No asset assigned',500),assetCatalogItem:clone(asset),strength:text(u.strength,''),position:pos};
 }),'marker');treeValid(units);
 let totalPoints=0;
 const points=(p,min,max=2000)=>{const arr=entries(p,'waypoints',max).map(point);if(arr.length<min)fail('Not enough waypoints');totalPoints+=arr.length;if(totalPoints>30000)fail('Plan exceeds 30,000 waypoints');return arr};
 const routes=distinct(entries(d.routes??[],'routes',3000).map((r,i)=>{
  const p=points(r.points??[r.start??{lat:r.lat1,lng:r.lng1},r.end??{lat:r.lat2,lng:r.lng2}],2);
  if(length(p)<0.01)fail('Route must have length');
  return {...(r.locked===true?{locked:true}:{}),id:id(r.id,i+1),name:text(r.name,'Route '+(i+1),200),phaseId:phase(r.phaseId),points:p,style:style(r.style??{pattern:'dashed'}),start:p[0],end:p[p.length-1]};
 }),'route');
 const areas=distinct(entries(d.areas??[],'areas',1000).map((a,i)=>{
  if(!['polygon','rectangle','circle'].includes(a.kind))fail('Invalid area type');
  const base={...(a.locked===true?{locked:true}:{}),id:id(a.id,i+1),name:text(a.name,'Area '+(i+1),200),phaseId:phase(a.phaseId),kind:a.kind,style:style(a.style)};
  if(a.kind==='circle')return {...base,center:point(a.center),radius:number(a.radius,1,20000,'radius')};
  const p=points(a.points,a.kind==='rectangle'?2:3,a.kind==='rectangle'?2:1000);
  if(a.kind==='rectangle'){if(Math.abs((p[0].lat-p[1].lat)*(p[0].lng-p[1].lng))<0.01)fail('Rectangle must have width and height')}
  else if(!simplePolygon(p))fail('Area boundary must not cross itself or have zero area');
  return {...base,points:p};
 }),'area');
 const o=d.operation??{};if(typeof o!=='object'||Array.isArray(o))fail('Invalid operation');
 const v=d.view??{},layers=v.layers??{};
 return {schema:'everon-orbat-plan',schemaVersion:units.some(unit=>Object.hasOwn(unit,'workbenchReview'))?5:4,app:'Everon ORBAT Mapper',operation:{...(o.timing!=null?{timing:Clock.validate(o.timing)}:{}),name:text(o.name,'OPERATION EVERON',300),taskForce:text(o.taskForce,'COMMAND',200),version:text(o.version,'01',50),briefing:text(o.briefing,'')},map:{name:'Everon',game:'Arma Reforger',coordinateSystem:'mapper-local',gridOrder:'easting-northing'},phases,orderOfBattle:units,routes,areas,view:{...(Array.isArray(v.hiddenAreas)?{hiddenAreas:v.hiddenAreas.filter(id=>areas.some(a=>String(a.id)===String(id))).map(String)}:{}),gridDigits:v.gridDigits===8?8:6,hiddenPhases:Array.isArray(v.hiddenPhases)?v.hiddenPhases.filter(x=>x==='shared'||phaseIds.has(x)):[],layers:{grid:layers.grid===true,units:layers.units!==false,routes:layers.routes!==false,areas:layers.areas!==false,labels:layers.labels!==false}}};
}
function empty(){return validate({schemaVersion:4,orderOfBattle:[],routes:[],areas:[]})}
function visible(plan,item){return !(plan.areas.includes(item)&&(plan.view.hiddenAreas||[]).includes(String(item.id)))&&!plan.view.hiddenPhases.includes(item.phaseId??'shared')}
function freshId(items,prefix){const used=new Set(items.map(x=>String(x.id)));let n=1;while(used.has(prefix+n))n++;return prefix+n}
function briefing(plan,{t=s=>s,distance:displayDistance=formatDistance}={}){
 const names=new Map(plan.orderOfBattle.map(u=>[String(u.id),u.name||u.type]));
 const phaseName=id=>plan.phases.find(p=>p.id===id)?.name||t('All phases');
 const lines=['**'+(plan.operation.name||'OPERATION EVERON')+'** — '+plan.operation.taskForce+' | v'+plan.operation.version,'',plan.operation.briefing,'','**'+t('ORDER OF BATTLE (visible phases)')+'**'];
 for(const u of plan.orderOfBattle.filter(u=>visible(plan,u)))lines.push('• **'+(u.name||u.type)+'** — '+t(SIDES[u.side])+' | '+t(TYPES[u.unitType])+' | '+t('grid')+' '+grid(u.position,plan.view.gridDigits)+(u.asset!=='none'?' | '+u.assetName:'')+(u.parentId!=null?' | '+t('under')+' '+names.get(String(u.parentId)):'')+' | '+phaseName(u.phaseId)+(u.strength?' | '+u.strength:''));
 lines.push('','**'+t('ROUTES')+'**');for(const r of plan.routes.filter(r=>visible(plan,r)))lines.push('• '+r.name+' | '+r.points.map(p=>grid(p,plan.view.gridDigits)).join(' → ')+' | '+displayDistance(length(r.points))+' | '+phaseName(r.phaseId));
 lines.push('','**'+t('AREAS')+'**');for(const a of plan.areas.filter(a=>visible(plan,a)))lines.push('• '+a.name+' | '+t(a.kind)+' | '+phaseName(a.phaseId)+(a.kind==='circle'?' | '+t('center')+' '+grid(a.center,plan.view.gridDigits)+' | '+t('radius')+' '+displayDistance(a.radius):' | '+a.points.map(p=>grid(p,plan.view.gridDigits)).join(' → ')));
 return lines.filter(x=>x!=null).join('\n');
}
return {VERSION,SIDES,COLORS,TYPES,SYMBOLS,ICONS,DEFAULT_PHASES,clone,color,point,style,unitType,sidc,markerColor,distance,bearing,length,formatDistance,grid,rectangle,simplePolygon,treeValid,canParent,validate,empty,visible,freshId,briefing};
});
