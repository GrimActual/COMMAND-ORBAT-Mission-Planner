const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const F=require('./helicopter-insertion-contract');
const capabilities=[F.CAPABILITY,F.PROFILE_CAPABILITY,F.UNRESTRICTED_CAPABILITY,F.CREW_ONLY_CAPABILITY];
const flight=(crewOnly=true)=>({version:5,requestId:'flight',kind:F.KIND,targetRequestId:'deployment',unitId:crewOnly?'aircraft':'team',vehicleRequestId:'deployment',vehicleUnitId:'aircraft',worldX:4930,worldZ:11760,timeoutSeconds:600,cruiseSpeedMps:8,...(crewOnly?{crewOnly:true}:{})});
const measure=(extra={})=>({phase:'complete: landed',elapsed:90,landed:true,grounded:true,unloaded:0,pilotAboard:true,passengersAboard:0,worldX:4930,worldY:35,worldZ:11760,...extra});
const binding={requestId:'deployment',unitId:'aircraft',kind:'spawn',phase:'executed'};
test('crew-only exact aircraft binding requires capability, version and strict boolean',()=>{
 a.equal(F.requireBindings(flight(),{capabilities,aircraft:binding,approvalMode:'manual'}).crewOnly,true);
 a.throws(()=>F.requireBindings(flight(),{capabilities:capabilities.slice(0,-1),aircraft:binding,approvalMode:'manual'}),/pilot-only/);
 for(const change of [{version:2},{crewOnly:'true'},{crewOnly:1},{unitId:'team'},{vehicleRequestId:'foreign'}])a.throws(()=>F.validate({...flight(),...change}));
 for(const bad of [{...binding,revoked:true},{...binding,phase:'pending'},{...binding,unitId:'other'}])a.throws(()=>F.requireBindings(flight(),{capabilities,aircraft:bad,approvalMode:'manual'}));
});
test('default passenger request remains separate and completion still requires four exits',()=>{
 a.equal(F.validate(flight(false)).unitId,'team');a.throws(()=>F.validate({...flight(false),unitId:'aircraft'}));
 a.throws(()=>F.requireBindings(flight(false),{capabilities,aircraft:binding,approvalMode:'manual'}));
 a.throws(()=>F.validateProgress(measure()));a.equal(F.validateProgress(measure({unloaded:4})).unloaded,4);
});
test('pilot-only measured completion requires zero passengers, actual landing and retained pilot',()=>{
 a.equal(F.validateProgress(measure(),0).unloaded,0);
 for(const change of [{unloaded:1},{passengersAboard:1},{grounded:false},{landed:false},{pilotAboard:false}])a.throws(()=>F.validateProgress(measure(change),0));
 a.throws(()=>F.validateProgress(measure(),1));
});
function loadQueue(which){return require(which==='relay'?'../relay/gm-commands':'./bridge-runtime/gm-commands');}
for(const which of ['relay','planner/bridge-runtime'])test(which+' queue passes expected count only for explicit crew-only and retains manual approval',()=>{
 const GM=loadQueue(which);let now=1000;const q=GM.createQueue(()=>now);q.registerCapabilities(capabilities);
 q.submit({version:1,kind:'spawn',requestId:'deployment',sourceMissionSha256:'a'.repeat(64),entities:[{unitId:'aircraft',name:'aircraft',resourceName:'{70BAEEFC2D3FEE64}Prefabs/Vehicles/Helicopters/UH1H/UH1H.et',worldX:4930,worldZ:11740,headingDegrees:0}]});q.approve('deployment');q.result({requestId:'deployment',status:'executed',message:'spawned',createdIds:['1']});now+=1100;
 q.submit(flight());a.throws(()=>q.approve('flight','automatic'));q.approve('flight');a.throws(()=>q.result({requestId:'flight',status:'executed',message:'accepted',createdIds:[]}));a.throws(()=>q.flightProgress('flight',measure({unloaded:4})));q.flightProgress('flight',measure());a.equal(q.result({requestId:'flight',status:'executed',message:'measured landing',createdIds:[]}).phase,'executed');a.equal(q.submit(flight()).phase,'executed');
});
