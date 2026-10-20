'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const C=require('./planner-core'),K=require('./asset-tools'),ms=require('./vendor/milsymbol');
const unit=(id=1,extra={})=>({id,name:'ACTUAL',position:{lat:6450,lng:6450},...extra});
const base=extra=>({schema:'everon-orbat-plan',schemaVersion:4,orderOfBattle:[unit()],...extra});
test('legacy v3 plans migrate without losing custom assets or two-point routes',()=>{
 const d=C.validate({schemaVersion:3,orderOfBattle:[unit(5,{asset:'custom',assetName:'My UH-60',assetCatalogItem:{name:'My UH-60',extra:{preserved:true}}})],routes:[{id:1,start:{lat:1,lng:2},end:{lat:3,lng:4}}]});
 assert.equal(d.schemaVersion,4);assert.equal(d.orderOfBattle[0].symbolMode,'asset');assert.equal(d.orderOfBattle[0].assetCatalogItem.extra.preserved,true);assert.deepEqual(d.routes[0].points,[{lat:1,lng:2},{lat:3,lng:4}]);
 assert.equal(C.validate({units:[{id:1,lat:5,lng:6}]}).orderOfBattle[0].position.lng,6);
});
test('advanced plans round-trip all styles, phases, hierarchy, vertices and area kinds',()=>{
 const d=C.validate(base({orderOfBattle:[unit('hq'),unit('a',{side:'green',color:'#b5f',phaseId:'phase-2',parentId:'hq'})],routes:[{id:'r',name:'MSR',phaseId:'phase-1',points:[{lat:0,lng:0},{lat:100,lng:200},{lat:300,lng:400}],style:{color:'#f93',pattern:'arrow',width:9}}],areas:[{id:'p',kind:'polygon',points:[{lat:10,lng:10},{lat:10,lng:20},{lat:20,lng:20}]},{id:'b',kind:'rectangle',points:[{lat:10,lng:10},{lat:50,lng:70}]},{id:'c',kind:'circle',center:{lat:100,lng:100},radius:500,style:{color:'#fff',opacity:.4}}]}));
 assert.deepEqual(C.validate(JSON.parse(JSON.stringify(d))),d);assert.equal(d.orderOfBattle[1].color,'#BB55FF');assert.equal(d.routes[0].style.color,'#FF9933');assert.equal(d.areas.length,3);
});
test('faction identity and custom colors are independent',()=>{
 for(const side of Object.keys(C.SIDES)){const d=C.validate(base({orderOfBattle:[unit(1,{side,color:'#FF9933'})]}));assert.equal(d.orderOfBattle[0].side,side);assert.equal(C.markerColor(d.orderOfBattle[0]),'#FF9933')}
 assert.equal(C.markerColor({side:'green'}),'#59C76E');assert.equal(C.color('#abc'),'#AABBCC');assert.throws(()=>C.color('red'));assert.throws(()=>C.color('#123456;display:none'));
});
test('local grid truncates to correct east/north ordering and precision',()=>{
 assert.equal(C.grid({lat:6450,lng:6450},6),'064-064');assert.equal(C.grid({lat:6450,lng:6450},8),'0645-0645');assert.equal(C.grid({lat:1000,lng:2500},6),'025-010');assert.equal(C.grid({lat:1099.9,lng:999.9},6),'009-010');assert.equal(C.grid({lat:0,lng:0},8),'0000-0000');assert.equal(C.grid({lat:-1,lng:0}),'Outside grid');
});
test('planar game-meter distances, path lengths and compass bearings',()=>{
 const o={lat:0,lng:0};assert.equal(C.distance(o,{lat:300,lng:400}),500);assert.equal(C.bearing(o,{lat:100,lng:0}),0);assert.equal(C.bearing(o,{lat:0,lng:100}),90);assert.equal(C.bearing(o,{lat:-100,lng:0}),180);assert.equal(C.bearing(o,{lat:0,lng:-100}),270);assert.equal(C.bearing(o,o),null);assert.equal(C.length([o,{lat:0,lng:100},{lat:100,lng:100}]),200);
});
test('all 16 military unit types and all four factions have valid SIDCs',()=>{
 for(const type of Object.keys(C.TYPES))for(const side of Object.keys(C.SIDES)){const s=new ms.Symbol(C.sidc(type,side),{size:25,fillColor:'#FF9933'});assert.equal(s.isValid(),true,type+' '+side);assert.match(s.asSVG(),/#FF9933/i)}
 assert.notEqual(C.sidc('mechanized','blue'),C.sidc('motorized','blue'));assert.equal(C.unitType('__proto__'),'other');
});
test('hierarchy rejects self-parent, cycles and missing commanders',()=>{
 assert.throws(()=>C.validate(base({orderOfBattle:[unit(1,{parentId:1})]})),/cycle/);
 assert.throws(()=>C.validate(base({orderOfBattle:[unit(1,{parentId:2}),unit(2,{parentId:1})]})),/cycle/);
 assert.throws(()=>C.validate(base({orderOfBattle:[unit(1,{parentId:2})]})),/does not exist/);
 const units=[unit(1,{parentId:null}),unit(2,{parentId:1}),unit(3,{parentId:2})];assert.equal(C.canParent(units,1,3),false);assert.equal(C.canParent(units,3,1),true);assert.equal(C.canParent(units,3,null),true);
});
test('invalid imports fail without mutating the source data',()=>{
 const bad=base({orderOfBattle:[unit(1,{position:{lat:'6450',lng:10}})]});const before=JSON.stringify(bad);assert.throws(()=>C.validate(bad));assert.equal(JSON.stringify(bad),before);
 for(const p of [base({schemaVersion:6}),base({schemaVersion:0}),base({orderOfBattle:[unit(1),unit('1')]}),base({orderOfBattle:[unit(1,{side:'<img>'})]}),base({orderOfBattle:[unit(1,{phaseId:'missing'})]}),base({orderOfBattle:[unit(1,{position:{lat:14000,lng:0}})]})])assert.throws(()=>C.validate(p));
});
test('geometry rejects degenerate paths, crossed polygons and invalid radii',()=>{
 assert.throws(()=>C.validate(base({routes:[{points:[{lat:1,lng:1},{lat:1,lng:1}]}]})),/length/);
 assert.throws(()=>C.validate(base({areas:[{kind:'polygon',points:[{lat:0,lng:0},{lat:10,lng:10},{lat:0,lng:10},{lat:10,lng:0}]}]})),/cross/);
 assert.throws(()=>C.validate(base({areas:[{kind:'rectangle',points:[{lat:0,lng:0},{lat:0,lng:10}]}]})),/width/);
 assert.throws(()=>C.validate(base({areas:[{kind:'circle',center:{lat:10,lng:10},radius:0}]})),/radius/);
});
test('phase visibility drives briefing without deleting hidden elements',()=>{
 const d=C.validate(base({orderOfBattle:[unit(1,{name:'SHARED'}),unit(2,{name:'ASSAULT',phaseId:'phase-2'})],view:{hiddenPhases:['phase-2'],gridDigits:8}}));const brief=C.briefing(d);assert.match(brief,/SHARED/);assert.doesNotMatch(brief,/ASSAULT/);assert.match(brief,/0645-0645/);assert.equal(d.orderOfBattle.length,2);assert.equal(C.visible(d,d.orderOfBattle[1]),false);
});
test('asset types and supplied catalog overrides remain supported',()=>{
 for(const [name,kind]of [['UH-60','helicopter'],['Bradley','apc'],['Humvee','lightVehicle'],['Foot soldiers','infantry'],['Abrams','tank'],['Cargo truck','truck'],['C-130','aircraft'],['RHIB','boat'],['UH-60 Humvee pack','mixed'],['Unknown mod','other']])assert.equal(K.classify({name}).kind,kind);
 assert.equal(K.classify({name:'UH-60',assetKind:'boat'}).kind,'boat');assert.doesNotMatch(K.svg('<img>'),/<img>/);
});
test('view controls survive export; bounds, styles and IDs are checked',()=>{
 const d=C.validate(base({view:{layers:{grid:true,units:false,routes:false,areas:false},gridDigits:8}}));assert.equal(d.view.layers.grid,true);assert.equal(d.view.layers.units,false);
 assert.throws(()=>C.style({width:0}));assert.throws(()=>C.style({pattern:'<svg>'}));assert.throws(()=>C.style({opacity:2}));assert.equal(C.freshId([{id:'unit-1'},{id:Number.MAX_SAFE_INTEGER}],'unit-'),'unit-2');
});
