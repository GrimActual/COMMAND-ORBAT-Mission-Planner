'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),AI=require('./bridge-runtime/ai-orders-contract'),GM=require('./bridge-runtime/gm-commands');
const target={version:2,requestId:'setting',targetRequestId:'lease',unitId:'host_ai'};
test('squad settings accept only explicit enums and exact inert data fields',()=>{
 for(const [kind,values]of Object.entries(AI.preferences))for(const value of values){const r={...target,kind,[AI.preferenceField(kind)]:value};a.deepEqual(AI.validate(r),r);a.throws(()=>AI.validate({...r,script:'arbitrary'}));a.throws(()=>AI.validate({...r,[AI.preferenceField(kind)]:'unknown'}));}
 for(const formation of ['Diamond','Circle','auto','../../formation.conf'])a.throws(()=>AI.validate({...target,kind:'ai-formation',formation}));
 let invoked=false;const r={...target,kind:'ai-stance'};Object.defineProperty(r,'stance',{enumerable:true,get(){invoked=true;return 'prone';}});a.throws(()=>AI.validate(r));a.equal(invoked,false);
});
test('formation, stance and fire policies need separate negotiated capabilities and approved owned targets',()=>{
 let now=0;const q=GM.createQueue(()=>now,{trackingIds:['host_ai']});q.registerCapabilities([AI.CAPABILITY,AI.SQUAD_CAPABILITY]);q.submit({version:2,requestId:'lease',kind:'ai-recruit',sourceEntityId:'host_ai'});q.approve('lease');q.result({requestId:'lease',status:'executed',message:'Recruited',createdIds:[]});now=1000;
 const request={...target,kind:'ai-stance',stance:'prone'};a.throws(()=>q.submit(request),/advertised/);q.registerCapabilities([AI.CAPABILITY,AI.SQUAD_CAPABILITY,AI.STANCE_CAPABILITY]);q.submit(request);a.throws(()=>q.result({requestId:'setting',status:'executed',message:'Bypass',createdIds:[]}));q.approve('setting');q.result({requestId:'setting',status:'executed',message:'Installed',createdIds:[]});a.equal(q.history().at(-1).request.stance,'prone');
 now=2000;a.throws(()=>q.submit({...target,requestId:'formation',kind:'ai-formation',formation:'wedge'}),/advertised/);a.throws(()=>q.submit({...target,requestId:'fire',kind:'ai-combat-mode',combatMode:'hold-fire'}),/advertised/);
});
